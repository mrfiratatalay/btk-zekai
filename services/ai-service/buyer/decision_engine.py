"""
Buyer Decision Engine — saf fonksiyon, deterministik karar motoru.

LLM (Synthesizer) sadece 4 skor + warnings/strengths/evidence üretir.
Final verdict ("Al" / "Düşün" / "Alternatife bak") burada, kod tarafında,
açıkça eşiklerle hesaplanır. Karar her zaman aynı girdi için aynı çıktıyı verir.

Kullanım:
    verdict = decide(
        fit=72, trust=64, price_fairness=58, return_risk=22,
        warnings=[{"warning": "...", "confidence": "high"}, ...],
        alternatives=[{"confidence": "high", "title": "...", ...}, ...],
    )
"""

from typing import Any

# ── Eşikler ───────────────────────────────────────────────────────────────────

FIT_BUY_THRESHOLD = 70
FIT_AVOID_THRESHOLD = 40

TRUST_BUY_THRESHOLD = 60
TRUST_AVOID_THRESHOLD = 35

RETURN_RISK_BUY_MAX = 25
RETURN_RISK_AVOID_MIN = 50

HIGH_CONF_WARNING_AVOID_MIN = 2

COMPOSITE_WEIGHTS = {
    "fit": 0.40,
    "trust": 0.25,
    "price": 0.20,
    "return": 0.15,
}


# ── Yardımcılar ───────────────────────────────────────────────────────────────

def _high_conf_count(items: list[dict[str, Any]]) -> int:
    return sum(1 for it in items if (it or {}).get("confidence") == "high")


def _composite_score(fit: float, trust: float, price_fairness: float, return_risk: float) -> int:
    score = (
        COMPOSITE_WEIGHTS["fit"] * fit
        + COMPOSITE_WEIGHTS["trust"] * trust
        + COMPOSITE_WEIGHTS["price"] * price_fairness
        + COMPOSITE_WEIGHTS["return"] * (100 - return_risk)
    )
    return max(0, min(100, round(score)))


# ── Ana fonksiyon ─────────────────────────────────────────────────────────────

def decide(
    fit: float,
    trust: float,
    price_fairness: float,
    return_risk: float,
    warnings: list[dict[str, Any]] | None = None,
    strengths: list[dict[str, Any]] | None = None,
    alternatives: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Skorlar + kanıtlardan deterministik verdict üretir."""
    warnings = warnings or []
    strengths = strengths or []
    alternatives = alternatives or []

    high_conf_warnings = _high_conf_count(warnings)
    high_conf_alts = _high_conf_count(alternatives)
    composite = _composite_score(fit, trust, price_fairness, return_risk)

    reasons: list[dict[str, str]] = []

    # ── AVOID koşulları (herhangi biri) ───────────────────────────────────────
    avoid_triggered = False

    if fit < FIT_AVOID_THRESHOLD:
        avoid_triggered = True
        reasons.append({
            "icon": "bad",
            "rule": "fit_below_avoid",
            "text": f"İhtiyaç uyumu çok düşük ({int(fit)}/100, alma eşiği {FIT_AVOID_THRESHOLD}).",
        })
    if trust < TRUST_AVOID_THRESHOLD:
        avoid_triggered = True
        reasons.append({
            "icon": "bad",
            "rule": "trust_below_avoid",
            "text": f"Güven sinyali çok zayıf ({int(trust)}/100). Yorumlar/satıcı geçmişi yetersiz.",
        })
    if return_risk > RETURN_RISK_AVOID_MIN:
        avoid_triggered = True
        reasons.append({
            "icon": "bad",
            "rule": "return_risk_high",
            "text": f"İade riski yüksek (%{int(return_risk)}). Kullanıcıların önemli bir kısmı pişman olmuş.",
        })
    if high_conf_warnings >= HIGH_CONF_WARNING_AVOID_MIN:
        avoid_triggered = True
        reasons.append({
            "icon": "bad",
            "rule": "many_high_conf_warnings",
            "text": f"{high_conf_warnings} adet yüksek güvenilirlikli uyarı bulundu.",
        })
    if high_conf_alts >= 1:
        # Daha iyi alternatif bulunduysa, mevcut ürünü almak yerine onu öner
        avoid_triggered = True
        reasons.append({
            "icon": "warn",
            "rule": "better_alternative_found",
            "text": f"Bütçen dahilinde, ihtiyacına daha uygun {high_conf_alts} alternatif bulundu.",
        })

    if avoid_triggered:
        return {
            "level": "avoid",
            "label": "Alternatife Bak",
            "composite_score": composite,
            "reasons": reasons,
        }

    # ── BUY koşulları (hepsi sağlanmalı) ──────────────────────────────────────
    buy_ok = (
        fit >= FIT_BUY_THRESHOLD
        and trust >= TRUST_BUY_THRESHOLD
        and return_risk <= RETURN_RISK_BUY_MAX
        and high_conf_warnings == 0
        and high_conf_alts == 0
    )

    if buy_ok:
        reasons.append({
            "icon": "ok",
            "rule": "fit_strong",
            "text": f"İhtiyacınla yüksek uyum ({int(fit)}/100, hedef {FIT_BUY_THRESHOLD}+).",
        })
        reasons.append({
            "icon": "ok",
            "rule": "trust_strong",
            "text": f"Güven sinyali güçlü ({int(trust)}/100). Yorumlar tutarlı.",
        })
        reasons.append({
            "icon": "ok",
            "rule": "return_risk_low",
            "text": f"İade riski düşük (%{int(return_risk)}).",
        })
        if strengths:
            top = strengths[0].get("strength") if strengths[0] else None
            if top:
                reasons.append({
                    "icon": "ok",
                    "rule": "top_strength",
                    "text": top,
                })
        return {
            "level": "buy",
            "label": "Alabilirsin",
            "composite_score": composite,
            "reasons": reasons,
        }

    # ── CONSIDER (default) ────────────────────────────────────────────────────
    if fit < FIT_BUY_THRESHOLD:
        reasons.append({
            "icon": "warn",
            "rule": "fit_partial",
            "text": f"İhtiyacınla kısmen uyumlu ({int(fit)}/100). Bazı must-have'lar eksik olabilir.",
        })
    if trust < TRUST_BUY_THRESHOLD:
        reasons.append({
            "icon": "warn",
            "rule": "trust_partial",
            "text": f"Güven sinyali orta seviye ({int(trust)}/100). Yorumları kendin de incele.",
        })
    if return_risk > RETURN_RISK_BUY_MAX:
        reasons.append({
            "icon": "warn",
            "rule": "return_risk_moderate",
            "text": f"İade riski orta (%{int(return_risk)}). Beden/uyum kritikse dikkat.",
        })
    if high_conf_warnings == 1:
        warn_text = warnings[0].get("warning") if warnings else "Belirgin uyarı var"
        reasons.append({
            "icon": "warn",
            "rule": "single_high_conf_warning",
            "text": warn_text or "Belirgin uyarı var",
        })

    if not reasons:
        reasons.append({
            "icon": "warn",
            "rule": "default_consider",
            "text": "Skorlar orta seviyede. Karar senin — kanıtları aşağıda detaylı incele.",
        })

    return {
        "level": "consider",
        "label": "Dikkatli İlerle",
        "composite_score": composite,
        "reasons": reasons,
    }
