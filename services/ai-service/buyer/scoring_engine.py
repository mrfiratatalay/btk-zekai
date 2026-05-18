"""
Deterministic buyer scoring helpers.

LLM agents can collect context, quotes and candidate data, but volatile scores
like market price fairness and return risk are calculated here so repeated runs
with the same inputs produce the same values.
"""

import re
from statistics import median
from typing import Any


RETURN_RISK_CATEGORY_BASELINE = {
    "giyim": 32,
    "ayakkabı": 35,
    "moda": 30,
    "aksesuar": 24,
    "kozmetik": 22,
    "elektronik": 12,
    "telefon": 10,
    "bilgisayar": 12,
    "kulaklık": 14,
    "beyaz eşya": 10,
    "mobilya": 24,
    "ev": 18,
    "anne": 18,
    "bebek": 18,
    "kitap": 6,
    "oyuncak": 16,
    "spor": 20,
}

RETURN_RISK_DEFAULT_BASELINE = 18

NEGATIVE_RETURN_TERMS = (
    "iade",
    "pişman",
    "pisman",
    "beklediğim gibi değil",
    "bekledigim gibi degil",
    "kalitesiz",
    "bozuk",
    "arızalı",
    "arizali",
    "çalışmadı",
    "calismadi",
    "dayanmadı",
    "dayanmadi",
    "küçük geldi",
    "kucuk geldi",
    "büyük geldi",
    "buyuk geldi",
    "uyumsuz",
    "sorunlu",
)


def _clamp(value: float, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, round(value)))


def _as_float(value: Any) -> float | None:
    if isinstance(value, str):
        cleaned = re.sub(r"[^\d,\.]", "", value.strip())
        if "," in cleaned and "." in cleaned:
            cleaned = cleaned.replace(".", "").replace(",", ".")
        elif "," in cleaned:
            cleaned = cleaned.replace(",", ".")
        elif cleaned.count(".") == 1 and len(cleaned.rsplit(".", 1)[1]) == 3:
            cleaned = cleaned.replace(".", "")
        value = cleaned
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if number > 0 else None


def _category_baseline(category: str) -> int:
    normalized = (category or "").casefold()
    for key, baseline in RETURN_RISK_CATEGORY_BASELINE.items():
        if key in normalized:
            return baseline
    return RETURN_RISK_DEFAULT_BASELINE


def calculate_price_fairness(current_price: float, price_analysis: dict[str, Any]) -> dict[str, Any]:
    """Calculate market fairness from candidate prices using median comparison."""
    candidates = []
    for item in price_analysis.get("market_price_candidates") or []:
        if isinstance(item, dict):
            price = _as_float(item.get("price") or item.get("approx_price"))
        else:
            price = _as_float(item)
        if price:
            candidates.append(price)

    current = _as_float(current_price)
    if not current or len(candidates) < 2:
        fallback = _clamp(price_analysis.get("price_fairness_score", 50))
        return {
            "score": fallback,
            "assessment": price_analysis.get("price_assessment") or "bilinmiyor",
            "median_market_price": None,
            "candidate_count": len(candidates),
            "ratio": None,
        }

    market_median = float(median(candidates))
    ratio = current / market_median if market_median > 0 else 1.0

    if ratio <= 0.75:
        score = 90
    elif ratio <= 0.90:
        score = 80 - ((ratio - 0.75) / 0.15) * 10
    elif ratio <= 1.10:
        score = 70 - abs(ratio - 1.0) * 150
    elif ratio <= 1.30:
        score = 45 - ((ratio - 1.10) / 0.20) * 20
    else:
        score = 20

    if ratio <= 0.90:
        assessment = "ucuz"
    elif ratio <= 1.10:
        assessment = "makul"
    else:
        assessment = "pahalı"

    return {
        "score": _clamp(score),
        "assessment": assessment,
        "median_market_price": round(market_median, 2),
        "candidate_count": len(candidates),
        "ratio": round(ratio, 3),
    }


def calculate_return_risk(
    category: str,
    fit_score: float,
    trust_score: float,
    review_analysis: dict[str, Any],
    warnings: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Calculate return risk from category, review signals, fit and trust."""
    warnings = warnings or []
    risk = float(_category_baseline(category))
    factors: list[str] = [f"Kategori baz riski: %{round(risk)}"]

    review_text_parts: list[str] = []
    for key in ("top_complaints", "recurring_issues", "need_match_signals"):
        value = review_analysis.get(key)
        if isinstance(value, list):
            review_text_parts.extend(str(item) for item in value)
    if review_analysis.get("sentiment_summary"):
        review_text_parts.append(str(review_analysis["sentiment_summary"]))

    review_text = " ".join(review_text_parts).casefold()
    negative_hits = sum(1 for term in NEGATIVE_RETURN_TERMS if term in review_text)
    if negative_hits:
        delta = min(24, negative_hits * 6)
        risk += delta
        factors.append(f"Yorumlarda iade/pişmanlık sinyali: +{delta}")

    try:
        sentiment = review_analysis.get("sentiment_breakdown") or {}
        negative_share = float(sentiment.get("negative") or 0)
    except (TypeError, ValueError):
        negative_share = 0
    if negative_share >= 25:
        delta = min(18, (negative_share - 20) * 0.5)
        risk += delta
        factors.append(f"Negatif yorum oranı yüksek: +{round(delta)}")

    fit_gap = max(0.0, 70 - float(fit_score))
    if fit_gap:
        delta = min(22, fit_gap * 0.45)
        risk += delta
        factors.append(f"İhtiyaç uyumu eksiği: +{round(delta)}")

    trust_gap = max(0.0, 60 - float(trust_score))
    if trust_gap:
        delta = min(18, trust_gap * 0.35)
        risk += delta
        factors.append(f"Güven skoru eksiği: +{round(delta)}")

    high_conf_warnings = sum(1 for item in warnings if (item or {}).get("confidence") == "high")
    if high_conf_warnings:
        delta = min(18, high_conf_warnings * 6)
        risk += delta
        factors.append(f"Yüksek güvenilirlikli uyarı: +{delta}")

    return {
        "risk": _clamp(risk),
        "factors": factors,
    }
