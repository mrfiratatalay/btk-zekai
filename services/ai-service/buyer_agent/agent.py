import os

from google.adk.agents import LlmAgent, ParallelAgent, SequentialAgent


MODEL = os.getenv("GOOGLE_ADK_MODEL", "gemini-2.0-flash-lite")

GLOBAL_RULES = """
Gorevin Zekai e-ticaret karar asistaninin kanita dayali alici analizini uretmek.
Kullanici mesaji ANALYSIS_INPUT JSON blogu icerir. Bu blogdaki buyer_need,
product, reviews, visual_data ve price_data alanlarini esas al.
Sadece gecerli JSON dondur. Markdown, aciklama metni veya kod blogu yazma.
Veri yoksa varsayim yaptigini acikca "unverified" veya "insufficient_data" olarak isaretle.
Skorlar 0-100 araliginda olmali.
"""


need_understanding_agent = LlmAgent(
    name="need_understanding",
    model=MODEL,
    description="Kullanicinin serbest metin ihtiyacini yapilandirilmis profile donusturur.",
    instruction=f"""
{GLOBAL_RULES}

Kullanicinin buyer_need metnini ve urun baglamini analiz et.
Sadece su JSON semasini dondur:
{{
  "primary_use_cases": ["..."],
  "must_have_features": ["..."],
  "nice_to_have_features": ["..."],
  "budget_tl": null,
  "risk_tolerance": "low|medium|high",
  "experience_level": "beginner|intermediate|expert",
  "usage_frequency": "daily|weekly|occasional",
  "key_concerns": ["..."]
}}
""",
    output_key="ihtiyac_profili",
)


product_reality_agent = LlmAgent(
    name="product_reality",
    model=MODEL,
    description="Urun aciklamasi ve teknik ozelliklerini analiz ederek gerceklik tespiti yapar.",
    instruction=f"""
{GLOBAL_RULES}

ANALYSIS_INPUT.product verisini incele. Teknik ozellik, aciklama ve vaatleri
tutarlilik, eksik kritik bilgi ve muhtemel abarti acisindan degerlendir.
Sadece su JSON semasini dondur:
{{
  "claimed_features": ["..."],
  "missing_critical_info": ["..."],
  "vague_claims": ["..."],
  "verified_specs": ["..."],
  "red_flags": ["..."],
  "overall_description_quality": "poor|fair|good|excellent"
}}
""",
    output_key="urun_gerceklik_analizi",
)


review_mining_agent = LlmAgent(
    name="review_mining",
    model=MODEL,
    description="Musteri yorumlarini analiz ederek guvenilir icgoruler cikarir.",
    instruction=f"""
{GLOBAL_RULES}

ANALYSIS_INPUT.reviews alanini ve urunun rating/reviewCount sinyallerini incele.
Yorum metni yoksa hacim ve puan sinyalleriyle sinirli kaldigini belirt.
Sadece su JSON semasini dondur:
{{
  "total_reviews": 0,
  "verified_purchase_ratio": 0.0,
  "top_complaints": [{{"category": "...", "frequency": 0, "sample_quote": "..."}}],
  "top_praises": [{{"category": "...", "frequency": 0, "sample_quote": "..."}}],
  "bot_review_signals": ["..."],
  "sentiment_distribution": {{"positive": 0, "neutral": 0, "negative": 0}},
  "reliability_score": 0.0,
  "key_insights": ["..."]
}}
""",
    output_key="yorum_analizi",
)


visual_forensics_agent = LlmAgent(
    name="visual_forensics",
    model=MODEL,
    description="Urun fotograflarini analiz ederek gorsel guvenilirlik tespiti yapar.",
    instruction=f"""
{GLOBAL_RULES}

ANALYSIS_INPUT.visual_data ve product.image/thumbnails alanlarini incele.
Gorseller URL ise goruntu icerigini dogrudan gordugunu iddia etme; URL sayisi,
cesitlilik ve urun aciklamasiyla beklenen gorsel kanit yeterliligini degerlendir.
Sadece su JSON semasini dondur:
{{
  "stock_photo_suspicion": true,
  "stock_photo_evidence": ["..."],
  "watermark_traces": ["..."],
  "customer_photo_consistency": "consistent|inconsistent|no_customer_photos",
  "customer_photo_issues": ["..."],
  "image_quality_assessment": "poor|fair|good|excellent",
  "visual_red_flags": ["..."],
  "visual_trust_score": 0.0
}}
""",
    output_key="gorsel_analizi",
)


price_market_agent = LlmAgent(
    name="price_market",
    model=MODEL,
    description="Urunun fiyat gecmisi ve pazar konumunu analiz eder.",
    instruction=f"""
{GLOBAL_RULES}

ANALYSIS_INPUT.price_data ve product.price/originalPrice/discountPercent alanlarini incele.
Sahte indirim ihtimalini, adil fiyat araligini ve alternatif satici sinyallerini yorumla.
Sadece su JSON semasini dondur:
{{
  "current_price_tl": 0.0,
  "original_price_tl": 0.0,
  "discount_percent": 0.0,
  "is_fake_discount": false,
  "fake_discount_evidence": "...",
  "market_median_price_tl": 0.0,
  "fair_price_range": {{"min": 0.0, "max": 0.0}},
  "alternative_sellers": [{{"name": "...", "price_tl": 0.0}}],
  "price_trend": "stable|increasing|decreasing|volatile",
  "price_fairness_score": 0.0
}}
""",
    output_key="fiyat_analizi",
)


return_risk_agent = LlmAgent(
    name="return_risk",
    model=MODEL,
    description="Kategori ve kullanici ihtiyacina gore iade riskini analiz eder.",
    instruction=f"""
{GLOBAL_RULES}

ANALYSIS_INPUT.product.category, buyer_need ve varsa return_data alanlarini incele.
Kullanicinin pişmanlik/iade riskini somut sebeplerle hesapla.
Sadece su JSON semasini dondur:
{{
  "return_risk_percent": 0,
  "top_return_reasons": [{{"label": "...", "percent": 0}}],
  "personal_warning": "...",
  "risk_drivers": ["..."],
  "confidence": "high|medium|low"
}}
""",
    output_key="iade_riski_analizi",
)


parallel_forensics = ParallelAgent(
    name="parallel_forensics",
    sub_agents=[
        product_reality_agent,
        review_mining_agent,
        visual_forensics_agent,
        price_market_agent,
        return_risk_agent,
    ],
)


risk_synthesis_agent = LlmAgent(
    name="risk_synthesis",
    model=MODEL,
    description="Tum analizleri birlestirerek nihai risk raporu uretir.",
    instruction=f"""
{GLOBAL_RULES}

Asagidaki state ciktilarini birlestir:
Kullanici ihtiyac profili: {{ihtiyac_profili}}
Urun gerceklik analizi: {{urun_gerceklik_analizi}}
Yorum analizi: {{yorum_analizi}}
Gorsel analizi: {{gorsel_analizi}}
Fiyat analizi: {{fiyat_analizi}}
Iade riski analizi: {{iade_riski_analizi}}

Sadece su JSON semasini dondur:
{{
  "fit_score": 0,
  "fit_score_reasoning": "...",
  "trust_score": 0,
  "trust_score_reasoning": "...",
  "price_fairness_score": 0,
  "price_fairness_reasoning": "...",
  "return_risk_percent": 0,
  "overall_recommendation": "buy|consider|avoid",
  "summary": "...",
  "key_warnings": ["..."],
  "key_strengths": ["..."],
  "evidence_map": {{
    "fit_score": ["..."],
    "trust_score": ["..."],
    "price_fairness": ["..."],
    "return_risk": ["..."]
  }}
}}
""",
    output_key="risk_raporu",
)


verification_agent = LlmAgent(
    name="verification",
    model=MODEL,
    description="Risk raporunu kanit bazinda dogrular ve temizler.",
    instruction=f"""
{GLOBAL_RULES}

Su risk raporunu ve onceki analizleri kanit kalitesi acisindan denetle:
Risk raporu: {{risk_raporu}}
Urun analizi: {{urun_gerceklik_analizi}}
Yorum analizi: {{yorum_analizi}}
Gorsel analizi: {{gorsel_analizi}}
Fiyat analizi: {{fiyat_analizi}}
Iade riski: {{iade_riski_analizi}}

Kanitsiz iddialari kaldir veya dogrulanamadi olarak isaretle.
Sadece su JSON semasini dondur:
{{
  "verified_fit_score": 0,
  "verified_trust_score": 0,
  "verified_price_fairness_score": 0,
  "verified_return_risk_percent": 0,
  "final_recommendation": "buy|consider|avoid",
  "final_summary": "...",
  "verified_warnings": [{{"warning": "...", "evidence": "...", "confidence": "high|medium|low"}}],
  "verified_strengths": [{{"strength": "...", "evidence": "...", "confidence": "high|medium|low"}}],
  "unverified_claims": ["..."],
  "user_dependent_claims": ["..."],
  "verification_quality": "high|medium|low"
}}
""",
    output_key="final_rapor",
)


root_agent = SequentialAgent(
    name="buyer_analysis_root",
    sub_agents=[
        need_understanding_agent,
        parallel_forensics,
        risk_synthesis_agent,
        verification_agent,
    ],
)
