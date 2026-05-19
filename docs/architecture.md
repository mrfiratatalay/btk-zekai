# ZekAI — Sistem Mimarisi

## Genel Bakış

ZekAI, iki ayrı platforma ve üç backend servisine sahip AI destekli bir e-ticaret karar sistemidir.

- **Akıllı Market** — Alıcıların alışveriş yaptığı, satıcıların ürün yönettiği e-ticaret platformu
- **ZekAI Platform** — Satıcılar için AI destekli ürün optimizasyonu; alıcılar için pişmanlık riski analizi

Sistem 5 servis, 2 frontend, 2 veritabanından oluşur.

---

## Monorepo Yapısı

```
btk-zekai/
├── apps/
│   ├── akilli-market-web/           # E-ticaret frontend       (Next.js 15 / Port 3000)
│   └── zekai-platform-web/          # ZekAI platform frontend  (Next.js 15 / Port 3001)
├── services/
│   ├── commerce-api/                # E-ticaret REST API        (ASP.NET Core 10 / Port 5001)
│   │   └── src/
│   │       ├── ZekAI.Api/           # Controller'lar, middleware, Swagger
│   │       ├── ZekAI.Application/   # CQRS handlers, servis arayüzleri
│   │       ├── ZekAI.Domain/        # Entity'ler, domain event'leri, kurallar
│   │       └── ZekAI.Infrastructure/# EF Core DbContext, dış servis implementasyonları
│   ├── zekai-api/                   # ZekAI REST API            (ASP.NET Core 10 / Port 5002)
│   │   └── src/
│   │       ├── ZekAI.Api/           # Controller'lar, proxy middleware
│   │       ├── ZekAI.Application/   # Buyer/Seller iş mantığı
│   │       ├── ZekAI.Domain/        # ZekAI domain entity'leri
│   │       └── ZekAI.Infrastructure/# AI service client, commerce-api proxy
│   └── ai-service/                  # AI Agent servisi          (Python/FastAPI / Port 8000)
│       ├── seller/                  # 7 Seller AI endpoint
│       │   ├── content_router.py    # AI içerik üretici
│       │   ├── simulation_router.py # Müşteri simülasyonu (SSE)
│       │   ├── social_router.py     # Sosyal medya içerik üretici
│       │   ├── image_router.py      # AI görsel üretici (Gemini Image)
│       │   ├── bundle_router.py     # Bundle önerisi
│       │   ├── seo_router.py        # SEO optimizasyonu
│       │   └── customer_voice_router.py  # Yorum analizi & cevap
│       ├── buyer/                   # 3 Buyer AI endpoint
│       │   ├── buyer_router.py      # Tekil ürün analizi (SSE)
│       │   ├── kombin_router.py     # Çoklu ürün kombin analizi (SSE)
│       │   └── compare_router.py   # Ürün karşılaştırma (SSE)
│       ├── buyer_agent/             # Google ADK çok-ajan tanımları
│       │   └── agent.py             # SequentialAgent + ParallelAgent mimarisi
│       ├── mock/                    # Demo/fallback mock verileri
│       └── main.py                  # FastAPI uygulama başlangıcı
├── infra/
│   └── postgres/init.sql            # İki DB'yi başlatan SQL
├── scripts/
│   ├── start-docker.bat             # Backend Docker ile başlatır
│   └── start-frontends.bat          # Frontend'leri yerel başlatır
├── docs/                            # Proje dokümantasyonu
└── docker-compose.yml               # Tüm servisler
```

---

## Servisler ve Portlar

| Servis | Yerel Port | Production URL | Teknoloji | Veritabanı |
|--------|-----------|----------------|-----------|------------|
| akilli-market-web | 3000 | [akilli-markett.vercel.app](https://akilli-markett.vercel.app) | Next.js 15 | — |
| zekai-platform-web | 3001 | [zekai-platformm.vercel.app](https://zekai-platformm.vercel.app) | Next.js 15 | — |
| commerce-api | 5001 | [zekai-commerce-api.onrender.com](https://zekai-commerce-api.onrender.com) | ASP.NET Core 10 | akilli_market_db |
| zekai-api | 5002 | [zekai-api.onrender.com](https://zekai-api.onrender.com) | ASP.NET Core 10 | zekai_db |
| ai-service | 8000 | [zekai-ai-service.onrender.com](https://zekai-ai-service.onrender.com) | Python / FastAPI / Gemini | — |
| postgres | 5432 | Render PostgreSQL (Frankfurt) | PostgreSQL 18 | — |

---

## İki Ayrı Veritabanı

### Yerel Geliştirme
```
PostgreSQL (localhost:5432)
├── akilli_market_db   →  commerce-api    (ürünler, siparişler, kullanıcılar)
└── zekai_db           →  zekai-api       (ZekAI kullanıcıları, analizler, bağlantılar)
```

### Production (Render PostgreSQL — Frankfurt)
```
PostgreSQL (dpg-d856nmbeo5us73enod90-a.frankfurt-postgres.render.com:5432)
├── akilli_market_db   →  zekai-commerce-api
└── zekai_db           →  zekai-api
```

İki veritabanı arasında doğrudan bağlantı yoktur. `zekai-api`, Akıllı Market verilerine HTTP proxy üzerinden erişir.

---

## Servisler Arası İletişim

```
┌──────────────────────┐         ┌──────────────────────────┐
│  akilli-market-web   │─────────►    commerce-api          │
│   (Next.js / 3000)   │         │  (ASP.NET Core / 5001)   │
└──────────────────────┘         └──────────┬───────────────┘
                                            │
                                   akilli_market_db

┌──────────────────────┐         ┌──────────────────────────┐
│  zekai-platform-web  │─────────►      zekai-api           │
│   (Next.js / 3001)   │         │  (ASP.NET Core / 5002)   │
└──────────────────────┘         └──────┬─────────┬─────────┘
                                        │         │
                                   zekai_db   commerce-api
                                              (HTTP proxy)
                                                  │
                                        ┌─────────▼─────────┐
                                        │    ai-service      │
                                        │ (FastAPI / 8000)   │
                                        └─────────┬─────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │  Google Gemini API │
                                        │  2.5 Flash Lite    │
                                        │  2.5 Flash + Search│
                                        │  Gemini Image      │
                                        └───────────────────┘
```

### Güvenlik Kuralları
- `zekai-platform-web` hiçbir zaman `ai-service`'e doğrudan gitmez; her şey `zekai-api` üzerinden proxy'lenir.
- İki servisin JWT token'ları tamamen bağımsızdır (farklı secret, issuer, audience).
- Frontend ortam değişkenleri yalnızca ilgili API URL'lerini içerir; AI key hiçbir zaman frontend'e geçmez.

---

## Store Connect Mekanizması

Satıcı ZekAI platformuna Akıllı Market hesabını bağlar:

```
1. Satıcı ZekAI'a Akıllı Market e-posta + şifre girer
2. zekai-api → POST commerce-api /auth/login
3. Dönen JWT → SellerStoreConnection tablosuna şifreli kaydedilir
4. Tüm ürün okuma/yazma işlemleri bu token ile commerce-api'ye proxy'lenir
5. Satıcı ZekAI'dan değişiklik yaptığında → commerce-api güncellenir → Akıllı Market'e yansır
```

---

## AI Service — Seller Akışı

```
zekai-platform-web
  └─► POST zekai-api /api/seller/{feature}
        └─► POST ai-service /seller/{endpoint}
              └─► Gemini 2.5 Flash Lite (structured output)
                    └─► Pydantic şema doğrulaması
                          └─► JSON yanıt → zekai-api → zekai-platform-web
```

**Mock Fallback:** API key yoksa veya Gemini 429/503 dönerse `mock/responses.py`'den demo veri döner.

---

## AI Service — Buyer Analiz Akışı

```
zekai-platform-web
  └─► POST zekai-api /api/buyer/analyze
        └─► POST ai-service /buyer/analyze (SSE)
              │
              ├─► Buyer Advisor Agent (Gemini 2.5 Flash Lite)
              │     → fit_score, trust_score, price_score, warnings, strengths
              │     → needs_market_check: bool
              │
              └─► Market Check Agent (Gemini + Google Search Grounding) [koşullu]
                    → piyasa fiyatları, alternatifler
              │
              └─► Deterministik Karar Motoru
                    → decide(fit, trust, price, risk, warnings, alternatives)
                    → verdict: "al" / "dusun" / "alma"
              │
              └─► SSE olaylar → zekai-api → zekai-platform-web
```

---

## Google ADK Çok-Ajan Mimarisi

`buyer_agent/agent.py`'de tanımlı tam çok-ajan pipeline:

```
SequentialAgent: buyer_analysis_root
│
├─► need_understanding_agent       (Gemini — alıcı ihtiyacını yapılandırır)
│     output_key: "ihtiyac_profili"
│
├─► ParallelAgent: parallel_forensics  (4 ajan eş zamanlı)
│     ├─► product_reality_agent    (ürün açıklaması gerçeklik tespiti)
│     │     output_key: "urun_gerceklik_analizi"
│     ├─► review_mining_agent      (yorum madenciliği & bot tespiti)
│     │     output_key: "yorum_analizi"
│     ├─► price_market_agent       (fiyat & sahte indirim analizi)
│     │     output_key: "fiyat_analizi"
│     └─► return_risk_agent        (kategori bazlı iade riski)
│           output_key: "iade_riski_analizi"
│
├─► risk_synthesis_agent           (4 analizi birleştirir)
│     output_key: "risk_raporu"
│
└─► verification_agent             (kanıtsız iddiaları temizler)
      output_key: "final_rapor"
```

---

## SSE (Server-Sent Events) Akış Protokolü

AI analizlerin tümü SSE ile gerçek zamanlı akış sağlar. Frontend, HTTP bağlantısını açık tutar ve her event geldiğinde UI'ı günceller:

```
Content-Type: text/event-stream
Cache-Control: no-cache
X-Accel-Buffering: no

data: {"author": "buyer_advisor", "content": {"parts": [{"text": "..."}]}}
data: {"author": "buyer_advisor", "actions": {"state_delta": {"advisor_raporu": {...}}}}
data: {"author": "market_check", ...}
data: {"author": "decision", "actions": {"state_delta": {"final_rapor": {...}}}}
```

---

## JWT Konfigürasyonu

| Servis | Issuer | Audience | Süre |
|--------|--------|----------|------|
| commerce-api | `commerce-api` | `commerce-clients` | 24 saat |
| zekai-api | `zekai-api` | `zekai-clients` | 24 saat |

İki servisin JWT'leri birbirinden tamamen bağımsızdır.

---

## Docker Compose Yapısı

```yaml
services:
  postgres:      # pgvector/pgvector:pg16 — iki DB'yi init.sql ile oluşturur
  commerce-api:  # ASP.NET Core 10 — port 5001
  zekai-api:     # ASP.NET Core 10 — port 5002
  ai-service:    # Python FastAPI — port 8000, .env'den GOOGLE_API_KEY okur
```

Tüm servisler `zekai-network` bridge ağında çalışır. `ai-service` ve `commerce-api` başlamadan `zekai-api` başlamaz.

---

## Production Deployment

### Frontend — Vercel
- Her branch push'ta otomatik preview deploy.
- Production domain: Vercel custom domain.
- Ortam değişkenleri Vercel dashboard'dan yönetilir.

### Backend — Render (Frankfurt bölgesi)
- Her servis ayrı bir Render Web Service olarak çalışır.
- Docker image'ları Render tarafından build edilir.
- Render PostgreSQL managed instance, her iki API ile aynı bölgededir (Frankfurt).
- `GOOGLE_API_KEY` Render environment variables'dan AI service'e geçirilir.

### Sıcak Başlatma (Cold Start)
Render'ın ücretsiz tier'ında servisler hareketsizlik sonrası uyku moduna girer. İlk istek ~30–60 saniye sürebilir. Demo için önceden health check endpoint'lerini çağırarak servisleri uyandırmak önerilir:

```
GET https://zekai-ai-service.onrender.com/health
GET https://zekai-commerce-api.onrender.com/swagger
GET https://zekai-api.onrender.com/swagger
```

---

## Altyapı Diyagramı (Production)

```
Vercel Edge Network (Global CDN)
├── akilli-markett.vercel.app     (Next.js SSR + ISR)
└── zekai-platformm.vercel.app    (Next.js SSR)
         │                │
         ▼                ▼
Render Frankfurt Region
├── zekai-commerce-api (Docker / ASP.NET Core 10)
├── zekai-api          (Docker / ASP.NET Core 10)
├── zekai-ai-service   (Docker / Python FastAPI)
└── zekai-postgres     (Managed PostgreSQL 18)
         │
         ▼
Google AI Platform (Global)
├── Gemini 2.5 Flash Lite
├── Gemini 2.5 Flash + Google Search Grounding
└── Gemini Image (gemini-3.1-flash-image-preview)
```
