# ZekAI — Gemini Ajan Mimarisi ve AI Tasarım Kararları

Bu belge ZekAI'ın Google Gemini API ve Google ADK (Agent Development Kit) kullanım mimarisini, tasarım kararlarını ve maliyet optimizasyonlarını açıklar.

---

## Kullanılan Modeller

| Model | Kullanım Alanı | Neden Bu Model? |
|-------|----------------|-----------------|
| `gemini-2.5-flash-lite` | Tüm seller AI endpointleri, buyer advisor, kombin, karşılaştırma | Hız + maliyet dengesi; structured output için yeterli kalite |
| `gemini-2.5-flash` | Buyer market check fallback, buyer ADK pipeline | Google Search Grounding için gerekli; daha derin analiz |
| `gemini-3.1-flash-image-preview` | Ürün görseli üretimi | Görüntü üretme kabiliyeti |
| `gemini-2.0-flash-lite` | Google ADK buyer_agent pipeline | ADK uyumlu model |

---

## AI Mimari Katmanları

### Katman 1 — Seller AI (Doğrudan Structured Output)

Seller Studio özellikleri tek Gemini çağrısı + Pydantic structured output ile çalışır. Bu katmanda ajan koordinasyonuna ihtiyaç yoktur; Gemini doğrudan istenen şemada JSON üretir.

```python
response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents=prompt,
    config=GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=SocialContentResponse,  # Pydantic şeması
        temperature=0.2,
    )
)
result = SocialContentResponse.model_validate_json(response.text)
```

**Neden structured output?**  
- JSON parse hataları sıfıra iner (Gemini şemayı garantiyle üretir).
- Frontend type-safe veri alır.
- Prompt mühendisliğinde "JSON üret" talimatına gerek kalmaz; token tasarrufu.

### Katman 2 — Buyer Advisor (Koşullu İki Aşamalı Akış)

Buyer analizi iki aşamalı bir akış izler. İkinci aşama (market check) yalnızca birinci aşama "piyasa verisi gerekli" dediğinde çalışır:

```python
# Adım 1: Her zaman çalışır
advisor = await asyncio.to_thread(
    _run_advisor_sync, client, req  # Gemini 2.5 Flash Lite
)

# Adım 2: Koşullu
if advisor.needs_market_check:
    market = await asyncio.to_thread(
        _run_market_check_sync, client, req, advisor  # + Google Search Grounding
    )
```

**`needs_market_check` tetikleyicileri:**
- Kullanıcı net bir bütçe belirtiyorsa
- Fiyat çok kritik bir faktörse
- Güven veya fiyat belirsizse
- Daha iyi alternatif ihtimali karar için belirleyiciyse

Bu tasarım sayesinde çoğu istek tek Gemini çağrısıyla tamamlanır. Google Search Grounding'ın ek maliyeti yalnızca gerektiğinde ödenir.

### Katman 3 — Google ADK Çok-Ajan Pipeline

`buyer_agent/agent.py`, Google ADK'nin `SequentialAgent` ve `ParallelAgent` bileşenlerini kullanarak tam çok-ajan analiz mimarisi kurar.

---

## Google ADK Ajan Detayları

### `need_understanding_agent` — İhtiyaç Anlayıcı

```python
need_understanding_agent = LlmAgent(
    name="need_understanding",
    model="gemini-2.0-flash-lite",
    output_key="ihtiyac_profili",
    instruction="Kullanıcının buyer_need metnini ve ürün bağlamını analiz et. "
                "primary_use_cases, must_have_features, risk_tolerance, "
                "experience_level, usage_frequency, key_concerns üret."
)
```

**Görev:** Alıcının serbest metin ihtiyacını yapılandırılmış bir profile dönüştürür. Sonraki ajanlar bu profili referans alır.

---

### `parallel_forensics` — 4'lü Paralel Analiz

```python
parallel_forensics = ParallelAgent(
    name="parallel_forensics",
    sub_agents=[
        product_reality_agent,
        review_mining_agent,
        price_market_agent,
        return_risk_agent,
    ]
)
```

4 ajan aynı anda çalışır. Toplam süre, en yavaş ajanın süresiyle sınırlıdır (sıralı çalışmaya göre ~4x hızlı).

#### `product_reality_agent` — Ürün Gerçeklik Tespiti
```
Çıktı: {
  claimed_features, missing_critical_info, vague_claims,
  verified_specs, red_flags, overall_description_quality
}
```
Ürün açıklamasındaki belirsiz vaatler, eksik kritik bilgiler ve abartıları tespit eder.

#### `review_mining_agent` — Yorum Madenciliği
```
Çıktı: {
  top_complaints, top_praises, bot_review_signals,
  sentiment_distribution, reliability_score, key_insights
}
```
Yorumlardaki örüntüleri çıkarır. Bot yorum sinyallerini (çok kısa, benzer metinler, verified oranı düşük) işaretler.

#### `price_market_agent` — Fiyat Analizi
```
Çıktı: {
  is_fake_discount, fake_discount_evidence,
  price_fairness_score, price_comment
}
```
Sahte indirim olasılığını ve genel fiyat makullüğünü değerlendirir.

#### `return_risk_agent` — İade Riski
```
Çıktı: {
  return_risk_percent, top_return_reasons,
  personal_warning, risk_drivers, confidence
}
```
Kategori, ihtiyaç uyumu ve şikayet sinyallerine göre iade olasılığını hesaplar.

---

### `risk_synthesis_agent` — Risk Sentezleyici

4 paralel ajanın state çıktısını alır ve birleşik bir risk raporu üretir:

```
{ihtiyac_profili} + {urun_gerceklik_analizi} + {yorum_analizi} +
{fiyat_analizi} + {iade_riski_analizi}
→ fit_score, trust_score, price_fairness_score, return_risk_percent,
  overall_recommendation, summary, key_warnings, key_strengths
```

### `verification_agent` — Doğrulama

Risk raporunu kanıt kalitesi açısından denetler:
- Kanıtsız iddiaları kaldırır veya `unverified` olarak işaretler
- Güven düzeyi belirsiz bulguları `user_dependent_claims`'e taşır
- `verification_quality`: `high` / `medium` / `low` döner

---

## Google Search Grounding

Market check aşamasında Gemini, Google Search aracıyla gerçek zamanlı Türkiye piyasası araması yapar:

```python
config = GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=MarketCheckReport,
    tools=[Tool(google_search=GoogleSearch())],
)
```

**Çıktı:**
- `price_assessment`: `ucuz` / `makul` / `pahali` / `bilinmiyor`
- `market_price_candidates`: Bulunan piyasa fiyatları (maks. 5)
- `alternatives`: Daha uygun alternatifler (maks. 2)

**Güvenlik sınırları:** Alternatifler yalnızca alıcının ihtiyacına gerçekten daha uygun görünüyorsa eklenir. Uydurma URL kesinlikle yazılmaz.

---

## Deterministik Karar Motoru

Gemini AI nihai kararı vermez. `decide()` ve `calculate_price_fairness()` fonksiyonları deterministik kurallara göre çalışır:

```python
def decide(fit, trust, price_fairness, return_risk, warnings, strengths, alternatives):
    # Yüksek risk varsa direkt "alma"
    if return_risk > 65 and fit < 50:
        return "alma"
    # Yüksek uyum + iyi güven + makul fiyat → "al"
    if fit >= 70 and trust >= 65 and price_fairness >= 60 and return_risk <= 40:
        return "al"
    # Orta seviye sinyaller → "dusun"
    ...
```

**Neden deterministik karar?**  
Gemini'nin "al" / "alma" kararı vermesi risk taşır — aynı girdiler için farklı çıktılar üretebilir. Kanıta dayalı skorları deterministik fonksiyonlarla kararlandırmak hem tutarlılığı hem de açıklanabilirliği garanti altına alır.

---

## Maliyet Optimizasyonu

### 1. Minimum Model, Maksimum Structured Output
Tüm seller endpointleri `gemini-2.5-flash-lite` kullanır. Structured output sayesinde modelin açıklama metni yazması engellenir; yalnızca gerekli JSON üretilir.

### 2. Koşullu Market Check
Buyer analizinin ~%70'i tek Gemini çağrısıyla tamamlanır. Market check yalnızca fiyat kritik veya belirsiz olduğunda tetiklenir.

### 3. In-Memory Cache
| Feature | TTL | Maks. Kayıt |
|---------|-----|-------------|
| Müşteri simülasyonu | 24 saat | 256 |
| Kombin analizi | 24 saat | 256 |
| AI görsel | 24 saat | 128 |

Anahtar SHA-256 hash — aynı girdi her zaman aynı cache'e denk gelir.

### 4. Paralel Görsel Üretimi
`/seller/ai-images` endpoint'i `asyncio.gather()` ile 3 görseli paralel üretir. Bağımsız hata toleransı: bir görsel başarısız olursa diğerleri yine döner.

### 5. Mock Fallback
API key yoksa veya Gemini geçici hata verirse `mock/responses.py`'den demo veri döner. Demo gösterimlerinin AI limitine takılması engellenir.

---

## Prompt Mühendisliği İlkeleri

### Satıcı AI Promptları
- Her prompt Türkçe çıktı zorunluluğunu açıkça belirtir.
- Kural seti sonuna "MUTLAKA UY" başlıklı bölüm eklenir — Gemini kural ihlaline karşı önlem.
- Platform özelleştirmesi (Instagram vs TikTok) prompt içinde karakter/kelime sınırları olarak verilir.
- Simülasyon promptunda "Aynı ürünü herkes satın almasın; en az 1 persona skip veya undecided olmalı" kuralı zorunlu dağılım sağlar.

### Alıcı AI Promptları
- "Emin olmadığın iddiayı kesin konuşma" talimatı hallüsinasyonu azaltır.
- "Final kararı verme; skor, uyarı ve güçlü sinyal üret. Karar kod tarafında verilecek." — sorumluluk ayrımı.
- Market check promptunda "Uydurma URL yazma" kısıtı açıkça belirtilir.

### ADK Ajan Promptları
- `GLOBAL_RULES` sabit bloğu tüm ajanlarda tekrarlanır — ortak zemin.
- Her ajan yalnızca kendi `output_key` çıktısından sorumludur; sınırlar netdir.
- "Sadece bu tek ürün sayfası bilgisine dayan" — dış bilgi halüsinasyonunu engeller.

---

## Hata Yönetimi Hiyerarşisi

```
genai_errors.APIError
├── status_code 429 (Rate Limit)     → Mock fallback
├── status_code 500/502/503/504      → Mock fallback
├── status_code 408 (Timeout)        → Mock fallback
└── Diğer API hataları               → HTTP 503 raise

ValidationError / JSONDecodeError    → "Tekrar deneyin" mesajı + SSE error event
asyncio.TimeoutError                 → Retryable olarak işaretlenir

asyncio.wait_for(timeout)
├── Seller: N/A (non-streaming)
├── Buyer Advisor: 45s timeout
├── Market Check: 45s timeout
└── Compare: 30s timeout
```

---

## Gemini Thinking Modu

Bazı endpointlerde Gemini'nin "düşünme" bütçesi ortam değişkeniyle yapılandırılır:

```python
thinking_config=ThinkingConfig(thinking_budget=THINKING_BUDGET)
```

Varsayılan: `0` (düşünme devre dışı — maksimum hız, minimum maliyet).  
SEO ve sosyal medya gibi daha nüanslı çıktılar için ortam değişkeniyle artırılabilir:

```env
GEMINI_SEO_THINKING_BUDGET=1024
GEMINI_SOCIAL_THINKING_BUDGET=512
```
