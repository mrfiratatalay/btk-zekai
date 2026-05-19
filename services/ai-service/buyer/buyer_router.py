"""
Zekai Buyer Analysis - cost-aware Gemini workflow.

Default path:
  1. Buyer Advisor (one structured LLM call)
  2. Optional Market Check (only when advisor asks for it)
  3. Deterministic decision engine

The endpoint keeps the existing SSE contract but no longer runs every
specialist agent on every request.
"""

import asyncio
import json
import os
from typing import Any, AsyncGenerator, Literal

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types
from pydantic import BaseModel, Field, ValidationError, field_validator

from buyer.decision_engine import decide
from buyer.scoring_engine import calculate_price_fairness, calculate_return_risk

router = APIRouter()

ADVISOR_MODEL = os.getenv("BUYER_ADVISOR_MODEL", "gemini-2.5-flash-lite")
SEARCH_MODEL = os.getenv("BUYER_SEARCH_MODEL", ADVISOR_MODEL)
ADVISOR_TIMEOUT_SECONDS = int(os.getenv("BUYER_ADVISOR_TIMEOUT_SECONDS", "45"))
MARKET_TIMEOUT_SECONDS = int(os.getenv("BUYER_MARKET_TIMEOUT_SECONDS", "45"))


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
    def limit_features(cls, value: list) -> list:
        return value[:50] if isinstance(value, list) else value


class EvidenceItem(BaseModel):
    text: str = Field(min_length=1, max_length=240)
    evidence: str = Field(default="", max_length=300)
    confidence: Literal["high", "medium", "low"] = "medium"


class AdvisorReport(BaseModel):
    fit_score: int = Field(ge=0, le=100)
    trust_score: int = Field(ge=0, le=100)
    price_fairness_score: int = Field(ge=0, le=100)
    return_risk_percent: int = Field(ge=0, le=100)
    final_summary: str = Field(min_length=1, max_length=500)
    warnings: list[EvidenceItem] = Field(default_factory=list, max_length=5)
    strengths: list[EvidenceItem] = Field(default_factory=list, max_length=5)
    needs_market_check: bool = False
    market_check_reason: str = Field(default="", max_length=240)


class MarketPriceCandidate(BaseModel):
    title: str = Field(default="", max_length=200)
    price: float = Field(default=0, ge=0)
    currency: str = Field(default="TRY", max_length=8)
    source_url: str = Field(default="", max_length=500)


class AlternativeProduct(BaseModel):
    title: str = Field(default="", max_length=200)
    approx_price: float = Field(default=0, ge=0)
    currency: str = Field(default="TRY", max_length=8)
    source_url: str = Field(default="", max_length=500)
    why_better_fit: str = Field(default="", max_length=400)
    trade_offs: str = Field(default="", max_length=300)
    confidence: Literal["high", "medium", "low"] = "low"


class MarketCheckReport(BaseModel):
    price_assessment: Literal["ucuz", "makul", "pahali", "bilinmiyor"] = "bilinmiyor"
    market_context: str = Field(default="", max_length=500)
    market_price_candidates: list[MarketPriceCandidate] = Field(default_factory=list, max_length=5)
    alternatives: list[AlternativeProduct] = Field(default_factory=list, max_length=2)


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


def _compact_product(req: BuyerAnalyzeRequest) -> str:
    features = "\n".join(f"- {item}" for item in req.product_features[:20]) or "- Ozellik verisi yok"
    reviews = "\n".join(
        f"- ({review.rating}/5) {review.comment[:500]}" for review in req.reviews[:12]
    ) or "Yorum metni yok."
    return f"""
Urun:
- Baslik: {req.product_title}
- Kategori: {req.product_category}
- Fiyat: {req.product_price:.2f} TRY
- Puan: {req.product_rating:.1f}/5
- Yorum sayisi: {req.product_review_count}
- Aciklama: {(req.product_description or 'Aciklama yok')[:1800]}
- Ozellikler:
{features}

Kullanici ihtiyaci:
{req.buyer_need}

Yorumlar:
{reviews}
""".strip()


def _advisor_prompt(req: BuyerAnalyzeRequest) -> str:
    return f"""
Sen ZekAI icin Turkce konusan maliyet-bilincine sahip e-ticaret alisveris danismanisin.
Amacin son kullaniciya bu urunu almasi gerekip gerekmedigini kanita dayali ama sade sekilde belirlemek.

Kurallar:
- Sadece verilen urun, ihtiyac ve yorum verisini kullan.
- Emin olmadigin iddiayi kesin konusma.
- needs_market_check sadece gercekten piyasa aramasi gerekliyse true olsun.
- Market check gerekme sebepleri: kullanici net butce soyluyor, fiyat cok kritik, guven/fiyat belirsiz, daha iyi alternatif ihtimali karar icin belirleyici.
- Final karari verme; skor, uyari ve guclu sinyal uret. Karar kod tarafinda verilecek.

{_compact_product(req)}
""".strip()


def _market_prompt(req: BuyerAnalyzeRequest, advisor: AdvisorReport) -> str:
    return f"""
Turkiye e-ticaret piyasasinda su urun icin kisa piyasa kontrolu yap:

Urun: {req.product_title}
Kategori: {req.product_category}
Mevcut fiyat: {req.product_price:.2f} TRY
Kullanici ihtiyaci: {req.buyer_need}
Market kontrol sebebi: {advisor.market_check_reason or 'Advisor fiyat/alternatif belirsizligi gordu.'}

Kurallar:
- En fazla 5 fiyat adayi.
- En fazla 2 alternatif.
- Alternatifleri ancak kullanicinin ihtiyacina daha uygun gorunuyorsa ekle.
- Kaynak URL bos kalabilir ama uydurma URL yazma.
""".strip()


def _generate_structured_sync(
    client: genai.Client,
    model: str,
    prompt: str,
    schema: type[BaseModel],
    *,
    use_google_search: bool = False,
) -> BaseModel:
    tools = [genai_types.Tool(google_search=genai_types.GoogleSearch())] if use_google_search else None
    config = genai_types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.2,
        tools=tools,
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    return schema.model_validate_json(response.text or "{}")


def _run_advisor_sync(client: genai.Client, req: BuyerAnalyzeRequest) -> AdvisorReport:
    return _generate_structured_sync(
        client,
        ADVISOR_MODEL,
        _advisor_prompt(req),
        AdvisorReport,
    )


def _run_market_check_sync(
    client: genai.Client,
    req: BuyerAnalyzeRequest,
    advisor: AdvisorReport,
) -> MarketCheckReport:
    return _generate_structured_sync(
        client,
        SEARCH_MODEL,
        _market_prompt(req, advisor),
        MarketCheckReport,
        use_google_search=True,
    )


def _evidence_to_dict(items: list[EvidenceItem], key: str) -> list[dict[str, str]]:
    return [
        {
            key: item.text,
            "evidence": item.evidence,
            "confidence": item.confidence,
        }
        for item in items
    ]


def _build_final_report(
    req: BuyerAnalyzeRequest,
    advisor: AdvisorReport,
    market: MarketCheckReport | None,
) -> dict[str, Any]:
    price_analysis: dict[str, Any] = {
        "price_assessment": market.price_assessment if market else "bilinmiyor",
        "price_fairness_score": advisor.price_fairness_score,
        "market_price_candidates": [
            candidate.model_dump() for candidate in (market.market_price_candidates if market else [])
        ],
    }
    price_analysis = _apply_deterministic_price_score(req, price_analysis)

    review_analysis = {
        "average_rating": req.product_rating,
        "total_analyzed": len(req.reviews),
        "sentiment_summary": "Advisor yorum ve puan sinyallerini tek geciste degerlendirdi.",
        "top_complaints": [item.text for item in advisor.warnings],
        "top_praises": [item.text for item in advisor.strengths],
        "reliability_signal": "moderate" if req.product_review_count >= 20 else "weak",
    }

    warnings = _evidence_to_dict(advisor.warnings, "warning")
    strengths = _evidence_to_dict(advisor.strengths, "strength")
    return_risk = calculate_return_risk(
        category=req.product_category,
        fit_score=advisor.fit_score,
        trust_score=advisor.trust_score,
        review_analysis=review_analysis,
        warnings=warnings,
    )
    alternatives = [item.model_dump() for item in (market.alternatives if market else [])]
    verdict = decide(
        fit=advisor.fit_score,
        trust=advisor.trust_score,
        price_fairness=price_analysis.get("price_fairness_score", advisor.price_fairness_score),
        return_risk=return_risk["risk"],
        warnings=warnings,
        strengths=strengths,
        alternatives=alternatives,
    )

    return {
        "model": ADVISOR_MODEL,
        "search_model": SEARCH_MODEL if market else None,
        "used_search": market is not None,
        "cached": False,
        "fit_score": advisor.fit_score,
        "trust_score": advisor.trust_score,
        "price_fairness_score": price_analysis.get("price_fairness_score", advisor.price_fairness_score),
        "return_risk_percent": return_risk["risk"],
        "verified_fit_score": advisor.fit_score,
        "verified_trust_score": advisor.trust_score,
        "verified_price_fairness_score": price_analysis.get("price_fairness_score", advisor.price_fairness_score),
        "verified_return_risk_percent": return_risk["risk"],
        "final_summary": advisor.final_summary,
        "warnings": warnings,
        "strengths": strengths,
        "verified_warnings": warnings,
        "verified_strengths": strengths,
        "return_risk_factors": return_risk["factors"],
        "market_context": market.market_context if market else "",
        "market_price_candidates": price_analysis.get("market_price_candidates", []),
        "alternatives": alternatives,
        "verdict": verdict,
        "verification_quality": "medium",
    }


def _apply_deterministic_price_score(req: BuyerAnalyzeRequest, price_analysis: dict[str, Any]) -> dict[str, Any]:
    fairness = calculate_price_fairness(req.product_price, price_analysis)
    price_analysis["price_fairness_score"] = fairness["score"]
    price_analysis["price_assessment"] = fairness["assessment"]
    price_analysis["median_market_price"] = fairness["median_market_price"]
    price_analysis["price_candidate_count"] = fairness["candidate_count"]
    price_analysis["price_ratio_to_median"] = fairness["ratio"]
    return price_analysis


def _is_retryable_gemini_error(exc: BaseException) -> bool:
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return True
    if not isinstance(exc, genai_errors.APIError):
        return False
    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    return code in (408, 429, 500, 502, 503, 504)


@router.post("/analyze")
async def analyze_for_buyer(req: BuyerAnalyzeRequest):
    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            client = _get_client()
        except ValueError as exc:
            yield _error_sse(str(exc))
            return

        yield _sse("buyer_advisor", "Urun ve ihtiyac birlikte degerlendiriliyor...")
        try:
            advisor = await asyncio.wait_for(
                asyncio.to_thread(_run_advisor_sync, client, req),
                timeout=ADVISOR_TIMEOUT_SECONDS,
            )
        except (ValidationError, json.JSONDecodeError):
            yield _error_sse("Gemini beklenen JSON raporu uretmedi. Lutfen tekrar deneyin.")
            return
        except Exception as exc:
            msg = "Gemini gecici olarak yanit veremedi." if _is_retryable_gemini_error(exc) else "Analiz olusturulamadi."
            yield _error_sse(f"{msg} {str(exc)[:120]}")
            return

        yield _sse(
            "buyer_advisor",
            json.dumps(advisor.model_dump(), ensure_ascii=False),
            "advisor_raporu",
            advisor.model_dump(),
        )

        market: MarketCheckReport | None = None
        if advisor.needs_market_check:
            yield _sse("market_check", "Fiyat ve alternatifler icin kisa piyasa kontrolu yapiliyor...")
            try:
                market = await asyncio.wait_for(
                    asyncio.to_thread(_run_market_check_sync, client, req, advisor),
                    timeout=MARKET_TIMEOUT_SECONDS,
                )
                yield _sse(
                    "market_check",
                    json.dumps(market.model_dump(), ensure_ascii=False),
                    "piyasa_kontrolu",
                    market.model_dump(),
                )
            except (ValidationError, json.JSONDecodeError):
                yield _sse("market_check", "Piyasa kontrolu dogrulanamadi; eldeki verilerle karar hazirlaniyor.")
            except Exception as exc:
                if not _is_retryable_gemini_error(exc):
                    yield _sse("market_check", "Piyasa kontrolu basarisiz; eldeki verilerle karar hazirlaniyor.")
                else:
                    yield _sse("market_check", "Piyasa kontrolu gecici olarak yapilamadi; eldeki verilerle karar hazirlaniyor.")

        yield _sse("decision", "Karar raporu hazirlaniyor...")
        final_report = _build_final_report(req, advisor, market)
        yield _sse(
            "decision",
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
