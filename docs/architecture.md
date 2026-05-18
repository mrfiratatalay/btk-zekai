# ZekAI — Sistem Mimarisi

## Genel Bakış

ZekAI, iki ayrı platforma sahip AI destekli bir e-ticaret karar sistemidir.

- **Akıllı Market** — Alıcıların alışveriş yaptığı, satıcıların ürün yönettiği e-ticaret platformu
- **ZekAI Platform** — Satıcılar için AI destekli ürün optimizasyonu; alıcılar için pişmanlık riski analizi

Sistem 5 servis, 2 frontend, 2 veritabanından oluşur.

---

## Monorepo Yapısı

```
btk-zekai/
├── apps/
│   ├── akilli-market-web/       # E-ticaret frontend  (local: 3000)
│   └── zekai-platform-web/      # ZekAI platform      (local: 3001)
├── services/
│   ├── commerce-api/            # E-ticaret API        (local: 5001)
│   ├── zekai-api/               # ZekAI API            (local: 5002)
│   └── ai-service/              # AI Agent servisi     (local: 8000)
├── docs/                        # Proje dokümantasyonu
├── infra/
│   └── postgres/init.sql        # İki DB'yi oluşturur
├── scripts/
│   ├── start-docker.bat         # Backend Docker ile başlatır
│   └── start-frontends.bat      # Frontend'leri local başlatır
└── docker-compose.yml
```

---

## Servisler ve Portlar

| Servis | Local Port | Production URL | Teknoloji | Veritabanı |
|--------|-----------|----------------|-----------|------------|
| akilli-market-web | 3000 | akilli-markett.vercel.app | Next.js 15 | — |
| zekai-platform-web | 3001 | zekai-platformm.vercel.app | Next.js 15 | — |
| commerce-api | 5001 | zekai-commerce-api.onrender.com | ASP.NET Core 10 | akilli_market_db |
| zekai-api | 5002 | zekai-api.onrender.com | ASP.NET Core 10 | zekai_db |
| ai-service | 8000 | zekai-ai-service.onrender.com | Python / FastAPI / Google Gemini | — |
| postgres | 5432 | Render PostgreSQL | PostgreSQL 18 | — |

> **Not:** Redis docker-compose'da tanımlı ancak aktif olarak kullanılmıyor. Production'da Render'a deploy edilmedi.

---

## İki Ayrı Veritabanı

### Local
```
PostgreSQL (localhost:5432)
├── akilli_market_db   →  commerce-api
└── zekai_db           →  zekai-api
```

### Production (Render PostgreSQL — zekai-postgres)
```
PostgreSQL (dpg-d856nmbeo5us73enod90-a.frankfurt-postgres.render.com:5432)
├── akilli_market_db   →  zekai-commerce-api
└── zekai_db           →  zekai-api
```

Aralarında doğrudan bağlantı yoktur. zekai-api, Akıllı Market verilerine HTTP proxy üzerinden erişir.

---

## Servisler Arası İletişim

```
akilli-market-web ──── commerce-api ──── akilli_market_db
       (3000)              (5001)

zekai-platform-web ─── zekai-api ─┬─── zekai_db
       (3001)            (5002)   ├─── commerce-api  (HTTP proxy)
                                  └─── ai-service    (SSE stream)

zekai-api ─────────── ai-service ──── Google Gemini API
                         (8000)           (gemini-2.5-flash)
```

**Store Connect Mekanizması:**
Satıcı ZekAI platformuna kendi Akıllı Market hesabını bağlar.
zekai-api bu hesap bilgileriyle commerce-api'ye login olur, dönen JWT token'ı
`SellerStoreConnection` tablosunda saklar. Sonraki tüm ürün işlemleri bu token ile proxy'lenir.

---

## AI Service — Buyer Analiz Akışı

Alıcı ürün linki yapıştırıp "Analiz Et" dediğinde:

```
zekai-platform-web
  → POST zekai-api /api/buyer/analyze
    → POST ai-service /buyer/analyze
      → Agent 1: Need Parser       (Gemini 2.5 Flash — seri)
      → Agent 2: Price Tracker     (Gemini + Google Search Grounding — paralel)
      → Agent 3: Review Miner      (Gemini 2.5 Flash — paralel)
      → Agent 4: Visual Analyzer   (Gemini Vision — paralel)
      → Agent 5: Synthesizer       (Gemini 2.5 Flash — seri)
      → SSE stream → zekai-api → zekai-platform-web
```

**Mock Modu:** Gemini API rate limit (429) veya key hatası durumunda
ai-service hazır mock verilerle SSE stream üretir.
Frontend, `mock_notice` event'ini alınca mock mode banner'ı gösterir.

---

## Docker Kurulumu (Local)

### Başlatma
```
scripts\start-docker.bat   → postgres, redis, commerce-api, zekai-api
scripts\start-frontends.bat → akilli-market-web (3000), zekai-platform-web (3001)
```

ai-service local'de Docker olmadan da çalıştırılabilir:
```bash
cd services/ai-service
pip install -r requirements.txt
GOOGLE_API_KEY=xxx uvicorn main:app --port 8000
```

### Gerekli Ortam Değişkeni (local)
```ini
# .env (kök dizinde — Docker ai-service için)
GOOGLE_API_KEY=your_google_ai_studio_key
```

### Swagger / Dokümantasyon
- http://localhost:5001/swagger  → Commerce API
- http://localhost:5002/swagger  → ZekAI API
- http://localhost:8000/health   → AI Service sağlık kontrolü

---

## JWT Konfigürasyonu

| Servis | Issuer | Audience | Süre |
|--------|--------|----------|------|
| commerce-api | commerce-api | commerce-clients | 24 saat |
| zekai-api | zekai-api | zekai-clients | 24 saat |

İki servisin JWT'leri birbirinden tamamen bağımsızdır.

---

## Demo Hesaplar

### Akıllı Market (commerce-api)
| Rol | Email | Şifre |
|-----|-------|-------|
| Satıcı | mehmet@ornekstore.com | Seller123! |
| Alıcı | burak@ornekstore.com | Buyer123! |

### ZekAI Platform (zekai-api)
| Rol | Email | Şifre |
|-----|-------|-------|
| Satıcı | seller@zekai.com | Seller123! |
| Alıcı | buyer@zekai.com | Buyer123! |

> ZekAI Platform ve Akıllı Market **ayrı kullanıcı sistemleridir**.
> ZekAI satıcısı, Seller Studio'yu aktifleştirmek için Akıllı Market satıcı hesabını ayrıca bağlamalıdır.
