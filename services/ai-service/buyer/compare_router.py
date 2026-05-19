"""
ZekAI Compare Verdict - Gemini destekli urun karsilastirma.

Akis:
  1. Frontend 2-3 urunun ozet verisini + kullanicinin karsilastirma ihtiyacini gonderir.
  2. Tek Gemini call ile her urun bu ihtiyaca gore degerlendirilir.
  3. Kazanan, per-urun aciklama ve opsiyonel uyari SSE ile donulur.
"""

import asyncio
import json
import os
from typing import Any, AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types
from pydantic import BaseModel, Field, ValidationError

router = APIRouter()

COMPARE_MODEL = os.getenv("COMPARE_MODEL", "gemini-2.5-flash-lite")
COMPARE_TIMEOUT_SECONDS = int(os.getenv("COMPARE_TIMEOUT_SECONDS", "30"))


# ── Request modelleri (Field constraints OK — Gemini'ye gitmiyor) ─────────────

class CompareProductInput(BaseModel):
    product_id: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=500)
    category: str = Field(default="", max_length=100)
    price: float = Field(ge=0)
    user_need_text: str = Field(default="", max_length=1000)
    fit_score: int = Field(default=0, ge=0, le=100)
    trust_score: int = Field(default=0, ge=0, le=100)
    price_score: int = Field(default=0, ge=0, le=100)
    return_risk_percent: int = Field(default=0, ge=0, le=100)


class CompareVerdictRequest(BaseModel):
    comparison_need: str = Field(min_length=1, max_length=1000)
    products: list[CompareProductInput] = Field(min_length=2, max_length=3)


# ── Gemini response schema (SIFIR constraint — "too many states" hatasini onler) ──

class _GeminiProductVerdict(BaseModel):
    product_id: str = ""
    one_line_reason: str = ""
    relative_fit: str = "ok"  # "best" | "ok" | "skip"


class _GeminiCompareVerdict(BaseModel):
    winner_id: str = ""
    headline: str = ""
    winner_reason: str = ""
    caution: str = ""
    product_verdicts: list[_GeminiProductVerdict] = Field(default_factory=list)


# ── Uygulama modelleri (parse sonrasi normalize edilmis) ──────────────────────

class ProductVerdict(BaseModel):
    product_id: str
    one_line_reason: str = ""
    relative_fit: str = "ok"


class CompareVerdictResult(BaseModel):
    winner_id: str = ""
    headline: str = ""
    winner_reason: str = ""
    caution: str | None = None
    product_verdicts: list[ProductVerdict] = Field(default_factory=list)


# ── Yardimci fonksiyonlar ─────────────────────────────────────────────────────

def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise ValueError("GOOGLE_API_KEY tanimli degil.")
    return genai.Client(api_key=api_key)


def _sse(author: str, text: str = "", state_key: str | None = None, state_value: Any = None) -> str:
    payload: dict[str, Any] = {"author": author}
    if text:
        payload["content"] = {"parts": [{"text": text}]}
    if state_key and state_value is not None:
        payload["actions"] = {"state_delta": {state_key: state_value}}
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _error_sse(message: str) -> str:
    return f"data: {json.dumps({'type': 'error', 'message': message}, ensure_ascii=False)}\n\n"


def _is_retryable_gemini_error(exc: BaseException) -> bool:
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return True
    if not isinstance(exc, genai_errors.APIError):
        return False
    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    return code in (408, 429, 500, 502, 503, 504)


# ── Prompt ────────────────────────────────────────────────────────────────────

def _compare_prompt(req: CompareVerdictRequest) -> str:
    product_lines = "\n".join(
        f'- id: "{p.product_id}", urun: "{p.title}", '
        f'kategori: "{p.category or "Belirtilmemis"}", '
        f'fiyat: {p.price:.2f} TRY, '
        f'uygunluk: {p.fit_score}, guven: {p.trust_score}, '
        f'fiyat_skoru: {p.price_score}, iade_riski: %{p.return_risk_percent}, '
        f'orijinal_ihtiyac: "{p.user_need_text or "Belirtilmemis"}"'
        for p in req.products
    )
    return f"""
Sen ZekAI icin Turkce konusan bir urun karsilastirma danismanisin.
Gorev: kullanicinin SPESIFIK ihtiyacina gore hangi urunun en uygun oldugunu belirle.

KULLANICI KARSILASTIRMA IHTIYACI: "{req.comparison_need}"

DIL KURALLARI:
- one_line_reason: 1 cumle. "Bu urun..." diye basla. Bu ihtiyac icin neden uygun/uygun degil soy.
- headline: 4-6 kelime. Ornek: "Kampus Icin Net Kazanan"
- winner_reason: 1-2 cumle. Neden bu urun bu ihtiyac icin en iyisi.
- caution: Onemli bir dikkat noktasi varsa yaz, yoksa bos birak.
- Teknik skor aciklamasi, metrik, rakam yazma. Sade Turkce.

RELATIVE_FIT KURALLARI:
- "best": bu ihtiyac icin acikca en iyi secim — sadece 1 urun "best" olabilir
- "ok": makul alternatif, kabul edilebilir
- "skip": bu ihtiyac icin onerilmez

URUNLER:
{product_lines}

ONEMLI: Her urun icin product_id mutlaka verilen id ile TAM AYNI olsun.
""".strip()


# ── Gemini call ───────────────────────────────────────────────────────────────

def _run_compare_sync(client: genai.Client, req: CompareVerdictRequest) -> CompareVerdictResult:
    config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=_GeminiCompareVerdict,
        temperature=0.2,
    )
    response = client.models.generate_content(
        model=COMPARE_MODEL,
        contents=_compare_prompt(req),
        config=config,
    )
    raw = _GeminiCompareVerdict.model_validate_json(response.text or "{}")

    valid_fits = {"best", "ok", "skip"}
    return CompareVerdictResult(
        winner_id=raw.winner_id[:200] if raw.winner_id else "",
        headline=raw.headline[:60] if raw.headline else "ZekAI Karsilastirmasi",
        winner_reason=raw.winner_reason[:400] if raw.winner_reason else "",
        caution=raw.caution[:200] if raw.caution else None,
        product_verdicts=[
            ProductVerdict(
                product_id=pv.product_id[:200],
                one_line_reason=pv.one_line_reason[:300] if pv.one_line_reason else "",
                relative_fit=pv.relative_fit if pv.relative_fit in valid_fits else "ok",
            )
            for pv in raw.product_verdicts[:3]
        ],
    )


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post("/compare-verdict")
async def compare_verdict(req: CompareVerdictRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            client = _get_client()
        except ValueError as exc:
            yield _error_sse(str(exc))
            return

        yield _sse("compare_engine", "Ürünler karşılaştırılıyor...")

        try:
            result = await asyncio.wait_for(
                asyncio.to_thread(_run_compare_sync, client, req),
                timeout=COMPARE_TIMEOUT_SECONDS,
            )
        except (ValidationError, json.JSONDecodeError):
            yield _error_sse("Gemini karşılaştırma raporu üretemedi. Lütfen tekrar deneyin.")
            return
        except Exception as exc:
            msg = (
                "Gemini geçici olarak yanıt veremedi."
                if _is_retryable_gemini_error(exc)
                else "Karşılaştırma oluşturulamadı."
            )
            yield _error_sse(f"{msg} {str(exc)[:120]}")
            return

        yield _sse(
            "compare_engine",
            json.dumps(result.model_dump(), ensure_ascii=False),
            "compare_verdict",
            result.model_dump(),
        )

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
