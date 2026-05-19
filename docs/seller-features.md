# ZekAI Seller Studio — Özellik Detayları

ZekAI Seller Studio, Türk e-ticaret satıcılarının ürün listelemelerini, pazarlama içeriklerini ve müşteri iletişimini Google Gemini ile optimize etmelerini sağlayan AI katmanıdır. Satıcı, Akıllı Market hesabını ZekAI platformuna **Store Connect** mekanizmasıyla bağlar ve değişiklikler Akıllı Market'e gerçek zamanlı olarak yansır.

---

## Store Connect Mekanizması

Satıcı, ZekAI platformuna kendi Akıllı Market e-posta ve şifresini girer. `zekai-api`, bu bilgilerle `commerce-api`'ye login isteği atar ve dönen JWT token'ı `SellerStoreConnection` tablosunda şifreli olarak saklar. Sonraki tüm ürün okuma ve yazma işlemleri bu token aracılığıyla commerce-api'ye proxy'lenir — satıcının iki platformu ayrı ayrı yönetmesine gerek kalmaz.

---

## 1. AI İçerik Üretici

**Endpoint:** `POST /seller/ai-content`  
**Model:** `gemini-2.5-flash-lite`

### Nasıl Çalışır?
Satıcı mevcut ürün bilgilerini (başlık, kategori, fiyat, açıklama, özellikler) girer. İsteğe bağlı olarak:
- **Ürün görseli:** Gemini Vision görüntüyü analiz ederek renk, malzeme, form ve aksesuarları açıklamaya entegre eder.
- **Müşteri simülasyonu bağlamı:** Simülasyon sonucundaki "vazgeçme nedenleri" ve "kararsız kalma endişeleri" içerik üreticisine beslenir. Gemini, o müşteri itirazlarını birebir karşılayan içerik yazar.

### Çıktı
| Alan | Açıklama |
|------|----------|
| `title` | SEO uyumlu, anahtar kelime içeren başlık (50–80 karakter) |
| `short_description` | Ana fayda + benzersiz değer önerisi (maks. 160 karakter) |
| `description` | 3 paragraf: kullanım senaryosu → teknik detaylar → güven sinyalleri |
| `features` | 5 somut ve ölçülebilir özellik maddesi |
| `what_i_improved` | Satıcıya neyin neden değiştirildiğini açıklayan özet |

### Prompt Mühendisliği Notları
- Simülasyon verisi varsa "genel iyileştirme değil, bu müşterilerin vazgeçme nedenlerini çözen somut mesajlar" talimatı eklenir.
- Görsel verildiğinde multimodal içerik üretimi için `Part.from_bytes()` ile görseli Gemini'ye gönderir.
- Sıcaklık: `0.2` (tutarlı, düşük varyanslı çıktı).

---

## 2. Müşteri Simülasyonu

**Endpoint:** `POST /seller/simulate-stream` (SSE), `POST /seller/simulate` (JSON)  
**Model:** `gemini-2.5-flash-lite` (fallback: `gemini-2.5-flash`)

### Nasıl Çalışır?
Satıcının ürün sayfasını 5 farklı Türk alıcı profili inceler:

| Profil | Ad | Şehir | Odak Alanı |
|--------|----|-------|------------|
| Bütçe odaklı | Elif | İstanbul | Fiyat |
| Kalite arayan profesyonel | Mert | Ankara | Özellikler |
| Yorum okuyan | Zeynep | İzmir | Yorumlar |
| Hızlı karar veren | Burak | Bursa | Kargo |
| Tasarım odaklı | Derya | Eskişehir | Görseller |

Gemini tek yapılandırılmış çağrıyla (structured output) tüm 5 personayı üretir. Her persona için:
- `decision`: `buy` / `skip` / `undecided`
- `focusArea`: Ürün sayfasının hangi alanına baktığı (`image`, `price`, `reviews`, `features`, `shipping`, `warranty`, `cta`, vb.)
- `bubbleText`: O anda aklından geçen kısa düşünce (maks. 8 kelime)
- `monologue`: İç ses (220 karakter)
- `reason`: Karar gerekçesi
- `recommendation`: Satıcıya tek cümlelik somut öneri

### Akıllı Doğrulama Katmanı
Gemini çıktısı normalize edilir:
- Her persona farklı bir `focusArea`'ya sahip olmak zorundadır.
- Yorumlar varsa en az bir persona `reviews` odak alanına sahip olmalıdır.
- Tüm personaların `buy` kararı vermesi engellenir (gerçekçi dağılım zorlanır).

### Cache
Aynı ürün (SHA-256 key) için 24 saat cache — tekrarlı simülasyonlarda Gemini'ye gidilmez. Maksimum 256 kayıt, LRU benzeri temizleme.

### SSE Akışı
```
→ step: "Ürün sayfası ve hedef alanlar hazırlanıyor..."
→ step: "Tek simülasyon ajanı 5 müşteri perspektifini üretiyor..."
→ step: "Karar motoru müşteri tepkilerini sıralıyor..."
→ persona: { ...persona1... }   (0.15s gecikmeyle animasyonlu)
→ persona: { ...persona2... }
→ persona: { ...persona3... }
→ persona: { ...persona4... }
→ persona: { ...persona5... }
→ done
```

---

## 3. Sosyal Medya İçerik Üretici

**Endpoint:** `POST /seller/social-content`  
**Model:** `gemini-2.5-flash-lite`

### Parametreler
| Parametre | Seçenekler |
|-----------|------------|
| `tone` | `profesyonel` / `samimi` / `mizahi` |
| `purpose` | `satis` / `guven` / `tanitim` |
| `platforms` | `instagram`, `tiktok`, `twitter` (çoklu seçim) |
| `note` | Opsiyonel satıcı notu (kampanya, hedef kitle) |

### Platform Çıktıları

**Instagram:**
- Caption: 300–420 karakter
- Hashtag: 5–8 adet (#ile)
- CTA: Kısa çağrı cümlesi
- Overlay text: Görsel üstü metin (maks. 50 karakter)

**TikTok/Reels:**
- Hook: Dikkat çeken ilk cümle
- 3 sahne: Her biri `title` + `description`
- Caption + 3–5 hashtag

**X (Twitter):**
- Post: Maks. 220 karakter
- 1–3 hashtag
- Kısa CTA

### Structured Output
Tüm platformlar için tek Gemini çağrısı, Pydantic şemasıyla `SocialContentResponse` döner. Seçilmeyen platformlar `null` olarak gelir — gereksiz token harcanmaz.

---

## 4. AI Ürün Görseli Üretici

**Endpoint:** `POST /seller/ai-image` (tekil), `POST /seller/ai-images` (üçlü paralel)  
**Model:** `gemini-3.1-flash-image-preview`

### Çekim Türleri

| Tür | Açıklama | Kullanım |
|-----|----------|----------|
| **Stüdyo** | Beyaz arka plan, profesyonel ışık, pazaryeri kalitesi | Ana ürün fotoğrafı |
| **Kutu Açma** | Tüm aksesuarlarıyla flat-lay, üstten çekim | Ürün içeriğini gösterme |
| **Yaşam Tarzı** | Gerçek kullanım ortamı, sıcak ışık | Duygusal bağ kurma |

### Tekil Görsel (`/ai-image`)
İstek `style` parametresi alır (`studio` / `unboxing` / `lifestyle`). Aynı ürün + stil kombinasyonu daha önce üretilmişse Gemini'ye gitmeden cache'ten yanıt döner.

### Paralel Üçlü Görsel (`/ai-images`)
Üç çekim türü `asyncio.gather()` ile paralel olarak üretilir. Her biri bağımsız hata toleransına sahiptir: bir çekim başarısız olursa diğerleri yine de döner.

### Cache Stratejisi
- Anahtar: `SHA-256(ürün başlığı + kategori + açıklama + stil)`
- TTL: 24 saat
- Maksimum: 128 kayıt (FIFO temizleme)

---

## 5. Bundle (Paket) Önerisi

**Endpoint:** `POST /seller/bundle-recommend`  
**Model:** `gemini-2.5-flash-lite`

### Nasıl Çalışır?
Satıcı ana ürünü ve mağazasındaki aday tamamlayıcı ürünleri gönderir. Gemini üç kriter sırasıyla değerlendirir:

1. **Kullanım senaryosu örtüşmesi:** Birlikte kullanılır mı?
2. **Semantik uyum:** Aynı müşteri segmenti satın alır mı?
3. **Fiyat dengesi:** Çok pahalı veya çok ucuz değil mi?

Mantıklı bir eşleşme yoksa `missing_opportunity_note` döner — Gemini asla düşük uyumlu kombinasyon önermez.

### Çıktı (Her Paket İçin)
| Alan | İçerik |
|------|--------|
| `complementary_product_id` | Tamamlayıcı ürün ID |
| `semantic_score` | 0–100 uyum puanı |
| `why_together` | "Bu iki ürünü birlikte alanlar genellikle..." (1–2 cümle) |
| `bundle_title` | Kampanya adı (ör: "Ev Ofis İkilisi") |
| `bundle_short_description` | Paketin faydası (maks. 100 karakter) |
| `bundle_campaign_text` | Sepet metni (maks. 80 karakter) |
| `cta_label` | Buton metni |
| `suggested_discount` | Önerilen indirim oranı (%3–25) |

---

## 6. SEO Optimizasyonu

**Endpoint:** `POST /seller/seo`  
**Model:** `gemini-2.5-flash-lite`

### Çıktı
| Alan | Kural |
|------|-------|
| `focus_keyword` | Tek birincil ifade (2–4 kelime) |
| `secondary_keywords` | 5–8 long-tail varyasyon |
| `seo_title` | 50–65 karakter, anahtar kelime başa yakın |
| `meta_description` | 140–160 karakter, fayda + fiyat + güven + CTA |
| `url_slug_suggestion` | kebab-case, ASCII, maks. 60 karakter |
| `improvement_tips` | 4–6 satıcının bugün uygulayabileceği somut aksiyon |

Prompt, Akıllı Market mağazasına ve Türk arama davranışına özelleştirilmiştir.

---

## 7. Müşteri Sesi Analizi

**Endpoint:** `POST /seller/customer-voice`  
**Model:** `gemini-2.5-flash-lite`

### Nasıl Çalışır?
Satıcının ürün yorumları (ID, yazar, puan, metin) Gemini'ye gönderilir. İki ayrı görev tek çağrıda tamamlanır:

**Görev 1 — Yorum Yanıtları:**
- 5 yıldız kısa memnuniyet yorumlarına yanıt verilmez (`needs_reply: false`).
- Şikayet, soru, karışık veya düşük puanlı yorumlara profesyonel 1–3 cümlelik cevap üretilir.
- Kesin garanti/iade vaadi verilmez; müşteri suçlanmaz.
- `issue_type`: `kargo`, `urun_kalitesi`, `kurulum`, `kullanim`, `fiyat`, `diger`

**Görev 2 — SSS Önerileri:**
- Birden fazla yorumda geçen konulardan 3–5 SSS çıkarılır.
- Her SSS, hangi yorum ID'lerinden türetildiğini belirtir.
- `category_tag`: `kurulum`, `kullanim`, `sarj`, `kablo`, `garanti`, `boyut`, `diger`

---

## Mock Modu

Tüm seller AI endpointleri, `GOOGLE_API_KEY` tanımsız veya geçersizse **demo mock verileri** döner. Rate limit (HTTP 429) gibi geçici Gemini hatalarında da aynı mekanizma devreye girer. Frontend, `_mock: true` flag'ini görünce kullanıcıya demo modu uyarısı gösterir.

Bu sayede API key olmadan bile tüm Seller Studio UI'ı çalışır ve demo gösterimleri sıkışmaz.
