"""
ZekAI Kombin Advisor - cost-aware Gemini workflow.

Default path:
  1. Local planner validates and normalizes the selected products.
  2. One structured Gemini advisor call evaluates fit, synergy, and missing pieces.
  3. Deterministic decision engine computes budget balance, order, and final scores.

The old implementation made five Gemini calls per request. This keeps the SSE
experience but only spends tokens where judgement is actually needed.
"""

import asyncio
import hashlib
import json
import os
import time
from typing import Any, AsyncGenerator, Literal

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types
from pydantic import BaseModel, Field, ValidationError

router = APIRouter()

ADVISOR_MODEL = os.getenv("KOMBIN_ADVISOR_MODEL", "gemini-2.5-flash-lite")
ADVISOR_TIMEOUT_SECONDS = int(os.getenv("KOMBIN_ADVISOR_TIMEOUT_SECONDS", "45"))
CACHE_TTL_SECONDS = int(os.getenv("KOMBIN_CACHE_TTL_SECONDS", "86400"))
MAX_CACHE_ITEMS = int(os.getenv("KOMBIN_MAX_CACHE_ITEMS", "256"))

_ANALYSIS_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}


class KombinProductInput(BaseModel):
    id: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=500)
    category: str = Field(default="", max_length=100)
    price: float = Field(ge=0)
    image_url: str | None = Field(default=None, max_length=1000)


class KombinAnalyzeRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=1000)
    budget: float = Field(ge=0)
    use_cases: list[str] = Field(default=[], max_length=12)
    priorities: list[str] = Field(default=[], max_length=12)
    style: list[str] = Field(default=[], max_length=12)
    products: list[KombinProductInput] = Field(min_length=1, max_length=20)


# ── Gemini response schema models (no constraints — Gemini rejects too many) ──
class _GeminiProductResult(BaseModel):
    product_id: str = ""
    role: str = "tamamlayici"
    fit_score: int = 50
    risk_score: int = 50
    ai_comment: str = ""
    pairs_well_with: list[str] = Field(default_factory=list)


class _GeminiSuggestion(BaseModel):
    title: str = ""
    reason: str = ""


class _GeminiAdvisorReport(BaseModel):
    need_fit_score: int = 50
    part_fit_score: int = 50
    risk_score: int = 50
    headline: str = ""
    summary: str = ""
    missing_piece: str = ""
    warning_item: str = ""
    suggestions: list[_GeminiSuggestion] = Field(default_factory=list)
    product_results: list[_GeminiProductResult] = Field(default_factory=list)


# ── Application-level models (used after parsing for downstream logic) ────────
class ProductAdvisorResult(BaseModel):
    product_id: str
    role: Literal["ana", "tamamlayici", "opsiyonel"] = "tamamlayici"
    fit_score: int = Field(ge=0, le=100)
    risk_score: int = Field(ge=0, le=100)
    ai_comment: str = ""
    pairs_well_with: list[str] = Field(default_factory=list)


class KombinSuggestion(BaseModel):
    title: str = ""
    reason: str = ""


class KombinAdvisorReport(BaseModel):
    need_fit_score: int
    part_fit_score: int
    risk_score: int
    headline: str
    summary: str
    missing_piece: str | None = None
    warning_item: str | None = None
    suggestions: list[KombinSuggestion] = Field(default_factory=list)
    product_results: list[ProductAdvisorResult] = Field(default_factory=list)


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


def _stage_sse(agent: str, status: Literal["running", "done"], label: str) -> str:
    return _sse(
        agent,
        label,
        "kombin_stage",
        {"agent": agent, "status": status, "label": label},
    )


def _product_list_text(req: KombinAnalyzeRequest) -> str:
    return "\n".join(
        f"- id: \"{p.id}\", urun: \"{p.title}\", kategori: \"{p.category or 'Belirtilmemis'}\", fiyat: {p.price:.2f} TRY"
        for p in req.products
    )


def _cache_key(req: KombinAnalyzeRequest) -> str:
    payload = {
        "goal": req.goal.strip().lower(),
        "budget": round(req.budget, 2),
        "use_cases": sorted(item.strip().lower() for item in req.use_cases),
        "priorities": sorted(item.strip().lower() for item in req.priorities),
        "style": sorted(item.strip().lower() for item in req.style),
        "products": sorted(
            [
                {
                    "id": p.id,
                    "title": p.title.strip().lower(),
                    "category": p.category.strip().lower(),
                    "price": round(p.price, 2),
                }
                for p in req.products
            ],
            key=lambda item: (item["id"], item["title"], item["price"]),
        ),
    }
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _get_cached_result(key: str) -> dict[str, Any] | None:
    cached = _ANALYSIS_CACHE.get(key)
    if not cached:
        return None
    created_at, result = cached
    if time.time() - created_at > CACHE_TTL_SECONDS:
        _ANALYSIS_CACHE.pop(key, None)
        return None
    return {**result, "cached": True}


def _save_cached_result(key: str, result: dict[str, Any]) -> None:
    if len(_ANALYSIS_CACHE) >= MAX_CACHE_ITEMS:
        oldest_key = min(_ANALYSIS_CACHE.items(), key=lambda item: item[1][0])[0]
        _ANALYSIS_CACHE.pop(oldest_key, None)
    _ANALYSIS_CACHE[key] = (time.time(), {**result, "cached": False})


def _budget_balance_score(total: float, budget: float) -> int:
    if budget <= 0:
        return 55 if total <= 0 else 30
    ratio = total / budget
    if ratio <= 0.75:
        return 92
    if ratio <= 0.95:
        return 84
    if ratio <= 1.0:
        return 76
    if ratio <= 1.15:
        return 58
    if ratio <= 1.35:
        return 42
    return 25


def _budget_warning(total: float, budget: float) -> str | None:
    if budget <= 0:
        return "Butce belirtilmedigi icin fiyat dengesini sinirli yorumladim."
    if total > budget:
        return f"Secilen urunler butceyi yaklasik {total - budget:.0f} TL asiyor."
    if total > budget * 0.9:
        return "Butcenin buyuk kismi kullaniliyor; opsiyonel parcalari sona birakmak daha mantikli."
    return None


def _deterministic_purchase_order(req: KombinAnalyzeRequest, advisor: KombinAdvisorReport) -> list[str]:
    role_weight = {"ana": 0, "tamamlayici": 1, "opsiyonel": 2}
    by_id = {item.product_id: item for item in advisor.product_results}
    return [
        product.id
        for product in sorted(
            req.products,
            key=lambda p: (
                role_weight.get(by_id.get(p.id).role if by_id.get(p.id) else "tamamlayici", 1),
                -(by_id.get(p.id).fit_score if by_id.get(p.id) else 70),
                p.price,
            ),
        )
    ]


def _normalize_product_results(
    req: KombinAnalyzeRequest,
    advisor: KombinAdvisorReport,
) -> list[dict[str, Any]]:
    advisor_by_id = {item.product_id: item for item in advisor.product_results}
    normalized: list[dict[str, Any]] = []

    for index, product in enumerate(req.products):
        item = advisor_by_id.get(product.id)
        if item:
            normalized.append(
                {
                    "productId": product.id,
                    "role": item.role,
                    "fitScore": item.fit_score,
                    "riskScore": item.risk_score,
                    "aiComment": item.ai_comment,
                    "pairsWellWith": [pid for pid in item.pairs_well_with if pid != product.id],
                }
            )
            continue

        normalized.append(
            {
                "productId": product.id,
                "role": "ana" if index == 0 else "tamamlayici",
                "fitScore": 70,
                "riskScore": 30,
                "aiComment": "Bu parca kombin icinde temel sinyallere gore uygun gorunuyor.",
                "pairsWellWith": [],
            }
        )

    return normalized


def _build_live_scores(req: KombinAnalyzeRequest, advisor: KombinAdvisorReport | None = None) -> dict[str, int]:
    total = sum(product.price for product in req.products)
    budget = _budget_balance_score(total, req.budget)
    if advisor is None:
        return {
            "overall": 25,
            "need_fit": 0,
            "part_fit": 0,
            "budget_balance": budget,
            "risk": 0,
        }

    overall = round(
        advisor.need_fit_score * 0.42
        + advisor.part_fit_score * 0.34
        + budget * 0.18
        + (100 - advisor.risk_score) * 0.06
    )
    return {
        "overall": max(0, min(100, overall)),
        "need_fit": advisor.need_fit_score,
        "part_fit": advisor.part_fit_score,
        "budget_balance": budget,
        "risk": advisor.risk_score,
    }


def _advisor_prompt(req: KombinAnalyzeRequest) -> str:
    total = sum(product.price for product in req.products)
    return f"""
Sen ZekAI icin Turkce konusan bir kombin danismanisin.
Gorevin: secilen urunlerin kullanicinin amacina birlikte uyup uymadigini degerlendirmek.

DIL KURALLARI (cok onemli):
- Her cumle kisa ve net olsun. Kullanici yorulmasin.
- ai_comment icin maksimum 1 cumle yaz. "Bu urun..." diye basla, ne ise yaradigini soyله.
- headline: 4-6 kelime, direkt. Ornek: "Kampus icin Dengeli Kombin"
- summary: 2 cumle max. Ne iyi, ne eksik — hepsi bu.
- Teknik kelime, metrik, skor aciklamasi yazma.
- Turkce yaz, samimi ol.

ROL KURALLARI:
- "ana": kombinin olmaz olmazi, hedef buna gore sekilleniyor (sadece 1 urun)
- "tamamlayici": ana urunu destekleyen, gerekli parcalar
- "opsiyonel": olsa guzel ama olmasa da olur

SKOR KURALLARI:
- Emin degilsen 65-75 bandinda kal.
- Eksik parca sadece gercekten onemli bir sey yoksa yaz.
- Her urun icin product_id mutlaka verilen id ile TAM AYNI olsun.
- Satin alma sirasi verme.

Hedef: {req.goal}
Butce: {req.budget:.2f} TRY
Toplam urun bedeli: {total:.2f} TRY
Kullanim amaci: {", ".join(req.use_cases) or "Belirtilmemis"}
Oncelikler: {", ".join(req.priorities) or "Belirtilmemis"}
Tarz: {", ".join(req.style) or "Belirtilmemis"}

Urunler:
{_product_list_text(req)}
""".strip()


def _run_advisor_sync(client: genai.Client, req: KombinAnalyzeRequest) -> KombinAdvisorReport:
    config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=_GeminiAdvisorReport,
        temperature=0.25,
    )
    response = client.models.generate_content(
        model=ADVISOR_MODEL,
        contents=_advisor_prompt(req),
        config=config,
    )
    raw = _GeminiAdvisorReport.model_validate_json(response.text or "{}")
    return KombinAdvisorReport(
        need_fit_score=max(0, min(100, raw.need_fit_score)),
        part_fit_score=max(0, min(100, raw.part_fit_score)),
        risk_score=max(0, min(100, raw.risk_score)),
        headline=raw.headline[:80] if raw.headline else "Kombin Analizi",
        summary=raw.summary[:420] if raw.summary else "",
        missing_piece=raw.missing_piece[:180] if raw.missing_piece else None,
        warning_item=raw.warning_item[:180] if raw.warning_item else None,
        suggestions=[KombinSuggestion(title=s.title[:120], reason=s.reason[:200]) for s in raw.suggestions[:2]],
        product_results=[
            ProductAdvisorResult(
                product_id=p.product_id,
                role=p.role if p.role in ("ana", "tamamlayici", "opsiyonel") else "tamamlayici",
                fit_score=max(0, min(100, p.fit_score)),
                risk_score=max(0, min(100, p.risk_score)),
                ai_comment=p.ai_comment[:220] if p.ai_comment else "",
                pairs_well_with=p.pairs_well_with[:5],
            )
            for p in raw.product_results[:20]
        ],
    )


def _build_final_result(req: KombinAnalyzeRequest, advisor: KombinAdvisorReport) -> dict[str, Any]:
    live = _build_live_scores(req, advisor)
    total = sum(product.price for product in req.products)
    budget_warning = _budget_warning(total, req.budget)
    product_results = _normalize_product_results(req, advisor)

    result = {
        "model": ADVISOR_MODEL,
        "cached": False,
        "scores": {
            "overall": live["overall"],
            "needFit": live["need_fit"],
            "partFit": live["part_fit"],
            "budgetBalance": live["budget_balance"],
            "risk": live["risk"],
        },
        "headline": advisor.headline,
        "summary": advisor.summary,
        "productResults": product_results,
        "missingPiece": advisor.missing_piece,
        "warningItem": advisor.warning_item or budget_warning,
        "purchaseOrder": _deterministic_purchase_order(req, advisor),
        "suggestions": [
            {
                "title": item.title[:120],
                "reason": item.reason[:220],
            }
            for item in advisor.suggestions[:2]
            if item.title
        ],
    }

    if live["overall"] >= 78:
        result["decision"] = "al"
    elif live["overall"] >= 60:
        result["decision"] = "dusun"
    else:
        result["decision"] = "alma"

    return result


def _is_retryable_gemini_error(exc: BaseException) -> bool:
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return True
    if not isinstance(exc, genai_errors.APIError):
        return False
    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    return code in (408, 429, 500, 502, 503, 504)


@router.post("/kombin-analyze")
async def kombin_analyze(req: KombinAnalyzeRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        cache_key = _cache_key(req)
        cached_result = _get_cached_result(cache_key)
        if cached_result:
            yield _stage_sse("cache", "done", "Ayni kombin daha once analiz edilmis; kayitli sonuc kullaniliyor.")
            yield _sse("decision_engine", "", "partial_scores", {
                "overall": cached_result["scores"]["overall"],
                "need_fit": cached_result["scores"]["needFit"],
                "part_fit": cached_result["scores"]["partFit"],
                "budget_balance": cached_result["scores"]["budgetBalance"],
                "risk": cached_result["scores"]["risk"],
            })
            yield _sse(
                "decision_engine",
                json.dumps(cached_result, ensure_ascii=False),
                "kombin_result",
                cached_result,
            )
            return

        try:
            client = _get_client()
        except ValueError as exc:
            yield _error_sse(str(exc))
            return

        yield _stage_sse("kombin_planner", "running", "Urunler ve butce hazirlaniyor...")
        initial_scores = _build_live_scores(req)
        yield _sse("kombin_planner", "", "partial_scores", initial_scores)
        yield _stage_sse("kombin_planner", "done", "Urun listesi ve butce hazirlandi.")

        yield _stage_sse("fit_advisor", "running", "Kombinin ihtiyaca ve tarza uyumu degerlendiriliyor...")
        try:
            advisor = await asyncio.wait_for(
                asyncio.to_thread(_run_advisor_sync, client, req),
                timeout=ADVISOR_TIMEOUT_SECONDS,
            )
        except (ValidationError, json.JSONDecodeError):
            yield _error_sse("Gemini beklenen kombin raporunu uretmedi. Lutfen tekrar deneyin.")
            return
        except Exception as exc:
            msg = "Gemini gecici olarak yanit veremedi." if _is_retryable_gemini_error(exc) else "Kombin analizi olusturulamadi."
            yield _error_sse(f"{msg} {str(exc)[:120]}")
            return

        yield _stage_sse("fit_advisor", "done", "Kombin uyumu degerlendirildi.")
        yield _sse(
            "fit_advisor",
            json.dumps(advisor.model_dump(), ensure_ascii=False),
            "kombin_advisor",
            advisor.model_dump(),
        )

        live_scores = _build_live_scores(req, advisor)
        yield _stage_sse("decision_engine", "running", "Butce, risk ve satin alma sirasi hesaplaniyor...")
        yield _sse("decision_engine", "", "partial_scores", live_scores)

        final_result = _build_final_result(req, advisor)
        _save_cached_result(cache_key, final_result)

        yield _stage_sse("decision_engine", "done", "Kombin raporu hazir.")
        yield _sse(
            "decision_engine",
            json.dumps(final_result, ensure_ascii=False),
            "kombin_result",
            final_result,
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
