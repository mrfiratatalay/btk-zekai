# ZekAI Buyer Assistant — Özellik Detayları

ZekAI Buyer Assistant, Türk e-ticaret alıcılarının daha iyi satın alma kararları vermesini sağlar. Alıcı bir ürün linki yapıştırır, kendi ihtiyacını serbest metinle yazar ve ZekAI o ürünün gerçekten uygun olup olmadığını, fiyatının adil olup olmadığını ve iade riskini kanıta dayalı olarak analiz eder.

---

## 1. Ürün Analizi — Tekil Ürün Karar Ajanı

**Endpoint:** `POST /buyer/analyze` (SSE stream)  
**Model:** `gemini-2.5-flash-lite` (Advisor) + `gemini-2.5-flash` + Google Search Grounding (Market Check)

### Akış Mimarisi

```
zekai-platform-web
  └─► POST zekai-api /api/buyer/analyze
        └─► POST ai-service /buyer/analyze  ──► SSE stream ──► UI
              │
              ├─► Adım 1: Buyer Advisor
              │     └─► Tek Gemini çağrısı — ihtiyaç + ürün + yorumları değerlendirir
              │           Çıktı: fit_score, trust_score, price_fairness_score,
              │                  return_risk_percent, warnings, strengths,
              │                  needs_market_check (bool)
              │
              └─► Adım 2: Market Check (KOŞULLU)
                    Yalnızca advisor "piyasa verisi gerekli" dediğinde:
                    └─► Gemini + Google Search Grounding
                          Çıktı: price_assessment, market_price_candidates,
                                 alternatives (maks. 2)
```

### Karar Motoru (Deterministik)
Gemini skorları ve opsiyonel piyasa verisi deterministik `decide()` fonksiyonuna beslenir. Nihai karar Gemini'nin değil, kod katmanının kararıdır:

| Karar | Koşul |
|-------|-------|
| **Al** | Yüksek uyum, iyi güven, makul fiyat, düşük risk |
| **Düşün** | Orta seviye sinyaller veya çelişkili veriler |
| **Alma** | Düşük uyum, yüksek risk veya aşırı pahalı |

### Skor Bileşenleri

**Uyum Skoru (0–100)**  
Bu ürün alıcının ihtiyacını karşılıyor mu? Alıcının `buyer_need` metni ile ürünün özellikleri ve açıklaması karşılaştırılır.

**Güven Skoru (0–100)**  
Ürün sayfası ve yorumlar ne kadar güvenilir? Yorum sayısı, doğrulanmış satın alma oranı, sahte yorum sinyalleri ve açıklama tutarsızlıkları değerlendirilir.

**Fiyat Adalet Skoru (0–100)**  
Piyasa verisi varsa `calculate_price_fairness()` fonksiyonu gerçek medyan fiyatla karşılaştırma yapar:

| Fiyat / Medyan Oranı | Skor |
|---------------------|------|
| ≤ %75 (çok ucuz) | 80 |
| %75–95 (uygun) | 92 |
| %95–105 (piyasa fiyatı) | 85 |
| %105–120 (biraz pahalı) | 65 |
| %120–150 (pahalı) | 40 |
| > %150 (çok pahalı) | 20 |

Piyasa verisi yoksa advisor'ın tahmini kullanılır.

**İade Riski (%)**  
`calculate_return_risk()` fonksiyonu kategori bazlı baz risk, uyum skoru, güven skoru ve yorum itirazlarını birleştirerek hesaplar.

### SSE Olay Akışı
```
author: "buyer_advisor"   → "Ürün ve ihtiyaç birlikte değerlendiriliyor..."
author: "buyer_advisor"   → { advisor raporu JSON }
author: "market_check"    → "Fiyat ve alternatifler için kısa piyasa kontrolu..." (koşullu)
author: "market_check"    → { piyasa raporu JSON } (koşullu)
author: "decision"        → "Karar raporu hazırlanıyor..."
author: "decision"        → { nihai rapor JSON }
```

### Nihai Rapor Alanları
| Alan | Açıklama |
|------|----------|
| `fit_score` | Ürün-ihtiyaç uyumu (0–100) |
| `trust_score` | Güven puanı (0–100) |
| `price_fairness_score` | Fiyat adaleti (0–100) |
| `return_risk_percent` | İade riski (%) |
| `verdict` | `al` / `dusun` / `alma` kararı |
| `final_summary` | Alıcıya sade Türkçe özet |
| `warnings` | Uyarılar (kanıt + güven düzeyi) |
| `strengths` | Güçlü sinyaller (kanıt + güven düzeyi) |
| `return_risk_factors` | Risk faktörleri listesi |
| `market_context` | Piyasa bağlamı (Google Search varsa) |
| `market_price_candidates` | Bulunan piyasa fiyatları |
| `alternatives` | Daha uygun alternatifler (varsa) |
| `used_search` | Google Search Grounding kullanıldı mı? |

---

## 2. Ürün Analizi — Google ADK Çok-Ajan Mimarisi

> **Not:** AI Service aynı zamanda Google ADK tabanlı tam çok-ajan alıcı analizini de destekler. Bu mimari `buyer_agent/` klasöründe tanımlanmıştır.

### Ajan Hiyerarşisi
```python
root_agent = SequentialAgent(
    name="buyer_analysis_root",
    sub_agents=[
        need_understanding_agent,   # Adım 1
        parallel_forensics,         # Adım 2 (4 ajan paralel)
        risk_synthesis_agent,       # Adım 3
        verification_agent,         # Adım 4
    ]
)
```

### Paralel Forensics Ajanları

| Ajan | Görev | Çıktı Key |
|------|-------|-----------|
| `product_reality` | Ürün açıklaması gerçeklik tespiti, abartı tespiti | `urun_gerceklik_analizi` |
| `review_mining` | Yorum madenciliği, duygu analizi, bot yorum sinyalleri | `yorum_analizi` |
| `price_market` | Fiyat geçmişi, sahte indirim tespiti | `fiyat_analizi` |
| `return_risk` | Kategori bazlı iade riski hesabı | `iade_riski_analizi` |

### Durum Yönetimi (State)
Her ajan sonucunu ADK `output_key` ile session state'e yazar. Sonraki ajanlar bu state'i `{key}` template sözdizimi ile okur.

```
{ihtiyac_profili}         ← need_understanding_agent çıktısı
{urun_gerceklik_analizi}  ← product_reality_agent çıktısı
{yorum_analizi}           ← review_mining_agent çıktısı
{fiyat_analizi}           ← price_market_agent çıktısı
{iade_riski_analizi}      ← return_risk_agent çıktısı
```

`risk_synthesis_agent` tüm bu state'leri birleştirir. `verification_agent` kanıtsız iddiaları tespit edip temizler veya "unverified" olarak işaretler.

---

## 3. Kombin Analizi

**Endpoint:** `POST /buyer/kombin-analyze` (SSE stream)  
**Model:** `gemini-2.5-flash-lite`

### Senaryo
Alıcı birden fazla ürünü birlikte almayı düşünüyordur — örneğin laptop + mouse + laptop çantası. Her ürünü ayrı ayrı analiz etmiştir; şimdi hepsinin birlikte ne kadar mantıklı olduğunu öğrenmek ister.

### Parametre Yapısı
```json
{
  "goal": "Kampüs için ofis kurulumu",
  "budget": 15000,
  "use_cases": ["ders çalışma", "proje geliştirme"],
  "priorities": ["taşınabilirlik", "batarya ömrü"],
  "style": ["minimalist", "gri-beyaz"],
  "products": [
    { "id": "...", "title": "...", "category": "...", "price": 9999 },
    ...
  ]
}
```

### Skor Sistemi
| Skor | Ağırlık | Açıklama |
|------|---------|----------|
| `needFit` | %42 | Kombinin amaca uyumu |
| `partFit` | %34 | Parçaların birbiriyle uyumu |
| `budgetBalance` | %18 | Bütçe dengesi |
| `risk` | %6 | Kombinasyonun riski |

**Bütçe Denge Tablosu:**
| Harcama / Bütçe | Skor |
|-----------------|------|
| ≤ %75 | 92 |
| %75–95 | 84 |
| %95–100 | 76 |
| %100–115 (hafif aşım) | 58 |
| %115–135 | 42 |
| > %135 | 25 |

### Ürün Rolleri
- **`ana`:** Kombinin olmaz olmaz ürünü (yalnızca 1 adet)
- **`tamamlayici`:** Ana ürünü destekleyen parçalar
- **`opsiyonel`:** Olsa güzel ama olmasa da olur

**Deterministik Sıralama:** Satın alma sırası rol + uyum skoru + fiyata göre deterministik hesaplanır — alıcıya "önce bunu al" önerisi sunulur.

### SSE Akışı
```
agent: "kombin_planner"  → "Ürünler ve bütçe hazırlanıyor..."
                        → partial_scores (ilk skor tahmini)
agent: "fit_advisor"    → "Kombinin ihtiyaca ve tarza uyumu değerlendiriliyor..."
                        → kombin_advisor raporu
agent: "decision_engine" → "Bütçe, risk ve satın alma sırası hesaplanıyor..."
                         → nihai kombin raporu
```

### Cache
Aynı kombin (SHA-256 ile: ürünler + amaç + bütçe + öncelikler) 24 saat cache'lenir.

---

## 4. Ürün Karşılaştırma

**Endpoint:** `POST /buyer/compare-verdict` (SSE stream)  
**Model:** `gemini-2.5-flash-lite`

### Senaryo
Alıcı 2 veya 3 ürünü analiz etmiştir ve artık belirli bir ihtiyaç için hangisinin daha iyi olduğuna karar vermek istemektedir.

### Girdi
Her ürün için analiz sonuçları (fit_score, trust_score, price_score, return_risk_percent) ve kullanıcının karşılaştırma ihtiyacı metni gönderilir.

### Çıktı
| Alan | Açıklama |
|------|----------|
| `winner_id` | Bu ihtiyaç için kazanan ürün ID'si |
| `headline` | 4–6 kelime özet başlık |
| `winner_reason` | Neden bu ürün (1–2 cümle) |
| `caution` | Varsa dikkat edilmesi gereken nokta |
| `product_verdicts` | Her ürün için: `one_line_reason` + `relative_fit` |

**Relative Fit Değerleri:**
- `best`: Bu ihtiyaç için açıkça en iyi seçim (yalnızca 1 ürün)
- `ok`: Makul alternatif
- `skip`: Bu ihtiyaç için önerilmez

---

## Güven & Kanıt Sistemi

ZekAI'ın alıcı analizinde her uyarı ve güçlü sinyal bir `confidence` (güven) düzeyi taşır:

| Düzey | Anlam |
|-------|-------|
| `high` | Birden fazla kaynakla doğrulanmış |
| `medium` | Tek kaynak veya çıkarım |
| `low` | Belirsiz veya yetersiz veri |

Gemini, emin olmadığı iddiaları `unverified` olarak işaretler. Verification ajanı kanıtsız güçlü iddiaları rapordan çıkarır veya güven düzeyini düşürür.

---

## Hata Dayanıklılığı

| Hata Türü | Yanıt |
|-----------|-------|
| Gemini geçici hata (429, 500, 503) | SSE stream'de bilgi mesajı, eldeki verilerle devam |
| JSON parse hatası | Kullanıcıya "tekrar deneyin" mesajı |
| Market check başarısız | Advisor verisiyle devam edilir |
| GOOGLE_API_KEY eksik | SSE stream'de açıklayıcı hata mesajı |

Timeout değerleri ortam değişkenleriyle yapılandırılabilir:
- `BUYER_ADVISOR_TIMEOUT_SECONDS`: 45 (varsayılan)
- `BUYER_MARKET_TIMEOUT_SECONDS`: 45 (varsayılan)
- `COMPARE_TIMEOUT_SECONDS`: 30 (varsayılan)
