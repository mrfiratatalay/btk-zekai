# BTK Zekai — AI Commerce Platform

**Akıllı Market** + **Zekai AI Platform** — İki bağımsız sistem, tek Docker Compose.

---

## Mimari

```
Akıllı Market (e-commerce)          Zekai Platform (AI analiz)
  Next.js :3000                        Next.js :3001
      ↓                                    ↓
  commerce-api :5001               zekai-api :5002
  (.NET 10 + PostgreSQL)           (.NET 10 + PostgreSQL)
  akilli_market_db                 zekai_db
                                       ↓
                                  ai-service :8000
                                  (FastAPI + Gemini ADK)
```

---

## Hızlı Başlangıç

### Gereksinimler
- Docker Desktop
- Google AI Studio API Key (AI analiz için)

### 1. `.env` dosyasını oluştur

```bash
# .env dosyasını düzenle:
GOOGLE_API_KEY=your_google_ai_studio_key
```

### 2. Sistemi başlat

```bash
docker compose up --build
```

### 3. Servislere eriş

| Servis | URL | Açıklama |
|--------|-----|----------|
| Akıllı Market | http://localhost:3000 | Mock e-commerce |
| Zekai Platform | http://localhost:3001 | AI analiz platformu |
| commerce-api Swagger | http://localhost:5001/swagger | Akıllı Market backend |
| zekai-api Swagger | http://localhost:5002/swagger | Zekai backend |
| ai-service | http://localhost:8000 | Gemini ADK servisi |
| PostgreSQL | localhost:5432 | pgvector destekli |
| Redis | localhost:6379 | Cache |

---

## Test Hesapları

### Akıllı Market (http://localhost:3000)

| Email | Şifre | Rol |
|-------|-------|-----|
| mehmet@ornekstore.com | Seller123! | Satıcı |
| burak@ornekstore.com | Buyer123! | Alıcı |
| ali@test.com | Buyer123! | Alıcı |

### Zekai Platform (http://localhost:3001)
Yeni hesap oluşturun. Zekai ve Akıllı Market hesapları birbirinden bağımsızdır.

Seller Studio'da "Demo Store'u Bağla" → `mehmet@ornekstore.com / Seller123!`

---

## Demo Akışları

### Alıcı Akışı
1. `http://localhost:3000` — Akıllı Market'te ürünlere göz at
2. Bir ürün sayfasını aç → URL'yi kopyala (`localhost:3000/product/{id}`)
3. `http://localhost:3001` — Zekai'ye alıcı olarak kayıt ol
4. URL'yi yapıştır → İhtiyacını yaz → Analiz Başlat
5. AI raporu görüntüle

### Satıcı Akışı — Akıllı Market
1. `http://localhost:3000` → Satıcı olarak kayıt ol
2. Header'da **Satıcı Paneli** linkine tıkla
3. Ürün Ekle → Bilgileri doldur → Kaydet
4. Ürün ana sayfada görünür

### Satıcı Akışı — Zekai Seller Studio
1. `http://localhost:3001` → Satıcı olarak Zekai'ye kayıt ol
2. Seller Studio → **Demo Store'u Bağla**
3. `mehmet@ornekstore.com / Seller123!` ile bağlan
4. Ürünler listelenir → **AI ile Düzenle** → Kaydet
5. Değişiklik `http://localhost:3000/product/{id}` sayfasına yansır

---

## Local Development (Docker olmadan)

PostgreSQL port 5432'de çalışmalı.

```bash
# commerce-api (port 5001)
cd services/commerce-api
dotnet run --project src/ZekAI.Api/ZekAI.Api.csproj --urls http://localhost:5001

# zekai-api (port 5002)
cd services/zekai-api
dotnet run --project src/ZekAI.Api/ZekAI.Api.csproj --urls http://localhost:5002

# ai-service (port 8000)
cd services/ai-service
pip install -r requirements.txt
GOOGLE_API_KEY=... uvicorn main:app --port 8000

# Akıllı Market frontend (port 3000)
cd apps/akilli-market-web && npm install && npm run dev

# Zekai Platform frontend (port 3001)
cd apps/zekai-platform-web && npm install && npm run dev -- -p 3001
```

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core 10, Entity Framework Core |
| AI | Google Gemini 2.5 Flash, Google ADK |
| Veritabanı | PostgreSQL 16 + pgvector |
| Cache | Redis 7 |
| Kapsayıcı | Docker Compose v2 |
