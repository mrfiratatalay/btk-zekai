# ZekAI — Jüri Demo Rehberi

Bu belge jürinin ZekAI platformunu canlı ortamda adım adım test edebilmesi için hazırlanmıştır. Tüm linkler production ortamına işaret eder.

---

## Önce: Servisleri Uyandırın

Render'ın ücretsiz tier'ında servisler hareketsizlik sonrası uyku moduna girer. Demo öncesinde şu linkleri açarak servisleri uyandırın (~30–60 saniye):

1. [https://zekai-ai-service.onrender.com/health](https://zekai-ai-service.onrender.com/health) → `{"status": "ok", ...}` görünmeli
2. [https://zekai-commerce-api.onrender.com/swagger](https://zekai-commerce-api.onrender.com/swagger) → Swagger UI açılmalı
3. [https://zekai-api.onrender.com/swagger](https://zekai-api.onrender.com/swagger) → Swagger UI açılmalı

---

## Bölüm 1 — Alıcı Akışı

**Platform:** [https://akilli-markett.vercel.app](https://akilli-markett.vercel.app)

### Adım 1: Akıllı Market'e Göz Atın
1. [https://akilli-markett.vercel.app](https://akilli-markett.vercel.app) adresini açın.
2. Ana sayfada listelenen ürünleri inceleyin.
3. Bir ürüne tıklayın, ürün sayfasını görüntüleyin.
4. URL'yi kopyalayın: `https://akilli-markett.vercel.app/product/{id}`

### Adım 2: ZekAI'a Geçin ve Ürünü Analiz Edin
1. [https://zekai-platformm.vercel.app](https://zekai-platformm.vercel.app) adresini açın.
2. Sağ üstten **Giriş Yap** butonuna tıklayın.
3. **Alıcı hesabı** ile giriş yapın:
   - E-posta: `buyer@zekai.com`
   - Şifre: `Buyer123!`
4. Ana sayfadaki arama alanına kopyaladığınız Akıllı Market ürün URL'sini yapıştırın.
5. İhtiyaç alanına şunu yazın:  
   `"Evde her gün kullanmak için, bütçem 500 TL, yorumlarda kaliteli olduğu söyleniyor mu görmek istiyorum"`
6. **Analiz Et** butonuna tıklayın.

**Gözlemleyin:**
- Sol panel: AI analizin adım adım akışı (SSE stream)
- Uyum skoru, güven skoru, fiyat adaleti, iade riski
- Güçlü sinyaller ve uyarılar (kanıt düzeyleriyle birlikte)
- Nihai karar: Al / Düşün / Alma
- Piyasa fiyat karşılaştırması (Google Search Grounding devredeyse)

### Adım 3: Kombin Analizi
1. Analiz ettiğiniz ürünü **Kombine Ekle** butonuyla kombin listesine ekleyin.
2. Akıllı Market'ten başka bir ürün analiz edin, onu da ekleyin.
3. Platform menüsünden **Kombinlerim** sekmesine gidin.
4. Bir kombini açın, **Amaç** ve **Bütçe** girin.
5. Kombin analizini başlatın.

**Gözlemleyin:**
- Her ürünün kombindeki rolü (Ana / Tamamlayıcı / Opsiyonel)
- Bütçe denge skoru
- Önerilen satın alma sırası
- Eksik parça uyarısı (varsa)

### Adım 4: Ürün Karşılaştırma
1. **Karşılaştır** sekmesine gidin.
2. Daha önce analiz ettiğiniz 2 ürünü seçin.
3. Karşılaştırma ihtiyacını yazın: `"Günlük taşıma ve uzun batarya için hangisi daha iyi?"`
4. Karşılaştırmayı başlatın.

**Gözlemleyin:**
- Kazanan ürün ve gerekçesi
- Her ürün için "relative fit": en iyi / kabul edilebilir / önerilmez
- Dikkat notu (varsa)

---

## Bölüm 2 — Satıcı Akışı

**Platform:** [https://zekai-platformm.vercel.app](https://zekai-platformm.vercel.app)

### Adım 1: Satıcı Hesabıyla Giriş
1. Çıkış yapın (veya gizli pencere açın).
2. ZekAI platformuna **Satıcı hesabıyla** giriş yapın:
   - E-posta: `seller@zekai.com`
   - Şifre: `Seller123!`

### Adım 2: Demo Store Bağlantısı (Store Connect)
1. Sol menüden **Seller Studio** veya **Ayarlar** bölümüne gidin.
2. **Mağaza Bağla** seçeneğini bulun.
3. Akıllı Market satıcı hesabıyla bağlantı kurun:
   - E-posta: `mehmet@ornekstore.com`
   - Şifre: `Seller123!`
4. Bağlantı kurulduktan sonra mağazanızdaki ürünler listede görünecektir.

### Adım 3: AI İçerik Üretici
1. Ürün listesinden bir ürün seçin.
2. **AI İçerik Üret** sekmesine gidin.
3. Mevcut ürün bilgileri otomatik doldurulmuştur.
4. **Üret** butonuna tıklayın.

**Gözlemleyin:**
- SEO uyumlu başlık
- Kısa açıklama
- 3 paragraflık ürün açıklaması
- 5 özellik maddesi
- "Ne değiştirdim?" özeti

5. Beğendiğiniz içeriği **Kaydet** ile Akıllı Market'e gönderin.
6. [https://akilli-markett.vercel.app/product/{id}](https://akilli-markett.vercel.app) adresinde ürün sayfasını kontrol edin — değişiklikler yansımış olmalı.

### Adım 4: Müşteri Simülasyonu
1. Aynı ürün üzerinde **Müşteri Simülasyonu** sekmesine geçin.
2. **Simülasyonu Başlat** butonuna tıklayın.

**Gözlemleyin (SSE stream ile canlı animasyon):**
- 5 persona sırayla sahneye girer
- Her persona ürün sayfasının farklı bir alanına odaklanır (görsel, fiyat, yorumlar, kargo, özellikler)
- Düşünce balonu: "Kargoya bakıyor...", "Fiyatı tartıyor..."
- Karar: Satın Aldı / Vazgeçti / Kararsız
- Her persona için satıcıya somut öneri

3. Simülasyon bitince **AI İçerik Üretici**'ye dönün ve **Simülasyon Bulgularıyla Üret** seçeneğini kullanın. Gemini bu sefer müşteri itirazlarını birebir karşılayan içerik üretir.

### Adım 5: Sosyal Medya İçerik Üretici
1. **Sosyal Medya** sekmesine geçin.
2. Ton: **Samimi**, Amaç: **Satış**, Platformlar: Instagram + TikTok seçin.
3. İsteğe bağlı not ekleyin: `"Bu hafta %20 indirimli, stok sınırlı"`
4. **Üret** butonuna tıklayın.

**Gözlemleyin:**
- Instagram: Hazır caption, hashtag listesi, overlay text
- TikTok: Hook cümlesi + 3 sahne senaryosu
- Her platform için ayrı içerik

### Adım 6: AI Ürün Görseli
1. **AI Görsel** sekmesine geçin.
2. **3 Çekim Üret** butonuna tıklayın.

**Gözlemleyin:**
- Stüdyo çekimi (beyaz arka plan)
- Kutu açma düzeni (flat lay)
- Yaşam tarzı (kullanım ortamı)

### Adım 7: SEO Optimizasyonu
1. **SEO** sekmesine geçin.
2. **SEO Analizi Yap** butonuna tıklayın.

**Gözlemleyin:**
- Odak anahtar kelime
- 5–8 secondary keyword
- SEO başlığı ve meta açıklaması
- URL slug önerisi
- Bugün uygulanabilecek 4–6 somut öneri

### Adım 8: Müşteri Sesi Analizi
1. **Müşteri Yorumları** sekmesine geçin (ürünün yorumları listelenmiş olacak).
2. **AI ile Analiz Et** butonuna tıklayın.

**Gözlemleyin:**
- Her yorum için: cevap gerekli mi? Varsa hazır cevap taslağı.
- 3–5 SSS önerisi
- Hangi yorumlardan türetildiği bilgisi

---

## Bölüm 3 — API Dokümantasyonu

### Commerce API Swagger
[https://zekai-commerce-api.onrender.com/swagger](https://zekai-commerce-api.onrender.com/swagger)

Akıllı Market'in tüm REST endpoint'leri: ürün CRUD, sipariş yönetimi, kullanıcı kimlik doğrulama.

### ZekAI API Swagger
[https://zekai-api.onrender.com/swagger](https://zekai-api.onrender.com/swagger)

ZekAI platformunun tüm endpoint'leri: buyer analiz proxy, seller studio proxy, store connect.

### AI Service Health
[https://zekai-ai-service.onrender.com/health](https://zekai-ai-service.onrender.com/health)

```json
{
  "status": "ok",
  "googleApiKeyConfigured": true
}
```

---

## Yerel Kurulum (İsteğe Bağlı)

Jüri sistemi kendi ortamında da çalıştırmak isterse:

```bash
# 1. Google AI Studio'dan API key alın
#    https://aistudio.google.com → "Get API Key"

# 2. .env oluşturun
cp .env.example .env
# GOOGLE_API_KEY=... satırını doldurun

# 3. Docker ile başlatın
docker compose up --build

# Açılan URL'ler:
# Akıllı Market: http://localhost:3000
# ZekAI Platform: http://localhost:3001
# Commerce API:   http://localhost:5001/swagger
# ZekAI API:      http://localhost:5002/swagger
# AI Service:     http://localhost:8000/health
```

---

## Değerlendirme Kriterleri — ZekAI'ın Yanıtları

| Kriter | ZekAI'ın Yaklaşımı |
|--------|---------------------|
| **Kullanıcı Değeri (20 puan)** | İki taraflı değer: satıcı daha iyi satar, alıcı daha iyi karar verir. Her özellik gerçek bir problemi çözer. |
| **Teknik Puan (20 puan)** | Google ADK çok-ajan mimarisi, Pydantic structured output, SSE streaming, Clean Architecture, deterministik karar motoru. |
| **Performans ve Doğruluk (10 puan)** | In-memory cache (simülasyon/kombin/görsel), paralel görsel üretimi, `asyncio.wait_for()` timeout koruması, mock fallback. |
| **Ajanlar Yapısı (10 puan)** | SequentialAgent + ParallelAgent (ADK), koşullu Google Search Grounding, 4 paralel forensics ajanı, doğrulama katmanı. |
| **Yenilikçilik ve Özgünlük (10 puan)** | Müşteri simülasyonu (5 persona SSE), çoklu görsel çekim türü (Gemini Image), kombin satın alma sırası, kanıt düzeyli uyarı sistemi. |
| **Kullanıcı Dostu Çalışma (10 puan)** | SSE ile gerçek zamanlı AI akışı, mock modu (demo her zaman çalışır), tek tıkla Akıllı Market'e yayınlama. |
| **Takım Çalışması (10 puan)** | Monorepo yapısı, Docker Compose, ayrı DB ve JWT sistemleri, temiz servis sınırları. |
| **Sunum ve İletişim (10 puan)** | Canlı production ortamı, kapsamlı dokümantasyon, Swagger UI, bu demo rehberi. |

---

## Hızlı Test Senaryosu (5 Dakika)

Zamanınız kısıtlıysa şu sırayı izleyin:

1. [https://akilli-markett.vercel.app](https://akilli-markett.vercel.app) → Herhangi bir ürün sayfasını açın → URL'yi kopyalayın
2. [https://zekai-platformm.vercel.app](https://zekai-platformm.vercel.app) → `buyer@zekai.com / Buyer123!` ile giriş
3. URL'yi yapıştır → İhtiyaç yaz → **Analiz Et**
4. SSE stream ile analizi izleyin → Skoru ve kararı görün
5. Çıkış yap → `seller@zekai.com / Seller123!` ile giriş
6. Seller Studio → Demo Store bağla → Simülasyonu çalıştır → Persona kararlarını izle
