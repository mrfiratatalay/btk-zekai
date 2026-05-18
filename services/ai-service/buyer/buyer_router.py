"""
Zekai Buyer Analysis — 4-Agent Native Gemini SDK + SSE Streaming

Agent flow:
  1. Need Parser  (LLM)           → ihtiyaç profili
  2. Price Tracker (Search Grounding) → fiyat sinyali   ┐ parallel
  3. Review Miner (LLM on reviews)    → yorum analizi   │
  4. Visual Analyzer (Vision)         → görsel analizi  ┘
  5. Synthesizer   (LLM)           → final verdict + VerifiedReport
"""

import asyncio
import json
import os
import re
import urllib.request
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types as genai_types
from google.genai import errors as genai_errors
from pydantic import BaseModel

from mock.responses import (
    is_rate_limit,
    MOCK_BUYER_NEED_PROFILE,
    MOCK_BUYER_PRICE_ANALYSIS,
    MOCK_BUYER_REVIEW_ANALYSIS,
    MOCK_BUYER_VISUAL_ANALYSIS,
    MOCK_BUYER_FINAL_REPORT,
)

router = APIRouter()

MODEL = "gemini-2.5-flash"


# ── Pydantic models ────────────────────────────────────────────────────────────

class ReviewItem(BaseModel):
    id: str
    rating: int
    comment: str
    userName: str | None = None


class BuyerAnalyzeRequest(BaseModel):
    product_id: str
    product_title: str
    product_category: str
    product_price: float
    product_description: str | None = None
    product_features: list[str] = []
    product_image_url: str | None = None
    product_rating: float = 0.0
    product_review_count: int = 0
    buyer_need: str
    reviews: list[ReviewItem] = []


# ── Gemini client ──────────────────────────────────────────────────────────────

def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise ValueError("GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


# ── SSE helper ─────────────────────────────────────────────────────────────────

def _sse(author: str, text: str = "", state_key: str | None = None, state_value=None) -> str:
    payload: dict = {"author": author}
    if text:
        payload["content"] = {"parts": [{"text": text}]}
    if state_key and state_value is not None:
        payload["actions"] = {"state_delta": {state_key: state_value}}
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _extract_json(text: str) -> dict:
    """Try to parse JSON from text, even when wrapped in markdown code blocks."""
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


# ── Agent 1: Need Parser ──────────────────────────────────────────────────────

def _run_need_parser_sync(client: genai.Client, req: BuyerAnalyzeRequest) -> dict:
    prompt = f"""Bir alıcı analiz uzmanısın. Kullanıcının ihtiyaç metnini yapılandırılmış profile dönüştür.

Ürün: {req.product_title} ({req.product_category}) — ₺{req.product_price:.0f}
Alıcı ihtiyacı: {req.buyer_need}

Sadece JSON döndür:
{{
  "primary_use_cases": ["..."],
  "must_have_features": ["..."],
  "key_concerns": ["..."],
  "experience_level": "beginner|intermediate|expert",
  "summary": "2-3 cümle ihtiyaç özeti"
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {"summary": req.buyer_need, "key_concerns": []}
    except genai_errors.APIError:
        raise  # rate limit ve diğer API hatalarını yukarı ilet
    except Exception as exc:
        return {"summary": req.buyer_need, "key_concerns": [], "error": str(exc)[:100]}


# ── Agent 2: Price Tracker (Google Search Grounding) ─────────────────────────

def _run_price_tracker_sync(client: genai.Client, req: BuyerAnalyzeRequest) -> dict:
    prompt = f"""Türkiye e-ticaret piyasasında "{req.product_title}" ({req.product_category}) ürününün fiyat araştırmasını yap.
Mevcut fiyat: ₺{req.product_price:.0f}

Bu fiyatın makullüğünü değerlendirip sadece şu JSON'u döndür:
{{
  "price_assessment": "ucuz|makul|pahalı",
  "market_context": "piyasa bağlamını açıkla",
  "price_fairness_score": 0-100,
  "comment": "kısa yorum"
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={
                "tools": [genai_types.Tool(google_search=genai_types.GoogleSearch())],
            },
        )
        return _extract_json(resp.text) or {
            "price_assessment": "makul",
            "price_fairness_score": 60,
            "comment": resp.text[:200] if resp.text else "Fiyat bilgisi alınamadı.",
            "market_context": "",
        }
    except Exception as exc:
        return {
            "price_assessment": "bilinmiyor",
            "price_fairness_score": 50,
            "comment": f"Arama yapılamadı: {str(exc)[:100]}",
            "market_context": "",
        }


# ── Agent 3: Review Miner ─────────────────────────────────────────────────────

def _run_review_miner_sync(client: genai.Client, req: BuyerAnalyzeRequest) -> dict:
    if not req.reviews:
        return {
            "total_analyzed": 0,
            "average_rating": req.product_rating,
            "top_complaints": [],
            "top_praises": [],
            "recurring_issues": [],
            "sentiment_summary": (
                f"Yorum metni mevcut değil. "
                f"{req.product_review_count} yorum, ortalama {req.product_rating:.1f}/5.0 puan."
            ),
            "reliability_signal": "insufficient_data",
        }

    reviews_text = "\n".join(
        [f"- ({r.rating}/5) {r.comment}" for r in req.reviews[:25]]
    )
    prompt = f"""Şu ürün yorumlarını analiz et ve pattern'leri bul:

Ürün: {req.product_title}
Yorumlar:
{reviews_text}

Sadece JSON döndür:
{{
  "total_analyzed": {len(req.reviews)},
  "average_rating": 0.0,
  "sentiment_breakdown": {{"positive": 0, "neutral": 0, "negative": 0}},
  "top_complaints": ["..."],
  "top_praises": ["..."],
  "recurring_issues": ["..."],
  "sentiment_summary": "...",
  "reliability_signal": "strong|moderate|weak|insufficient_data"
}}"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {
            "sentiment_summary": resp.text[:200],
            "reliability_signal": "moderate",
            "total_analyzed": len(req.reviews),
        }
    except Exception as exc:
        return {
            "sentiment_summary": f"Yorum analizi başarısız: {str(exc)[:100]}",
            "reliability_signal": "insufficient_data",
            "total_analyzed": 0,
        }


# ── Agent 4: Visual Analyzer ──────────────────────────────────────────────────

def _fetch_image_bytes(url: str) -> tuple[bytes, str]:
    """Fetch image bytes from URL using stdlib (no extra deps)."""
    req = urllib.request.Request(url, headers={"User-Agent": "ZekaiBot/1.0"})
    with urllib.request.urlopen(req, timeout=8) as resp:
        content_type = resp.headers.get("Content-Type", "image/jpeg").split(";")[0]
        return resp.read(), content_type


def _run_visual_analyzer_sync(client: genai.Client, req: BuyerAnalyzeRequest) -> dict:
    if not req.product_image_url:
        return {
            "image_quality": "unknown",
            "matches_description": True,
            "red_flags": [],
            "visual_assessment": "Görsel URL mevcut değil, görsel analiz atlandı.",
            "score": 50,
        }

    try:
        image_bytes, mime_type = _fetch_image_bytes(req.product_image_url)
        resp = client.models.generate_content(
            model=MODEL,
            contents=[
                genai_types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                f"""Bu ürün görseli: "{req.product_title}" ({req.product_category})

Görseli değerlendir:
1. Görsel kalitesi ve profesyonelliği
2. Ürün açıklamasıyla uyumu
3. Sahte/yanlış temsil sinyalleri

Sadece JSON döndür:
{{
  "image_quality": "poor|fair|good|excellent",
  "matches_description": true/false,
  "red_flags": ["..."],
  "visual_assessment": "kısa değerlendirme",
  "score": 0-100
}}""",
            ],
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(resp.text) or {
            "image_quality": "fair",
            "matches_description": True,
            "red_flags": [],
            "visual_assessment": resp.text[:200] if resp.text else "Analiz tamamlandı.",
            "score": 65,
        }
    except Exception as exc:
        return {
            "image_quality": "unknown",
            "matches_description": True,
            "red_flags": [],
            "visual_assessment": f"Görsel analiz yapılamadı: {str(exc)[:100]}",
            "score": 50,
        }


# ── Agent 5: Synthesizer ──────────────────────────────────────────────────────

def _run_synthesizer_sync(
    client: genai.Client,
    req: BuyerAnalyzeRequest,
    need_profile: dict,
    price_analysis: dict,
    review_analysis: dict,
    visual_analysis: dict,
) -> dict:
    prompt = f"""Sen bir e-ticaret alım danışmanısın. Aşağıdaki analizleri birleştirip net bir final karar ver.

ÜRÜN: {req.product_title} ({req.product_category}) — ₺{req.product_price:.0f}
ALICI İHTİYACI: {req.buyer_need}

İHTİYAÇ PROFİLİ: {json.dumps(need_profile, ensure_ascii=False)}
FİYAT ANALİZİ: {json.dumps(price_analysis, ensure_ascii=False)}
YORUM ANALİZİ: {json.dumps(review_analysis, ensure_ascii=False)}
GÖRSEL ANALİZ: {json.dumps(visual_analysis, ensure_ascii=False)}

Türkçe, kanıta dayalı bir final karar ver. Sadece JSON döndür:
{{
  "verified_fit_score": 0-100,
  "verified_trust_score": 0-100,
  "verified_price_fairness_score": 0-100,
  "verified_return_risk_percent": 0-100,
  "final_recommendation": "buy|consider|avoid",
  "final_summary": "2-3 cümle net gerekçe (Türkçe)",
  "verified_warnings": [
    {{"warning": "...", "evidence": "...", "confidence": "high|medium|low"}}
  ],
  "verified_strengths": [
    {{"strength": "...", "evidence": "...", "confidence": "high|medium|low"}}
  ],
  "unverified_claims": [],
  "user_dependent_claims": [],
  "verification_quality": "high|medium|low"
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

    return {
        "final_recommendation": "consider",
        "final_summary": "Analiz tamamlandı. Ürünü satın almadan önce müşteri yorumlarını dikkatlice inceleyin.",
        "verified_fit_score": 60,
        "verified_trust_score": 60,
        "verified_price_fairness_score": 60,
        "verified_return_risk_percent": 30,
        "verified_warnings": [],
        "verified_strengths": [],
        "unverified_claims": [],
        "user_dependent_claims": [],
        "verification_quality": "low",
    }


# ── Mock SSE Stream ────────────────────────────────────────────────────────────

async def _mock_buyer_event_stream(req: BuyerAnalyzeRequest) -> AsyncGenerator[str, None]:
    """Rate limit aşıldığında pre-built mock verilerle SSE stream üretir."""
    yield f"data: {json.dumps({'type': 'mock_notice'}, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.2)

    yield _sse("need_understanding", "İhtiyaç profili analiz ediliyor... (demo mod)")
    await asyncio.sleep(0.6)
    need_profile = {**MOCK_BUYER_NEED_PROFILE, "summary": f"Demo mod: {req.buyer_need[:80]}"}
    yield _sse("need_understanding", json.dumps(need_profile, ensure_ascii=False), "ihtiyac_profili", need_profile)

    yield _sse("price_market", "Fiyat araştırması yapılıyor... (demo mod)")
    yield _sse("review_mining", "Yorumlar analiz ediliyor... (demo mod)")
    yield _sse("visual_forensics", "Görsel analiz yapılıyor... (demo mod)")
    await asyncio.sleep(1.2)

    price_analysis = {**MOCK_BUYER_PRICE_ANALYSIS}
    review_analysis = {**MOCK_BUYER_REVIEW_ANALYSIS, "average_rating": req.product_rating}
    visual_analysis = {**MOCK_BUYER_VISUAL_ANALYSIS}

    yield _sse("price_market", json.dumps(price_analysis, ensure_ascii=False), "fiyat_analizi", price_analysis)
    yield _sse("review_mining", json.dumps(review_analysis, ensure_ascii=False), "yorum_analizi", review_analysis)
    yield _sse("visual_forensics", json.dumps(visual_analysis, ensure_ascii=False), "gorsel_analizi", visual_analysis)

    await asyncio.sleep(0.8)
    yield _sse("risk_synthesis", "Tüm veriler birleştiriliyor... (demo mod)")
    await asyncio.sleep(0.6)

    final_report = {**MOCK_BUYER_FINAL_REPORT}
    yield _sse("verification", json.dumps(final_report, ensure_ascii=False), "final_rapor", final_report)


# ── SSE Streaming Endpoint ────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_for_buyer(req: BuyerAnalyzeRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            client = _get_client()
        except ValueError as exc:
            yield _sse("error", str(exc))
            return

        # ── Agent 1: Need Parser — rate limit burada ilk tetiklenir ──────────
        yield _sse("need_understanding", "İhtiyaç profili analiz ediliyor...")
        try:
            need_profile = await asyncio.to_thread(_run_need_parser_sync, client, req)
        except genai_errors.APIError as exc:
            if is_rate_limit(exc):
                async for event in _mock_buyer_event_stream(req):
                    yield event
                return
            yield _sse("error", f"API hatası: {str(exc)[:120]}")
            return

        yield _sse(
            "need_understanding",
            json.dumps(need_profile, ensure_ascii=False),
            "ihtiyac_profili",
            need_profile,
        )

        # ── Agent 2-4: Parallel ───────────────────────────────────────────────
        yield _sse("price_market", "Fiyat araştırması yapılıyor...")
        yield _sse("review_mining", "Yorumlar analiz ediliyor...")
        yield _sse("visual_forensics", "Görsel analiz yapılıyor...")

        price_task = asyncio.to_thread(_run_price_tracker_sync, client, req)
        review_task = asyncio.to_thread(_run_review_miner_sync, client, req)
        visual_task = asyncio.to_thread(_run_visual_analyzer_sync, client, req)

        results = await asyncio.gather(price_task, review_task, visual_task, return_exceptions=True)

        price_analysis = results[0] if not isinstance(results[0], Exception) else {
            "price_fairness_score": 50, "comment": str(results[0])[:100], "price_assessment": "bilinmiyor", "market_context": "",
        }
        review_analysis = results[1] if not isinstance(results[1], Exception) else {
            "sentiment_summary": str(results[1])[:100], "reliability_signal": "insufficient_data", "total_analyzed": 0,
        }
        visual_analysis = results[2] if not isinstance(results[2], Exception) else {
            "visual_assessment": str(results[2])[:100], "score": 50, "matches_description": True, "red_flags": [],
        }

        yield _sse(
            "price_market",
            json.dumps(price_analysis, ensure_ascii=False),
            "fiyat_analizi",
            price_analysis,
        )
        yield _sse(
            "review_mining",
            json.dumps(review_analysis, ensure_ascii=False),
            "yorum_analizi",
            review_analysis,
        )
        yield _sse(
            "visual_forensics",
            json.dumps(visual_analysis, ensure_ascii=False),
            "gorsel_analizi",
            visual_analysis,
        )

        # ── Agent 5: Synthesizer ──────────────────────────────────────────────
        yield _sse("risk_synthesis", "Tüm veriler birleştiriliyor ve nihai karar üretiliyor...")

        final_report = await asyncio.to_thread(
            _run_synthesizer_sync,
            client,
            req,
            need_profile,
            price_analysis,
            review_analysis,
            visual_analysis,
        )

        # Final event — frontend extracts from actions.state_delta.final_rapor
        yield _sse(
            "verification",
            json.dumps(final_report, ensure_ascii=False),
            "final_rapor",
            final_report,
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
