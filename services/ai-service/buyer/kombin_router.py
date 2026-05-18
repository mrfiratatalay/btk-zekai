"""
ZekAI Kombin Danışmanı — 5-Agent Native Gemini SDK + SSE Streaming

Agent flow:
  1. Goal Parser    (LLM) → hedef analizi, ihtiyaç listesi
  2. Product Fit    (LLM) → her ürün için hedefe uyum skoru   ┐ parallel
  3. Synergy        (LLM) → ürünler arası uyum/sinerji analizi │
  4. Budget         (LLM) → bütçe dengesi, öncelik sırası      ┘
  5. Synthesizer    (LLM) → final kombin skoru + öneriler
"""

import asyncio
import json
import os
import re
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field

from mock.responses import is_mockable_gemini_error

router = APIRouter()
MODEL = "gemini-2.5-flash"


# ── Models ─────────────────────────────────────────────────────────────────────

class KombinProductInput(BaseModel):
    id: str = Field(min_length=1, max_length=200)
    title: str = Field(min_length=1, max_length=500)
    category: str = Field(default="", max_length=100)
    price: float = Field(ge=0)
    image_url: str | None = Field(default=None, max_length=1000)


class KombinAnalyzeRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=1000)
    budget: float = Field(ge=0)
    use_cases: list[str] = Field(default=[])
    priorities: list[str] = Field(default=[])
    style: list[str] = Field(default=[])
    products: list[KombinProductInput] = Field(min_length=1, max_length=20)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise ValueError("GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _sse(author: str, text: str = "", state_key: str | None = None, state_value=None) -> str:
    payload: dict = {"author": author}
    if text:
        payload["content"] = {"parts": [{"text": text}]}
    if state_key and state_value is not None:
        payload["actions"] = {"state_delta": {state_key: state_value}}
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _extract_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass
        return {}


def _product_list_text(req: KombinAnalyzeRequest) -> str:
    return "\n".join(
        f"- {p.title} ({p.category or 'Kategori yok'}) — ₺{p.price:.0f}"
        for p in req.products
    )


# ── Agent 1: Goal Parser ───────────────────────────────────────────────────────

def _run_goal_parser_sync(client: genai.Client, req: KombinAnalyzeRequest) -> dict:
    prompt = f"""Bir kombin danışmanısın. Kullanıcının hedef metnini ve bütçesini analiz et.

Hedef: {req.goal}
Bütçe: ₺{req.budget:.0f}
Kullanım Amacı: {", ".join(req.use_cases) or "Belirtilmemiş"}
Öncelikler: {", ".join(req.priorities) or "Belirtilmemiş"}
Tarz: {", ".join(req.style) or "Belirtilmemiş"}

Ürünler:
{_product_list_text(req)}

Sadece JSON döndür:
{{
  "core_needs": ["..."],
  "missing_categories": ["..."],
  "use_context": "kısa kullanım bağlamı",
  "budget_pressure": "low|medium|high",
  "summary": "2 cümle hedef özeti"
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {"summary": req.goal, "missing_categories": []}
    except Exception as exc:
        return {"summary": req.goal, "missing_categories": [], "error": str(exc)[:100]}


# ── Agent 2: Product Fit ───────────────────────────────────────────────────────

def _run_product_fit_sync(client: genai.Client, req: KombinAnalyzeRequest) -> dict:
    product_lines = "\n".join(
        f'- id: "{p.id}", ürün: "{p.title}", kategori: "{p.category}", fiyat: ₺{p.price:.0f}'
        for p in req.products
    )
    prompt = f"""Her ürünün hedefe uyumunu değerlendir.

Hedef: {req.goal}
Bütçe: ₺{req.budget:.0f}
Öncelikler: {", ".join(req.priorities) or "-"}

Ürünler:
{product_lines}

Her ürün için fit_score (0-100), risk_score (0-100) ve kısa ai_comment döndür.
Sadece JSON döndür:
{{
  "products": [
    {{
      "product_id": "...",
      "fit_score": 0-100,
      "risk_score": 0-100,
      "role": "ana|tamamlayici|opsiyonel",
      "ai_comment": "kısa Türkçe yorum",
      "pairs_well_with": []
    }}
  ]
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {"products": []}
    except Exception as exc:
        return {"products": [], "error": str(exc)[:100]}


# ── Agent 3: Synergy ───────────────────────────────────────────────────────────

def _run_synergy_sync(client: genai.Client, req: KombinAnalyzeRequest) -> dict:
    prompt = f"""Bu ürün kombinasyonunu bir bütün olarak değerlendir.

Hedef: {req.goal}
Ürünler:
{_product_list_text(req)}

Kombinasyonun uyumunu, tekrarları ve eksiklikleri analiz et.
Sadece JSON döndür:
{{
  "part_fit_score": 0-100,
  "has_redundancy": true/false,
  "redundancy_note": "veya boş string",
  "missing_piece": "eksik parça önerisi veya boş string",
  "synergy_comment": "kısa uyum yorumu"
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {"part_fit_score": 70}
    except Exception as exc:
        return {"part_fit_score": 70, "error": str(exc)[:100]}


# ── Agent 4: Budget ────────────────────────────────────────────────────────────

def _run_budget_sync(client: genai.Client, req: KombinAnalyzeRequest) -> dict:
    total = sum(p.price for p in req.products)
    product_lines = "\n".join(
        f"- {p.title}: ₺{p.price:.0f}"
        for p in req.products
    )
    prompt = f"""Bütçe analizi yap.

Toplam bütçe: ₺{req.budget:.0f}
Toplam ürün bedeli: ₺{total:.0f}
Fark: ₺{req.budget - total:.0f}

Ürün fiyatları:
{product_lines}

Bütçe dengesini değerlendir ve öncelikli satın alma sırasını belirle.
Sadece JSON döndür:
{{
  "budget_balance_score": 0-100,
  "warning_item": "bütçeyi en çok zorlayan ürün adı veya boş",
  "purchase_order": ["product_id_1", "product_id_2", ...],
  "budget_comment": "kısa bütçe yorumu"
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {"budget_balance_score": 70, "purchase_order": []}
    except Exception as exc:
        return {"budget_balance_score": 70, "purchase_order": [], "error": str(exc)[:100]}


# ── Agent 5: Synthesizer ───────────────────────────────────────────────────────

def _run_synthesizer_sync(
    client: genai.Client,
    req: KombinAnalyzeRequest,
    goal_out: dict,
    fit_out: dict,
    synergy_out: dict,
    budget_out: dict,
) -> dict:
    # Derive overall scores
    product_scores = fit_out.get("products", [])
    avg_fit = (
        sum(p.get("fit_score", 70) for p in product_scores) / len(product_scores)
        if product_scores else 70
    )
    part_fit = synergy_out.get("part_fit_score", 70)
    budget_balance = budget_out.get("budget_balance_score", 70)

    prompt = f"""Tüm analiz sonuçlarını birleştirip final kombin değerlendirmesini yap.

HEDEF: {req.goal}
BÜTÇE: ₺{req.budget:.0f}

HEDEF ANALİZİ: {json.dumps(goal_out, ensure_ascii=False)}
ÜRÜN UYUMU: {json.dumps(fit_out, ensure_ascii=False)}
SİNERJİ: {json.dumps(synergy_out, ensure_ascii=False)}
BÜTÇE: {json.dumps(budget_out, ensure_ascii=False)}

Genel kombin skoru hesapla (ihtiyaç uyumu, parça uyumu, bütçe dengesi, risk faktörü).
Türkçe, samimi bir değerlendirme yap. Sadece JSON döndür:
{{
  "overall_score": 0-100,
  "need_fit_score": 0-100,
  "part_fit_score": 0-100,
  "budget_balance_score": 0-100,
  "risk_score": 0-100,
  "headline": "İyi bir kombin! veya kısa başlık",
  "summary": "2-3 cümle genel değerlendirme (Türkçe)",
  "missing_piece": "eksik parça önerisi veya null",
  "warning_item": "dikkat edilmesi gereken ürün/durum veya null",
  "purchase_order": ["product_id_1", ...],
  "suggestions": [
    {{"title": "Öneri ürün adı", "price": 0, "reason": "neden iyi gider"}}
  ],
  "product_results": [
    {{
      "product_id": "...",
      "role": "ana|tamamlayici|opsiyonel",
      "fit_score": 0-100,
      "risk_score": 0-100,
      "ai_comment": "...",
      "pairs_well_with": []
    }}
  ]
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        result = _extract_json(resp.text)
        if result:
            return result
    except Exception:
        pass

    # Fallback
    return {
        "overall_score": int(avg_fit * 0.45 + part_fit * 0.3 + budget_balance * 0.25),
        "need_fit_score": int(avg_fit),
        "part_fit_score": int(part_fit),
        "budget_balance_score": int(budget_balance),
        "risk_score": max(0, 100 - int(avg_fit)),
        "headline": "Analiz tamamlandı.",
        "summary": "Kombin analizi tamamlandı. Satın alma önceliğini göz önünde bulundur.",
        "missing_piece": synergy_out.get("missing_piece"),
        "warning_item": budget_out.get("warning_item"),
        "purchase_order": budget_out.get("purchase_order", [p.id for p in req.products]),
        "suggestions": [],
        "product_results": [
            {
                "product_id": p.get("product_id"),
                "role": p.get("role", "tamamlayici"),
                "fit_score": p.get("fit_score", 70),
                "risk_score": p.get("risk_score", 25),
                "ai_comment": p.get("ai_comment", ""),
                "pairs_well_with": [],
            }
            for p in product_scores
        ],
    }


# ── Mock stream ────────────────────────────────────────────────────────────────

async def _mock_kombin_stream(req: KombinAnalyzeRequest) -> AsyncGenerator[str, None]:
    yield f"data: {json.dumps({'type': 'mock_notice'}, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.2)

    total = sum(p.price for p in req.products)
    over_budget = total > req.budget

    for agent, label in [
        ("goal_parser", "Hedef analiz ediliyor... (demo mod)"),
        ("product_fit", "Ürün uyumu değerlendiriliyor... (demo mod)"),
        ("synergy", "Sinerji analizi yapılıyor... (demo mod)"),
        ("budget", "Bütçe dengesi hesaplanıyor... (demo mod)"),
    ]:
        yield _sse(agent, label)
        await asyncio.sleep(0.5)

    mock_product_results = [
        {
            "product_id": p.id,
            "role": "ana" if i == 0 else ("tamamlayici" if i == 1 else "opsiyonel"),
            "fit_score": 85 - i * 5,
            "risk_score": 20 + i * 3,
            "ai_comment": f"{p.title} bu kombinasyon için uygun.",
            "pairs_well_with": [],
        }
        for i, p in enumerate(req.products)
    ]

    purchase_order = [p.id for p in req.products]

    kombin_result = {
        "scores": {
            "overall": 78,
            "needFit": 85,
            "partFit": 80,
            "budgetBalance": 65 if over_budget else 80,
            "risk": 25,
        },
        "headline": "İyi bir kombin! (Demo Mod)",
        "summary": f"Demo modunda çalışıyor. Bütçe: ₺{req.budget:.0f}, Toplam: ₺{total:.0f}.",
        "productResults": mock_product_results,
        "missingPiece": "Küçük bir aksesuar kombinasyonu tamamlayabilir.",
        "warningItem": "Bütçeniz biraz zorlanabilir." if over_budget else None,
        "purchaseOrder": purchase_order,
        "suggestions": [],
    }

    yield _sse(
        "synthesizer",
        json.dumps(kombin_result, ensure_ascii=False),
        "kombin_result",
        kombin_result,
    )


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.post("/kombin-analyze")
async def kombin_analyze(req: KombinAnalyzeRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            client = _get_client()
        except ValueError as exc:
            yield _sse("error", str(exc))
            return

        # Agent 1: Goal Parser
        yield _sse("goal_parser", "Hedef analiz ediliyor...")
        try:
            goal_out = await asyncio.wait_for(
                asyncio.to_thread(_run_goal_parser_sync, client, req),
                timeout=45,
            )
        except asyncio.TimeoutError:
            goal_out = {"summary": req.goal, "missing_categories": []}
        except genai_errors.APIError as exc:
            if is_mockable_gemini_error(exc):
                async for event in _mock_kombin_stream(req):
                    yield event
                return
            yield _sse("error", f"API hatası: {str(exc)[:120]}")
            return

        yield _sse(
            "goal_parser",
            json.dumps(goal_out, ensure_ascii=False),
            "goal_analysis",
            goal_out,
        )

        # Partial live scores after goal parser
        partial_scores = {
            "partial_scores": {
                "overall": 30,
                "need_fit": goal_out.get("budget_pressure") == "low" and 75 or 60,
                "part_fit": 0,
                "budget_balance": 0,
                "risk": 0,
            }
        }
        yield _sse("goal_parser", "", "partial_scores", partial_scores["partial_scores"])

        # Agents 2-4: Parallel
        yield _sse("product_fit", "Ürün uyumu değerlendiriliyor...")
        yield _sse("synergy", "Sinerji analizi yapılıyor...")
        yield _sse("budget", "Bütçe dengesi hesaplanıyor...")

        fit_task = asyncio.wait_for(asyncio.to_thread(_run_product_fit_sync, client, req), timeout=45)
        synergy_task = asyncio.wait_for(asyncio.to_thread(_run_synergy_sync, client, req), timeout=45)
        budget_task = asyncio.wait_for(asyncio.to_thread(_run_budget_sync, client, req), timeout=45)

        results = await asyncio.gather(fit_task, synergy_task, budget_task, return_exceptions=True)

        fit_out = results[0] if not isinstance(results[0], Exception) else {"products": []}
        synergy_out = results[1] if not isinstance(results[1], Exception) else {"part_fit_score": 70}
        budget_out = results[2] if not isinstance(results[2], Exception) else {"budget_balance_score": 70, "purchase_order": []}

        yield _sse("product_fit", json.dumps(fit_out, ensure_ascii=False), "product_fit", fit_out)
        yield _sse("synergy", json.dumps(synergy_out, ensure_ascii=False), "synergy", synergy_out)
        yield _sse("budget", json.dumps(budget_out, ensure_ascii=False), "budget", budget_out)

        # Live scores update
        product_scores = fit_out.get("products", [])
        avg_fit = (
            sum(p.get("fit_score", 70) for p in product_scores) / len(product_scores)
            if product_scores else 70
        )
        live = {
            "overall": int(avg_fit * 0.5 + synergy_out.get("part_fit_score", 70) * 0.3 + budget_out.get("budget_balance_score", 70) * 0.2),
            "need_fit": int(avg_fit),
            "part_fit": synergy_out.get("part_fit_score", 70),
            "budget_balance": budget_out.get("budget_balance_score", 70),
            "risk": max(0, 100 - int(avg_fit)),
        }
        yield _sse("synergy", "", "partial_scores", live)

        # Agent 5: Synthesizer
        yield _sse("synthesizer", "Nihai kombin değerlendirmesi yapılıyor...")

        try:
            synth = await asyncio.wait_for(
                asyncio.to_thread(
                    _run_synthesizer_sync,
                    client,
                    req,
                    goal_out,
                    fit_out,
                    synergy_out,
                    budget_out,
                ),
                timeout=60,
            )
        except asyncio.TimeoutError:
            synth = {
                "overall_score": live["overall"],
                "need_fit_score": live["need_fit"],
                "part_fit_score": live["part_fit"],
                "budget_balance_score": live["budget_balance"],
                "risk_score": live["risk"],
                "headline": "Analiz tamamlandı.",
                "summary": "Kombinin genel uyumu iyi görünüyor.",
                "missing_piece": synergy_out.get("missing_piece"),
                "warning_item": budget_out.get("warning_item"),
                "purchase_order": budget_out.get("purchase_order", [p.id for p in req.products]),
                "suggestions": [],
                "product_results": [
                    {"product_id": p.id, "role": "tamamlayici", "fit_score": 70, "risk_score": 25, "ai_comment": "", "pairs_well_with": []}
                    for p in req.products
                ],
            }

        # Map synthesizer output to frontend KombinAnalysisResult shape
        kombin_result = {
            "scores": {
                "overall": synth.get("overall_score", live["overall"]),
                "needFit": synth.get("need_fit_score", live["need_fit"]),
                "partFit": synth.get("part_fit_score", live["part_fit"]),
                "budgetBalance": synth.get("budget_balance_score", live["budget_balance"]),
                "risk": synth.get("risk_score", live["risk"]),
            },
            "headline": synth.get("headline", "Analiz tamamlandı."),
            "summary": synth.get("summary", ""),
            "productResults": [
                {
                    "productId": pr.get("product_id", ""),
                    "role": pr.get("role", "tamamlayici"),
                    "fitScore": pr.get("fit_score", 70),
                    "riskScore": pr.get("risk_score", 25),
                    "aiComment": pr.get("ai_comment", ""),
                    "pairsWellWith": pr.get("pairs_well_with", []),
                }
                for pr in synth.get("product_results", [])
            ],
            "missingPiece": synth.get("missing_piece"),
            "warningItem": synth.get("warning_item"),
            "purchaseOrder": synth.get("purchase_order", [p.id for p in req.products]),
            "suggestions": synth.get("suggestions", []),
        }

        yield _sse(
            "synthesizer",
            json.dumps(kombin_result, ensure_ascii=False),
            "kombin_result",
            kombin_result,
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
