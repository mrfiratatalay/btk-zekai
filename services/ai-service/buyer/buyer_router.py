"""
Zekai Buyer Analysis — 5-Agent Native Gemini SDK + SSE Streaming

Agent flow:
  1. Need Parser        (LLM)                       → ihtiyaç profili
  2. Price Tracker      (LLM + GoogleSearch)        → fiyat sinyali        ┐
  3. Review Miner       (LLM, need-aware)           → yorum analizi        │ parallel
  4. Alternative Finder (LLM + GoogleSearch)        → daha iyi alternatif  ┘
  5. Synthesizer        (LLM)                       → skor + kanıt (verdict YOK)

Final verdict (Al / Düşün / Alternatife Bak) sentezleyici LLM'den GELMEZ;
decision_engine.decide(...) saf Python fonksiyonu ile deterministik üretilir.
"""

import asyncio
import json
import os
import re
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types as genai_types
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field, field_validator

from mock.responses import (
    is_mockable_gemini_error,
    MOCK_BUYER_NEED_PROFILE,
    MOCK_BUYER_PRICE_ANALYSIS,
    MOCK_BUYER_REVIEW_ANALYSIS,
    MOCK_BUYER_ALTERNATIVES,
    MOCK_BUYER_FINAL_REPORT,
)
from buyer.decision_engine import decide
from buyer.scoring_engine import calculate_price_fairness, calculate_return_risk

router = APIRouter()

MODEL = "gemini-2.5-flash"


# ── Pydantic models ────────────────────────────────────────────────────────────

class ReviewItem(BaseModel):
    id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(max_length=2000)
    userName: str | None = Field(default=None, max_length=100)


class BuyerAnalyzeRequest(BaseModel):
    product_id: str = Field(min_length=1, max_length=200)
    product_title: str = Field(min_length=1, max_length=500)
    product_category: str = Field(min_length=1, max_length=100)
    product_price: float = Field(ge=0)
    product_description: str | None = Field(default=None, max_length=5000)
    product_features: list[str] = Field(default=[], max_length=50)
    product_image_url: str | None = Field(default=None, max_length=1000)
    product_rating: float = Field(default=0.0, ge=0, le=5)
    product_review_count: int = Field(default=0, ge=0)
    buyer_need: str = Field(min_length=1, max_length=1000)
    reviews: list[ReviewItem] = Field(default=[], max_length=25)

    @field_validator("product_features", mode="before")
    @classmethod
    def limit_features(cls, v: list) -> list:
        return v[:50] if isinstance(v, list) else v


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


def _need_context(need_profile: dict) -> str:
    """Compact need-profile context for downstream agents."""
    use_cases = ", ".join(need_profile.get("primary_use_cases") or []) or "—"
    must_have = ", ".join(need_profile.get("must_have_features") or []) or "—"
    concerns = ", ".join(need_profile.get("key_concerns") or []) or "—"
    summary = need_profile.get("summary") or "—"
    return (
        f"Kullanıcı İhtiyacı Özeti: {summary}\n"
        f"Kullanım amaçları: {use_cases}\n"
        f"Must-have özellikler: {must_have}\n"
        f"Endişeler: {concerns}"
    )


def _apply_deterministic_price_score(req: BuyerAnalyzeRequest, price_analysis: dict) -> dict:
    """Overwrite LLM price score with median-based deterministic score."""
    fairness = calculate_price_fairness(req.product_price, price_analysis)
    price_analysis["price_fairness_score"] = fairness["score"]
    price_analysis["price_assessment"] = fairness["assessment"]
    price_analysis["median_market_price"] = fairness["median_market_price"]
    price_analysis["price_candidate_count"] = fairness["candidate_count"]
    price_analysis["price_ratio_to_median"] = fairness["ratio"]
    return price_analysis


def _apply_deterministic_final_scores(
    req: BuyerAnalyzeRequest,
    final_report: dict,
    price_analysis: dict,
    review_analysis: dict,
) -> dict:
    """Overwrite volatile LLM scores with deterministic scoring engine outputs."""
    final_report["verified_price_fairness_score"] = price_analysis.get("price_fairness_score", 50)

    return_risk = calculate_return_risk(
        category=req.product_category,
        fit_score=final_report.get("verified_fit_score", 60),
        trust_score=final_report.get("verified_trust_score", 60),
        review_analysis=review_analysis,
        warnings=final_report.get("verified_warnings", []),
    )
    final_report["verified_return_risk_percent"] = return_risk["risk"]
    final_report["return_risk_factors"] = return_risk["factors"]
    return final_report


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
        raise
    except Exception as exc:
        return {"summary": req.buyer_need, "key_concerns": [], "error": str(exc)[:100]}


# ── Agent 2: Price Tracker (Google Search Grounding, need-aware) ─────────────

def _run_price_tracker_sync(
    client: genai.Client,
    req: BuyerAnalyzeRequest,
    need_profile: dict,
) -> dict:
    prompt = f"""Türkiye e-ticaret piyasasında "{req.product_title}" ({req.product_category}) ürününün fiyat araştırmasını yap.

Mevcut fiyat: ₺{req.product_price:.0f}

{_need_context(need_profile)}

Yukarıdaki ihtiyaç bağlamını göz önünde bulundurarak fiyat adaylarını topla.
ÖNEMLİ: price_fairness_score için sadece tahmini bir fallback ver; nihai fiyat skoru kod tarafında median fiyatla hesaplanacak.
Sadece JSON döndür:
{{
  "price_assessment": "ucuz|makul|pahalı",
  "market_context": "piyasa bağlamı, benzer ürünlerin tipik fiyat aralığı",
  "market_price_candidates": [
    {{"title": "ürün/satıcı adı", "price": 0, "currency": "TRY", "source_url": "https://..."}}
  ],
  "price_fairness_score": 0-100,
  "comment": "ihtiyaçla bağlantılı kısa yorum"
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
    except genai_errors.APIError as exc:
        if _should_use_mock_fallback(exc):
            raise
        return {
            "price_assessment": "bilinmiyor",
            "price_fairness_score": 50,
            "comment": f"Arama yapılamadı: {str(exc)[:100]}",
            "market_context": "",
        }
    except Exception as exc:
        return {
            "price_assessment": "bilinmiyor",
            "price_fairness_score": 50,
            "comment": f"Arama yapılamadı: {str(exc)[:100]}",
            "market_context": "",
        }


# ── Agent 3: Review Miner (need-aware) ────────────────────────────────────────

def _run_review_miner_sync(
    client: genai.Client,
    req: BuyerAnalyzeRequest,
    need_profile: dict,
) -> dict:
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
    prompt = f"""Şu ürün yorumlarını analiz et; kullanıcının ihtiyacıyla bağlantılı pattern'lere odaklan.

Ürün: {req.product_title}

{_need_context(need_profile)}

Yorumlar:
{reviews_text}

Sadece JSON döndür. top_complaints/top_praises listelerinde mümkünse must-have'larla
örtüşen veya çelişen pattern'leri öne çıkar:
{{
  "total_analyzed": {len(req.reviews)},
  "average_rating": 0.0,
  "sentiment_breakdown": {{"positive": 0, "neutral": 0, "negative": 0}},
  "top_complaints": ["..."],
  "top_praises": ["..."],
  "recurring_issues": ["..."],
  "need_match_signals": ["must-have'lara değinen yorum tema(ları)"],
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
    except genai_errors.APIError as exc:
        if _should_use_mock_fallback(exc):
            raise
        return {
            "sentiment_summary": f"Yorum analizi başarısız: {str(exc)[:100]}",
            "reliability_signal": "insufficient_data",
            "total_analyzed": 0,
        }
    except Exception as exc:
        return {
            "sentiment_summary": f"Yorum analizi başarısız: {str(exc)[:100]}",
            "reliability_signal": "insufficient_data",
            "total_analyzed": 0,
        }


# ── Agent 4: Alternative Finder (Google Search Grounding) ─────────────────────

def _run_alternative_finder_sync(
    client: genai.Client,
    req: BuyerAnalyzeRequest,
    need_profile: dict,
) -> list[dict]:
    """Search Türkiye e-ticaret for products that better fit the buyer's need."""
    price_low = max(0, int(req.product_price * 0.85))
    price_high = int(req.product_price * 1.10)
    prompt = f"""Türkiye e-ticaret piyasasında, aşağıdaki kullanıcı ihtiyacına bu üründen DAHA UYGUN
alternatif ürünleri araştır.

Mevcut ürün: {req.product_title} ({req.product_category}) — ₺{req.product_price:.0f}

{_need_context(need_profile)}

Kriterler:
- Fiyat aralığı: ₺{price_low} – ₺{price_high} (mevcut ürüne yakın)
- Kullanıcının must-have özelliklerini DAHA İYİ karşılamalı
- Reklam/sponsor sonuçları yerine organik öneriler tercih et
- En fazla 3 alternatif öner
- Sadece yeterince güvenilir bulguları "high" confidence ile işaretle

Sadece JSON array döndür (kod bloğu yok, sadece [...]):
[
  {{
    "title": "ürün başlığı",
    "approx_price": 0,
    "currency": "TRY",
    "source_url": "https://...",
    "why_better_fit": "kullanıcının {need_profile.get('summary', 'ihtiyaç')} ihtiyacını neden daha iyi karşılıyor",
    "trade_offs": "bu ürüne göre eksisi/artısı",
    "confidence": "high|medium|low"
  }}
]"""
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={
                "tools": [genai_types.Tool(google_search=genai_types.GoogleSearch())],
            },
        )
        text = (resp.text or "").strip()
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        # Try direct JSON array
        try:
            data = json.loads(text)
        except Exception:
            m = re.search(r"\[.*\]", text, re.DOTALL)
            data = json.loads(m.group()) if m else []
        if not isinstance(data, list):
            return []
        cleaned: list[dict] = []
        for item in data[:5]:
            if not isinstance(item, dict):
                continue
            cleaned.append({
                "title": str(item.get("title", ""))[:200],
                "approx_price": float(item.get("approx_price") or 0),
                "currency": str(item.get("currency", "TRY"))[:8],
                "source_url": str(item.get("source_url", ""))[:500],
                "why_better_fit": str(item.get("why_better_fit", ""))[:400],
                "trade_offs": str(item.get("trade_offs", ""))[:300],
                "confidence": str(item.get("confidence", "low")).lower(),
            })
        return cleaned
    except genai_errors.APIError as exc:
        if _should_use_mock_fallback(exc):
            raise
        return []
    except Exception:
        return []


# ── Agent 5: Synthesizer — SADECE skor + kanıt, verdict YOK ──────────────────

def _run_synthesizer_sync(
    client: genai.Client,
    req: BuyerAnalyzeRequest,
    need_profile: dict,
    price_analysis: dict,
    review_analysis: dict,
    alternatives: list[dict],
) -> dict:
    prompt = f"""Sen bir e-ticaret alım danışmanısın. Aşağıdaki analizlerden kanıta dayalı skor + uyarı/güçlü sinyaller üret.
ÖNEMLİ: Final karar (al/alma) VERME — sadece skorla ve kanıtla. Karar başka bir motor tarafından verilecek.
ÖNEMLİ: verified_price_fairness_score ve verified_return_risk_percent kod tarafında deterministik hesaplanıp overwrite edilecek; sen bu iki alanda sadece fallback tahmin ver.

ÜRÜN: {req.product_title} ({req.product_category}) — ₺{req.product_price:.0f}
ALICI İHTİYACI: {req.buyer_need}

İHTİYAÇ PROFİLİ: {json.dumps(need_profile, ensure_ascii=False)}
FİYAT ANALİZİ: {json.dumps(price_analysis, ensure_ascii=False)}
YORUM ANALİZİ: {json.dumps(review_analysis, ensure_ascii=False)}
ALTERNATİF SAYISI: {len(alternatives)}

Türkçe, kanıta dayalı. Sadece JSON döndür:
{{
  "verified_fit_score": 0-100,
  "verified_trust_score": 0-100,
  "verified_price_fairness_score": 0-100,
  "verified_return_risk_percent": 0-100,
  "final_summary": "2-3 cümle özet — KARAR VERME, sadece durumu özetle (Türkçe)",
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
            # Final recommendation alanı LLM'den gelse bile decision engine geçersiz kılar
            result.pop("final_recommendation", None)
            return result
    except genai_errors.APIError as exc:
        if _should_use_mock_fallback(exc):
            raise
    except Exception:
        pass

    return {
        "final_summary": "Analiz tamamlandı; mevcut verilerle yorumlama yetersiz kaldı.",
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
    yield _sse("alternative_search", "Alternatifler aranıyor... (demo mod)")
    await asyncio.sleep(1.0)

    price_analysis = {**MOCK_BUYER_PRICE_ANALYSIS}
    review_analysis = {**MOCK_BUYER_REVIEW_ANALYSIS, "average_rating": req.product_rating}
    alternatives = list(MOCK_BUYER_ALTERNATIVES)
    price_analysis["market_price_candidates"] = [
        {"title": "Demo Piyasa Adayı 1", "price": round(req.product_price * 0.95, 2), "currency": "TRY", "source_url": ""},
        {"title": "Demo Piyasa Adayı 2", "price": round(req.product_price, 2), "currency": "TRY", "source_url": ""},
        {"title": "Demo Piyasa Adayı 3", "price": round(req.product_price * 1.08, 2), "currency": "TRY", "source_url": ""},
    ]
    price_analysis = _apply_deterministic_price_score(req, price_analysis)

    yield _sse("price_market", json.dumps(price_analysis, ensure_ascii=False), "fiyat_analizi", price_analysis)
    yield _sse("review_mining", json.dumps(review_analysis, ensure_ascii=False), "yorum_analizi", review_analysis)
    yield _sse("alternative_search", json.dumps(alternatives, ensure_ascii=False), "alternatif_urunler", alternatives)

    await asyncio.sleep(0.6)
    yield _sse("risk_synthesis", "Veriler birleştiriliyor... (demo mod)")
    await asyncio.sleep(0.4)

    final_report = {**MOCK_BUYER_FINAL_REPORT}
    final_report = _apply_deterministic_final_scores(req, final_report, price_analysis, review_analysis)
    verdict = decide(
        fit=final_report.get("verified_fit_score", 60),
        trust=final_report.get("verified_trust_score", 60),
        price_fairness=final_report.get("verified_price_fairness_score", 60),
        return_risk=final_report.get("verified_return_risk_percent", 30),
        warnings=final_report.get("verified_warnings", []),
        strengths=final_report.get("verified_strengths", []),
        alternatives=alternatives,
    )
    final_report["verdict"] = verdict
    final_report["alternatives"] = alternatives
    yield _sse("verification", json.dumps(final_report, ensure_ascii=False), "final_rapor", final_report)


def _should_use_mock_fallback(exc: BaseException) -> bool:
    """Gemini quota/service failures should switch the whole stream to demo data."""
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return True
    if not isinstance(exc, genai_errors.APIError):
        return False

    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    # 429 = rate limit, 400/401/403 = auth/config errors → all fall back to demo
    if code in (400, 401, 403, 429):
        return True

    msg = str(exc).upper()
    return (
        is_mockable_gemini_error(exc)
        or "API_KEY" in msg
        or "UNAUTHENTICATED" in msg
        or "PERMISSION_DENIED" in msg
        or "INVALID_ARGUMENT" in msg
        or "RESOURCE_EXHAUSTED" in msg
        or "QUOTA" in msg
        or "RATE_LIMIT" in msg
    )


# ── SSE Streaming Endpoint ────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_for_buyer(req: BuyerAnalyzeRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            client = _get_client()
        except ValueError:
            async for event in _mock_buyer_event_stream(req):
                yield event
            return

        # ── Agent 1: Need Parser (sequential, beslenir aşağıdakilere) ────────
        yield _sse("need_understanding", "İhtiyaç profili analiz ediliyor...")
        try:
            need_profile = await asyncio.wait_for(
                asyncio.to_thread(_run_need_parser_sync, client, req),
                timeout=60,
            )
        except (asyncio.TimeoutError, TimeoutError):
            async for event in _mock_buyer_event_stream(req):
                yield event
            return
        except genai_errors.APIError as exc:
            if _should_use_mock_fallback(exc):
                async for event in _mock_buyer_event_stream(req):
                    yield event
                return
            yield _sse("error", f"API hatası: {str(exc)[:120]}")
            return
        except Exception:
            async for event in _mock_buyer_event_stream(req):
                yield event
            return

        yield _sse(
            "need_understanding",
            json.dumps(need_profile, ensure_ascii=False),
            "ihtiyac_profili",
            need_profile,
        )

        # ── Agent 2-4: Parallel (need-aware) ──────────────────────────────────
        yield _sse("price_market", "Fiyat araştırması yapılıyor...")
        yield _sse("review_mining", "Yorumlar analiz ediliyor...")
        yield _sse("alternative_search", "Daha iyi alternatifler aranıyor...")

        price_task = asyncio.wait_for(
            asyncio.to_thread(_run_price_tracker_sync, client, req, need_profile),
            timeout=60,
        )
        review_task = asyncio.wait_for(
            asyncio.to_thread(_run_review_miner_sync, client, req, need_profile),
            timeout=60,
        )
        alt_task = asyncio.wait_for(
            asyncio.to_thread(_run_alternative_finder_sync, client, req, need_profile),
            timeout=60,
        )

        results = await asyncio.gather(price_task, review_task, alt_task, return_exceptions=True)

        if any(
            isinstance(result, BaseException) and (
                _should_use_mock_fallback(result)
                or isinstance(result, (asyncio.TimeoutError, TimeoutError))
            )
            for result in results
        ):
            async for event in _mock_buyer_event_stream(req):
                yield event
            return

        price_analysis = results[0] if not isinstance(results[0], Exception) else {
            "price_fairness_score": 50, "comment": str(results[0])[:100],
            "price_assessment": "bilinmiyor", "market_context": "",
        }
        review_analysis = results[1] if not isinstance(results[1], Exception) else {
            "sentiment_summary": str(results[1])[:100],
            "reliability_signal": "insufficient_data", "total_analyzed": 0,
        }
        alternatives = results[2] if (not isinstance(results[2], Exception) and isinstance(results[2], list)) else []
        price_analysis = _apply_deterministic_price_score(req, price_analysis)

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
            "alternative_search",
            json.dumps(alternatives, ensure_ascii=False),
            "alternatif_urunler",
            alternatives,
        )

        # ── Agent 5: Synthesizer (skor + kanıt, verdict YOK) ──────────────────
        yield _sse("risk_synthesis", "Tüm veriler birleştiriliyor...")

        try:
            final_report = await asyncio.wait_for(
                asyncio.to_thread(
                    _run_synthesizer_sync,
                    client,
                    req,
                    need_profile,
                    price_analysis,
                    review_analysis,
                    alternatives,
                ),
                timeout=60,
            )
        except (asyncio.TimeoutError, TimeoutError):
            async for event in _mock_buyer_event_stream(req):
                yield event
            return
        except genai_errors.APIError as exc:
            if _should_use_mock_fallback(exc):
                async for event in _mock_buyer_event_stream(req):
                    yield event
                return
            yield _sse("error", f"API hatası: {str(exc)[:120]}")
            return
        except Exception:
            async for event in _mock_buyer_event_stream(req):
                yield event
            return

        # ── Decision Engine: deterministic verdict ────────────────────────────
        final_report = _apply_deterministic_final_scores(req, final_report, price_analysis, review_analysis)
        verdict = decide(
            fit=final_report.get("verified_fit_score", 60),
            trust=final_report.get("verified_trust_score", 60),
            price_fairness=final_report.get("verified_price_fairness_score", 60),
            return_risk=final_report.get("verified_return_risk_percent", 30),
            warnings=final_report.get("verified_warnings", []),
            strengths=final_report.get("verified_strengths", []),
            alternatives=alternatives,
        )
        final_report["verdict"] = verdict
        final_report["alternatives"] = alternatives

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
