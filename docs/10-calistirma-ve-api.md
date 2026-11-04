# Çalıştırma ve API

## Yalnızca arayüzü denemek (backend gerekmez)

Arayüzler `NEXT_PUBLIC_DATA_MODE` tanımlı değilken tarayıcıdaki demo katmanıyla çalışıyor. Node.js 20 ya da
üstü yeterli:

```bash
cd apps/zekai-platform-web
npm install
npm run dev -- --port 3001
```

`http://localhost:3001/login` adresinde canlı demodaki tek tıkla giriş kartları açılıyor.

## Gerçek sistemi çalıştırmak

Gerekenler: Docker, Node.js 20+ ve yapay zekâ özellikleri için bir [Google AI Studio](https://aistudio.google.com)
anahtarı. Anahtar olmadan da sistem açılıyor; yalnızca AI uç noktaları `503` dönüyor.

```bash
git clone https://github.com/mrfiratatalay/btk-zekai.git
cd btk-zekai
cp .env.example .env           # GOOGLE_API_KEY değerini doldur
docker compose up --build      # PostgreSQL, commerce-api, zekai-api, ai-service
```

Arayüzler Docker Compose'un içinde değil; iki ayrı terminalde:

```bash
cd apps/akilli-market-web && cp .env.example .env.local && npm install && npm run dev
cd apps/zekai-platform-web && cp .env.example .env.local && npm install && npm run dev -- --port 3001
```

İki `.env.example` dosyası da `NEXT_PUBLIC_DATA_MODE=api` içeriyor; arayüzler bu yüzden gerçek API'lere
bağlanıyor. Windows'ta aynı işi [`scripts/start-docker.bat`](../scripts/start-docker.bat) ve
[`scripts/start-frontends.bat`](../scripts/start-frontends.bat) yapıyor; ikinci betik `.env.local` dosyalarını da
oluşturuyor ve gerekirse `npm install` çalıştırıyor.

| Adres | Ne var |
|---|---|
| http://localhost:3000 | Akıllı Market |
| http://localhost:3001 | ZekAI |
| http://localhost:5001/swagger | `commerce-api` Swagger |
| http://localhost:5002/swagger | `zekai-api` Swagger |
| http://localhost:8000/health | AI servisinin durumu ve anahtarın tanımlı olup olmadığı |

API'ler açılışta migration'ları uyguluyor ve boş veritabanına örnek veriyi yazıyor.

## Hesaplar

| Ürün | E-posta | Şifre |
|---|---|---|
| Akıllı Market alıcı | `burak@ornekstore.com` | `Buyer123!` |
| Akıllı Market satıcı (Mehmet Elektronik) | `mehmet@ornekstore.com` | `Seller123!` |
| ZekAI alıcı | `buyer@zekai.com` | `Buyer123!` |
| ZekAI satıcı | `seller@zekai.com` | `Seller123!` |

Gerçek sistemde ZekAI satıcısının mağazası ilk açılışta bağlı değil. **Ayarlar** ekranında Akıllı Market'i
seçip Mehmet Elektronik'in API anahtarını gir: `am_live_demo_mehmet_elektronik_2024`. Anahtar, Akıllı Market'in
satıcı panelinde de görünüyor.

## Ortam değişkenleri

| Değişken | Kim okuyor | Varsayılan |
|---|---|---|
| `GOOGLE_API_KEY` | `ai-service` | Yok; tanımlı değilse AI uç noktaları `503` |
| `BUYER_ADVISOR_MODEL`, `KOMBIN_ADVISOR_MODEL`, `COMPARE_MODEL`, `SIMULATION_MODEL`, `GEMINI_CONTENT_MODEL`, `GEMINI_SOCIAL_MODEL`, `GEMINI_BUNDLE_MODEL`, `GEMINI_SEO_MODEL`, `GEMINI_CUSTOMER_VOICE_MODEL` | `ai-service` | `gemini-2.5-flash-lite` |
| `SIMULATION_FALLBACK_MODEL` | `ai-service` | `gemini-2.5-flash` |
| `BUYER_ADVISOR_TIMEOUT_SECONDS`, `BUYER_MARKET_TIMEOUT_SECONDS` | `ai-service` | 45 |
| `KOMBIN_CACHE_TTL_SECONDS`, `SIMULATION_CACHE_TTL_SECONDS`, `SELLER_IMAGE_CACHE_TTL_SECONDS` | `ai-service` | 86400 (24 saat) |
| `ConnectionStrings__Default`, `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpiryMinutes` | iki API | `docker-compose.yml` içinde |
| `CommerceApi__BaseUrl`, `AiService__BaseUrl`, `AkilliMarket__BaseUrl` | `zekai-api` | `docker-compose.yml` içinde |
| `NEXT_PUBLIC_DATA_MODE` | iki arayüz | Tanımsız: tarayıcı içi demo; `api`: gerçek API'ler |
| `NEXT_PUBLIC_COMMERCE_API_URL`, `NEXT_PUBLIC_ZEKAI_API_URL`, `NEXT_PUBLIC_COMMERCE_WEB_URL` | arayüzler | `localhost` adresleri |

## Örnek isteklerle API

**1. Pazar yerine giriş (JWT):**

```bash
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mehmet@ornekstore.com","password":"Seller123!"}'
# {"token":"eyJ...","refreshToken":"...","user":{"id":"...","email":"mehmet@ornekstore.com","fullName":"Mehmet Kaya","role":"Seller"}}
```

**2. Aynı satıcının ürünleri, bu kez API anahtarıyla.** Token'da nokta olmadığı için `commerce-api` bunu JWT
değil API anahtarı olarak doğruluyor:

```bash
curl -s http://localhost:5001/api/seller/products \
  -H "Authorization: Bearer am_live_demo_mehmet_elektronik_2024"
```

**3. ZekAI'a giriş ve mağazayı bağlama:**

```bash
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"seller@zekai.com","password":"Seller123!"}' | jq -r .token)

curl -s -X POST http://localhost:5002/api/seller/connections \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"platform":"akilli-market","apiKey":"am_live_demo_mehmet_elektronik_2024"}'
# {"id":"...","platform":"akilli-market","storeName":"Mehmet Elektronik","status":"Connected","lastSyncAt":null,"productCount":12,"hasApiKey":true}
```

**4. Alıcı analizi, canlı akış olarak.** `-N` tamponlamayı kapatıyor; olaylar geldikçe görünüyor:

```bash
BUYER=$(curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"buyer@zekai.com","password":"Buyer123!"}' | jq -r .token)

curl -N -X POST http://localhost:5002/api/buyer/analyze \
  -H "Authorization: Bearer $BUYER" -H "Content-Type: application/json" \
  -d '{"productId":"bluetooth-kulaklik-pro-x1","buyerNeed":"Müzik ve online toplantı için, bütçem 1.300 TL"}'
# data: {"author":"buyer_advisor","content":{"parts":[{"text":"Urun ve ihtiyac birlikte degerlendiriliyor..."}]}}
# data: {"author":"buyer_advisor","actions":{"state_delta":{"advisor_raporu":{"fit_score":...}}}}
# ...
# data: {"author":"decision","actions":{"state_delta":{"final_rapor":{"verdict":{"level":"consider",...}}}}}
```

Aynı isteği ikinci kez gönderirsen ilk olay `"author":"cache"` olur ve Gemini'ye gidilmez.

**5. Hata biçimi:**

```bash
curl -s -X POST http://localhost:5002/api/buyer/analyze \
  -H "Authorization: Bearer $BUYER" -H "Content-Type: application/json" -d '{"productId":"","buyerNeed":""}'
# HTTP 400
# {"message":"productId ve buyerNeed zorunludur."}
```

Hata gövdeleri tek bir `message` alanından oluşuyor; RFC 9457 Problem Details kullanmıyoruz. Bazı `404`'ler
(ör. olmayan bir ürün) gövdesiz dönüyor. Ayrıntı: [Güvenlik](06-guvenlik.md#hata-sözleşmesi).

## Sık karşılaşılan durumlar

| Durum | Neden ve çözüm |
|---|---|
| AI ekranları "GOOGLE_API_KEY tanımlı değil" diyor | Kök dizindeki `.env` dosyasına anahtarı yaz, `docker compose up -d --force-recreate ai-service` ile servisi yeniden oluştur |
| Ekranlarda sarı "AI kapasitesi geçici olarak doldu" uyarısı | Gemini kotası doldu; gösterilen içerik örnek veridir. Bir süre sonra tekrar dene |
| Arayüz giriş kartlarını gösteriyor ama gerçek veriyi değil | `.env.local` içinde `NEXT_PUBLIC_DATA_MODE=api` yok; demo modunda açılmış |
| Veritabanını sıfırlamak | `docker compose down -v` ve yeniden `docker compose up --build` |
