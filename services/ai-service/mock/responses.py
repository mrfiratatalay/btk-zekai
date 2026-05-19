"""
Gemini API rate limit aşıldığında kullanılan mock veriler.
Her endpoint için gerçekçi ama demo amaçlı yanıtlar içerir.
"""

import base64
import urllib.request

# ── Rate Limit Tespiti ─────────────────────────────────────────────────────────

def is_rate_limit(exc: Exception) -> bool:
    """Gemini API 429 / RESOURCE_EXHAUSTED hatalarını tespit eder."""
    try:
        from google.genai import errors as genai_errors
        if not isinstance(exc, genai_errors.APIError):
            return False
    except ImportError:
        return False
    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    if code == 429:
        return True
    msg = str(exc).upper()
    return "RESOURCE_EXHAUSTED" in msg or "QUOTA_EXCEEDED" in msg or "RATE_LIMIT" in msg


def is_transient_gemini_error(exc: Exception) -> bool:
    """Gemini 503 / temporary model availability errors that should use demo fallback."""
    try:
        from google.genai import errors as genai_errors
        if not isinstance(exc, genai_errors.APIError):
            return False
    except ImportError:
        return False

    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    if code in (500, 502, 503, 504):
        return True

    msg = str(exc).upper()
    return any(
        marker in msg
        for marker in (
            "UNAVAILABLE",
            "OVERLOADED",
            "TEMPORARILY",
            "TRY AGAIN",
            "INTERNAL",
            "DEADLINE_EXCEEDED",
        )
    )


def is_mockable_gemini_error(exc: Exception) -> bool:
    """Errors where UX should continue with demo data instead of failing hard."""
    return is_rate_limit(exc) or is_transient_gemini_error(exc)


# ── Buyer Analysis Mock ────────────────────────────────────────────────────────

MOCK_BUYER_NEED_PROFILE = {
    "primary_use_cases": ["Günlük kullanım", "Ev ve ofis ortamı"],
    "must_have_features": ["Kaliteli yapı", "Uzun ömür", "Kolay kullanım"],
    "key_concerns": ["Fiyat-performans oranı", "Satıcı güvenilirliği", "İade kolaylığı"],
    "experience_level": "intermediate",
    "summary": "Kullanıcı ürünü günlük ihtiyaçları için değerlendiriyor. Kalite ve fiyat dengesi öncelikli kriter.",
}

MOCK_BUYER_PRICE_ANALYSIS = {
    "price_assessment": "makul",
    "market_context": "Ürün kategorisi için belirlenen fiyat piyasa ortalamasıyla uyumlu görünüyor.",
    "market_price_candidates": [
        {"title": "Demo Piyasa Adayı 1", "price": 950, "currency": "TRY", "source_url": ""},
        {"title": "Demo Piyasa Adayı 2", "price": 1050, "currency": "TRY", "source_url": ""},
        {"title": "Demo Piyasa Adayı 3", "price": 1100, "currency": "TRY", "source_url": ""},
    ],
    "price_fairness_score": 65,
    "comment": "Demo mod: Gerçek fiyat araştırması yapılamadı. Bu değer tahmini bir göstergedir.",
}

MOCK_BUYER_REVIEW_ANALYSIS = {
    "total_analyzed": 0,
    "average_rating": 4.1,
    "sentiment_breakdown": {"positive": 60, "neutral": 25, "negative": 15},
    "top_complaints": ["Kargo süresi uzun", "Kutu hasarlı gelebiliyor"],
    "top_praises": ["Ürün kalitesi iyi", "Fiyat uygun"],
    "recurring_issues": ["Teslimat süresi"],
    "sentiment_summary": "Demo mod: Gerçek yorum analizi yapılamadı. Genel kategori verilerinden tahmini değerler kullanıldı.",
    "reliability_signal": "insufficient_data",
}

MOCK_BUYER_ALTERNATIVES = [
    {
        "title": "Demo Alternatif A",
        "approx_price": 0,
        "currency": "TRY",
        "source_url": "",
        "why_better_fit": "Demo mod: gerçek alternatif arama yapılamadı.",
        "trade_offs": "—",
        "confidence": "low",
    }
]

MOCK_BUYER_FINAL_REPORT = {
    "verified_fit_score": 62,
    "verified_trust_score": 58,
    "verified_price_fairness_score": 65,
    "verified_return_risk_percent": 28,
    "final_summary": "Demo mod aktif — Gemini API limiti aşıldı. Bu analiz gerçek AI verisi değildir. Satın almadan önce ürün yorumlarını ve iade koşullarını mutlaka inceleyin.",
    "verified_warnings": [
        {
            "warning": "Bu analiz demo modunda üretilmiştir",
            "evidence": "Gemini API rate limit aşımı nedeniyle gerçek analiz yapılamadı",
            "confidence": "high",
        }
    ],
    "verified_strengths": [
        {
            "strength": "Ürün kategorisi genel olarak iyi kullanıcı geri bildirimi alıyor",
            "evidence": "Kategori bazlı genel değerlendirme",
            "confidence": "low",
        }
    ],
    "unverified_claims": [],
    "user_dependent_claims": ["Kullanım senaryosu kişiden kişiye değişebilir"],
    "verification_quality": "low",
}


# ── Simulation Mock ────────────────────────────────────────────────────────────

MOCK_PERSONAS = [
    {
        "id": "butce_bilinci",
        "name": "Mehmet K.",
        "age": 34,
        "city": "Ankara",
        "segment": "Bütçe Bilinçli",
        "profile": "Orta gelirli, her satın almada fiyat-performans dengesini dikkatle değerlendiren bir kullanıcı.",
        "caresAbout": "Fiyat uygunluğu, uzun vadeli dayanıklılık",
        "decision": "buy",
        "reason": "Fiyat-performans oranı makul görünüyor, riski kabul edilebilir seviyede.",
        "lookedAt": ["Fiyatı tartıyor", "Özellikler", "Yorum sayısı"],
        "recommendation": "Garanti süresini ve iade koşullarını ürün sayfasında daha belirgin göster.",
        "monologue": "Fiyatı mantıklı, denemeliyim.",
        "focusArea": "price",
        "focusLabel": "Fiyatı tartıyor",
        "bubbleText": "Bu fiyata değer mi acaba?",
    },
    {
        "id": "kalite_odakli",
        "name": "Ayşe T.",
        "age": 28,
        "city": "İstanbul",
        "segment": "Kalite Odaklı",
        "profile": "Premium ürünlere yönelen, marka ve materyal kalitesini önceliklendiren genç profesyonel.",
        "caresAbout": "Malzeme kalitesi, marka itibarı",
        "decision": "skip",
        "reason": "Ürün hakkında yeterli teknik bilgi ve güvenilir marka kanıtı bulamadım.",
        "lookedAt": ["Özellikleri inceliyor", "Teknik tablo", "Yorumlar"],
        "recommendation": "Materyal detaylarını ve üretim standartlarını açıkça belirt.",
        "monologue": "Hakkında yeterli bilgi yok, geçiyorum.",
        "focusArea": "features",
        "focusLabel": "Özellikleri inceliyor",
        "bubbleText": "Malzeme kalitesi yeterli mi?",
    },
    {
        "id": "pratik_kullanici",
        "name": "Emre Y.",
        "age": 42,
        "city": "İzmir",
        "segment": "Pratik Kullanıcı",
        "profile": "Kullanım kolaylığını ve işlevselliği ön planda tutan, teknik detaylarla pek ilgilenmeyen kullanıcı.",
        "caresAbout": "Kullanım kolaylığı, teslimat hızı",
        "decision": "buy",
        "reason": "Günlük kullanım için yeterince iyi görünüyor ve teslimat hızı uygun.",
        "lookedAt": ["Kargoya bakıyor", "Açıklama", "Fiyat"],
        "recommendation": "Ürünün kurulum ve kullanım sürecini daha kısa ve net anlat.",
        "monologue": "Aradığım şeyi yapıyor, alıyorum.",
        "focusArea": "shipping",
        "focusLabel": "Kargoya bakıyor",
        "bubbleText": "Yarına gelir mi?",
    },
    {
        "id": "arastirmaci",
        "name": "Selin B.",
        "age": 31,
        "city": "Bursa",
        "segment": "Araştırmacı Alıcı",
        "profile": "Satın almadan önce detaylı araştırma yapan, alternatifleri karşılaştıran dikkatli bir kullanıcı.",
        "caresAbout": "Kapsamlı ürün bilgisi, alternatif karşılaştırması",
        "decision": "undecided",
        "reason": "Ürün hakkında daha fazla kullanıcı deneyimi ve alternatiflerle karşılaştırma yapmam gerekiyor.",
        "lookedAt": ["Yorumlara bakıyor", "Tüm özellikler", "Benzer ürünler"],
        "recommendation": "Karşılaştırmalı bir özellik tablosu veya benzer ürünlerle fark analizi ekle.",
        "monologue": "Biraz daha araştırayım, acele etmeyeyim.",
        "focusArea": "reviews",
        "focusLabel": "Yorumlara bakıyor",
        "bubbleText": "Yorum sayısı güven veriyor mu?",
    },
    {
        "id": "ilk_kez_alan",
        "name": "Can A.",
        "age": 22,
        "city": "Konya",
        "segment": "İlk Kez Alan",
        "profile": "Bu kategoride ürün almayı ilk kez değerlendiren, rehberliğe ihtiyaç duyan genç kullanıcı.",
        "caresAbout": "Anlaşılır bilgi, güvenli alışveriş deneyimi",
        "decision": "skip",
        "reason": "Ürün sayfasında yeni başlayanlar için yeterince açıklayıcı bilgi bulamadım.",
        "lookedAt": ["Puanları inceliyor", "Açıklama", "Görseller"],
        "recommendation": "Yeni başlayanlar için ürünün ne işe yaradığını ve nasıl kullanılacağını basitçe anlat.",
        "monologue": "Tam olarak ne alacağımı anlayamadım.",
        "focusArea": "rating",
        "focusLabel": "Puanları inceliyor",
        "bubbleText": "Puan yüksek mi gerçekten?",
    },
]


# ── Content Generation Mock ────────────────────────────────────────────────────

def get_mock_content(product_title: str, category: str, price: float) -> dict:
    return {
        "title": f"{product_title} — Kaliteli {category} Ürünü",
        "short_description": f"Günlük ihtiyaçlarınız için ideal {category.lower()} çözümü. ₺{price:.0f} fiyatıyla uygun fiyat-performans dengesi.",
        "description": (
            f"{product_title}, {category.lower()} kategorisinde günlük kullanım ihtiyaçlarınızı karşılamak için tasarlanmıştır. "
            "Kullanıcı dostu yapısı ve dayanıklı malzeme kalitesiyle uzun vadeli kullanım sunar. "
            "Hızlı kargo ve kolay iade garantisiyle güvenli alışveriş deneyimi sağlanmaktadır."
        ),
        "features": [
            "Yüksek kaliteli malzeme ile uzun ömürlü kullanım",
            "Kullanıcı dostu tasarım ile kolay kurulum",
            "Geniş uyumluluk — farklı kullanım senaryolarına uygun",
            "Güvenli ve sertifikalı üretim standartları",
            "2 yıl garanti ve hızlı teknik destek",
        ],
        "what_i_improved": "Demo mod aktif. Bu içerik Gemini API limiti aşıldığı için örnek veri olarak üretilmiştir. Gerçek AI analizi için lütfen daha sonra tekrar deneyin.",
        "_mock": True,
    }


# ── SEO Mock ───────────────────────────────────────────────────────────────────

def get_mock_seo(product_title: str, category: str, price: float) -> dict:
    base = product_title.lower().strip()
    slug = base.replace("ı", "i").replace("ş", "s").replace("ç", "c").replace("ğ", "g").replace("ö", "o").replace("ü", "u")
    slug = "-".join(part for part in slug.split() if part)
    return {
        "focus_keyword": product_title,
        "secondary_keywords": [
            f"{category.lower()} {product_title.split()[0].lower() if product_title.split() else ''}".strip(),
            f"{product_title} fiyat",
            f"{product_title} yorumları",
            f"uygun fiyatlı {category.lower()}",
            f"en iyi {category.lower()}",
            f"{category.lower()} öneri",
        ],
        "seo_title": f"{product_title} — {category} | Hızlı Kargo & Güvenli Alışveriş",
        "meta_description": (
            f"{product_title} ₺{price:.0f} fiyatıyla Akıllı Market'te. "
            f"{category} kategorisinde uygun fiyat, hızlı kargo ve güvenli alışveriş."
        )[:160],
        "url_slug_suggestion": slug or "urun",
        "improvement_tips": [
            "Başlığa marka adını ve birincil anahtar kelimeyi başa yaklaştır.",
            "Açıklamanın ilk 160 karakterine ana fayda + fiyat sinyalini sıkıştır.",
            "Özellikler bölümünde teknik değerleri sayılarla ver — arama motoru zengin sonuç gösterir.",
            "Kategori-uzun-kuyruk (long-tail) kelimelerini kullanım senaryoları içine doğal yedir.",
            "Görsel alt metinlerine (alt text) ürün adı + kategori ekle.",
        ],
        "_mock": True,
    }


# ── Social Content Mock ────────────────────────────────────────────────────────

def get_mock_social_content(
    product_title: str,
    category: str,
    price: float,
    tone: str = "samimi",
    purpose: str = "guven",
    platforms: list[str] | None = None,
) -> dict:
    selected = platforms or ["instagram", "tiktok", "twitter"]
    response = {
        "tone": tone,
        "purpose": purpose,
        "platforms": selected,
        "instagram": None,
        "tiktok": None,
        "twitter": None,
        "_mock": True,
    }

    if "instagram" in selected:
        response["instagram"] = {
            "caption": (
                f"{product_title} ile alışverişte iç rahatlığı hissedin.\n\n"
                f"{category} kategorisinde öne çıkan bu ürün, net faydası ve uygun fiyatıyla günlük ihtiyaca pratik cevap verir. "
                f"Sadece ₺{price:.0f}."
            ),
            "hashtags": ["#alışveriş", "#kalite", "#uygunfiyat", "#türkiye", "#eticaret", "#güvenlialışveriş"],
            "cta": "Ürünü şimdi incele ve mağazada keşfet.",
            "overlay_text": "Her An Yanınızda, Her An Güvende",
        }

    if "tiktok" in selected:
        response["tiktok"] = {
            "hook": "Bu ürünü görünce alışveriş listen değişebilir.",
            "scenes": [
                {
                    "title": "Sahne 1",
                    "description": f"Ürün hızlı bir yakın planla görünür, ekranda '{product_title}' başlığı belirir.",
                },
                {
                    "title": "Sahne 2",
                    "description": f"{category} kullanım senaryosu gösterilir; pratik fayda ve fiyat vurgulanır.",
                },
                {
                    "title": "Sahne 3",
                    "description": f"Son karede ₺{price:.0f} fiyatı, güvenli alışveriş ve inceleme çağrısı yer alır.",
                },
            ],
            "caption": f"{product_title} ile günlük ihtiyacına pratik bir çözüm ekle. Ürünü incele, kararını rahat ver.",
            "hashtags": ["#ZekAI", "#Ürünİncelemesi", "#AkıllıAlışveriş", f"#{category.replace(' ', '')}"],
        }

    if "twitter" in selected:
        response["twitter"] = {
            "post": (
                f"{product_title} şimdi ₺{price:.0f}. "
                f"{category} kategorisinde net fayda, pratik kullanım ve güvenli alışveriş deneyimi arayanlar için."
            ),
            "hashtags": ["#alışveriş", "#fırsat"],
            "cta": "Ürünü incele",
        }

    return response


# ── Bundle Recommendation Mock ─────────────────────────────────────────────────

def get_mock_bundle_recommendations(primary_id: str, candidate_ids: list[str]) -> dict:
    recs = []
    if candidate_ids:
        recs.append({
            "complementary_product_id": candidate_ids[0],
            "semantic_score": 72,
            "why_together": "Bu iki ürünü birlikte alanlar genellikle aynı kullanım senaryosunda ihtiyaç duyuyor ve birlikte daha verimli kullanılabiliyor.",
            "bundle_title": "Akıllı İkili Paket",
            "bundle_short_description": "Birlikte alın, daha fazla tasarruf edin!",
            "bundle_campaign_text": "İkisini birlikte al, %10 kazan!",
            "cta_label": "Paketi Sepete Ekle",
            "suggested_discount": 10,
        })
    if len(candidate_ids) > 1:
        recs.append({
            "complementary_product_id": candidate_ids[1],
            "semantic_score": 58,
            "why_together": "Bu iki ürünü birlikte alanlar genellikle tamamlayıcı ihtiyaçları için tercih ediyor.",
            "bundle_title": "Komple Çözüm Paketi",
            "bundle_short_description": "Tüm ihtiyaçlarınız tek pakette.",
            "bundle_campaign_text": "Paketi al, %8 indirim kazan!",
            "cta_label": "Paketi İncele",
            "suggested_discount": 8,
        })
    return {
        "recommendations": recs,
        "missing_opportunity_note": "Demo mod: Gerçek AI analizi yapılamadı. Bu öneriler örnek verilerdir." if not recs else None,
        "_mock": True,
    }


# ── Image Mock (Picsum) ────────────────────────────────────────────────────────

_PICSUM_SEEDS = {
    "studio": ("studio", 800, 800),
    "unboxing": ("unboxing", 800, 600),
    "lifestyle": ("lifestyle", 800, 600),
}

_TINY_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAADklEQVQI12NgYGD4TwABBAEAIKkDlwAAAABJRU5ErkJggg=="
)


def fetch_picsum_b64(shot_type: str = "studio") -> tuple[str, str]:
    """Picsum.photos'tan görsel çek ve base64 olarak döndür."""
    seed, w, h = _PICSUM_SEEDS.get(shot_type, ("product", 800, 800))
    url = f"https://picsum.photos/seed/zekai_{seed}/{w}/{h}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ZekaiMock/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = resp.read()
            return base64.b64encode(data).decode("utf-8"), "image/jpeg"
    except Exception:
        return _TINY_PNG_B64, "image/png"
