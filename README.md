# ZekAI — AI Destekli E-Ticaret Karar Platformu

> **HackAthon'26** | BTK Akademi × Google × Girişimcilik Vakfı  
> Tema: E-Ticaret Odaklı Yapay Zeka Uygulaması  
> Temel AI: Google Gemini 2.5 Flash + Google ADK

---

## 🚀 Canlı Demo

| Platform | URL | Açıklama |
|----------|-----|----------|
| **Akıllı Market** | [akilli-markett.vercel.app](https://akilli-markett.vercel.app) | Alıcı e-ticaret platformu |
| **ZekAI Platform** | [zekai-platformm.vercel.app](https://zekai-platformm.vercel.app) | AI karar & satıcı optimizasyon platformu |
| Commerce API Swagger | [zekai-commerce-api.onrender.com/swagger](https://zekai-commerce-api.onrender.com/swagger) | REST API dokümantasyonu |
| ZekAI API Swagger | [zekai-api.onrender.com/swagger](https://zekai-api.onrender.com/swagger) | ZekAI API dokümantasyonu |
| AI Service Health | [zekai-ai-service.onrender.com/health](https://zekai-ai-service.onrender.com/health) | Gemini servis sağlık kontrolü |

### Demo Hesapları

**Akıllı Market (Satıcı):**
| Alan | Değer |
|------|-------|
| E-posta | `mehmet@ornekstore.com` |
| Şifre | `Seller123!` |

**Akıllı Market (Alıcı):**
| Alan | Değer |
|------|-------|
| E-posta | `burak@ornekstore.com` |
| Şifre | `Buyer123!` |

**ZekAI Platform (Satıcı):**
| Alan | Değer |
|------|-------|
| E-posta | `seller@zekai.com` |
| Şifre | `Seller123!` |

**ZekAI Platform (Alıcı):**
| Alan | Değer |
|------|-------|
| E-posta | `buyer@zekai.com` |
| Şifre | `Buyer123!` |

---

## Proje Nedir?

ZekAI, Türk e-ticaret ekosisteminin iki tarafına birden değer katan yapay zeka platformudur.

**Satıcılar için:** Ürün listelemelerini, sosyal medya içeriklerini ve fiyatlandırma stratejilerini Gemini ile optimize ederler. Müşterilerinin satın alma kararını nasıl vereceğini simüle ederler. Tek tıkla profesyonel ürün görseli ve SEO metni üretirler.

**Alıcılar için:** Bir ürün linkini yapıştırıp kendi ihtiyaçlarını yazarlar. ZekAI o ürünün gerçekten onlara uygun olup olmadığını, fiyatının piyasaya göre adil olup olmadığını ve iade riskini analiz eder. Birden fazla ürünü karşılaştırır; birden fazla ürün almayı düşünüyorlarsa bunların birlikte ne kadar mantıklı olduğunu hesaplar.

---

## Mimari Özet

```
┌─────────────────────────────────────────────────────────────────┐
│                        KULLANICI KATMANI                        │
│                                                                 │
│   Akıllı Market Web              ZekAI Platform Web            │
│   (Next.js 15 / Vercel)          (Next.js 15 / Vercel)         │
│   akilli-markett.vercel.app      zekai-platformm.vercel.app    │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────┐        ┌─────────────────────────────────┐
│    Commerce API      │        │          ZekAI API              │
│  (ASP.NET Core 10)   │◄───────│      (ASP.NET Core 10)          │
│  Render / Frankfurt  │        │      Render / Frankfurt         │
└──────────────┬───────┘        └──────────────┬──────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────┐        ┌─────────────────────────────────┐
│   akilli_market_db   │        │   AI Service (Python/FastAPI)   │
│   (PostgreSQL 18)    │        │   Google ADK + Gemini 2.5 Flash │
│   Render             │        │   Render / Frankfurt            │
└──────────────────────┘        └──────────────┬──────────────────┘
                                               │
                                               ▼
                                ┌─────────────────────────────────┐
                                │      Google Gemini API          │
                                │   2.5 Flash Lite (varsayılan)   │
                                │   2.5 Flash (fallback/search)   │
                                │   Gemini Image (görsel üretimi) │
                                └─────────────────────────────────┘
```

---

## Teknoloji Yığını

### Frontend
| Teknoloji | Kullanım |
|-----------|----------|
| Next.js 15 | Her iki web uygulaması |
| TypeScript | Tip güvenliği |
| Tailwind CSS | Stillendirme |
| shadcn/ui | UI bileşen kütüphanesi |
| Server-Sent Events (SSE) | AI akış yanıtları |

### Backend
| Teknoloji | Kullanım |
|-----------|----------|
| ASP.NET Core 10 (C#) | Commerce API & ZekAI API |
| Clean Architecture | Domain / Application / Infrastructure katmanları |
| Entity Framework Core | ORM |
| JWT Authentication | Bağımsız auth sistemleri |
| PostgreSQL 18 | Ana veritabanı |

### AI Katmanı
| Teknoloji | Kullanım |
|-----------|----------|
| Python 3.12 + FastAPI | AI servis çerçevesi |
| Google Gemini 2.5 Flash Lite | Tüm AI çıktıları (maliyet-optimize) |
| Google Gemini 2.5 Flash | Fallback & Google Search Grounding |
| Gemini Image (`gemini-3.1-flash-image-preview`) | Ürün görseli üretimi |
| Google ADK (Agent Development Kit) | Çok-ajan alıcı analiz mimarisi |
| Pydantic v2 | Structured output şema doğrulaması |
| Server-Sent Events | Gerçek zamanlı AI akışı |

### Altyapı
| Teknoloji | Kullanım |
|-----------|----------|
| Docker + Docker Compose | Yerel geliştirme ortamı |
| Vercel | Frontend deployment |
| Render | Backend + AI servis deployment |
| Render PostgreSQL | Üretim veritabanı (Frankfurt) |

---

## Satıcı Akışı — ZekAI Seller Studio

Satıcı, ZekAI platformuna Akıllı Market hesabını bağladıktan sonra **Seller Studio**'ya erişir. Tüm AI özellikleri doğrudan ürün sayfaları üzerinde çalışır ve değişiklikler Akıllı Market'e anında yansır.

### 1. AI İçerik Üretici
Satıcı mevcut ürün bilgilerini (başlık, kategori, fiyat, açıklama) girer. Gemini Vision, ürün görselini de analiz ederek renk, malzeme ve form bilgilerini açıklamaya entegre eder. Müşteri simülasyonu sonuçları varsa Gemini bu itirazları birebir karşılayan içerik üretir.

**Çıktı:** SEO uyumlu başlık, kısa açıklama, 3 paragraflık ürün açıklaması, 5 özellik maddesi.

### 2. Müşteri Simülasyonu
Beş farklı Türk alıcı profili (bütçe odaklı, kalite arayan, yorum okuyan, hızlı karar veren, tasarım odaklı) ürün sayfasını inceler ve satın alma / vazgeçme / kararsız kararı verir. Akış, SSE ile gerçek zamanlı animasyonlu olarak izlenir.

**Çıktı:** Her persona için karar, gerekçe, baktığı alan ve satıcıya öneri. Hepsinin genel özeti.

### 3. Sosyal Medya İçerik Üretici
Satıcı ton (profesyonel / samimi / mizahi), amaç (satış / güven / tanıtım) ve platformları seçer. Gemini her platform için platforma özel içerik üretir.

**Çıktı:**
- **Instagram:** Caption (300–420 karakter), 5–8 hashtag, CTA, overlay text
- **TikTok/Reels:** Hook cümlesi, 3 sahne senaryosu, caption, hashtag
- **X (Twitter):** 220 karakter post, 1–3 hashtag, CTA

### 4. AI Ürün Görseli Üretici
Gemini Image modeli üç farklı çekim türünde ürün görseli üretir.

**Çekim türleri:**
- **Stüdyo:** Beyaz arka plan, profesyonel ışık, pazaryeri kalitesi
- **Kutu Açma (Unboxing):** Tüm aksesuarlarıyla flat lay düzeni
- **Yaşam Tarzı (Lifestyle):** Gerçek kullanım ortamında doğal çekim

Aynı ürün + stil için 24 saat cache — tekrarlı isteklerde Gemini'ye gidilmez.

### 5. Bundle (Paket) Önerisi
Ana ürünle birlikte satın alınması mantıklı tamamlayıcı ürünleri Gemini puanlar ve paket kampanya metni üretir.

**Çıktı:** Semantik uyum skoru, "neden birlikte?" gerekçesi, kampanya başlığı, sepet metni, CTA butonu, önerilen indirim oranı.

### 6. SEO Optimizasyonu
Gemini ürün için Türk e-ticaret arama davranışına uygun SEO çıktısı üretir.

**Çıktı:** Odak anahtar kelime, 5–8 ikincil kelime, SEO başlığı (50–65 karakter), meta açıklama (140–160 karakter), URL slug önerisi, 4–6 somut iyileştirme önerisi.

### 7. Müşteri Sesi Analizi
Satıcının ürün yorumlarını Gemini analiz eder.

**Çıktı:** Her yorum için cevap gerekip gerekmediği kararı + profesyonel cevap taslağı, 3–5 SSS soru-cevap önerisi (hangi yorumlardan çıktığı bilgisiyle birlikte).

---

## Alıcı Akışı — ZekAI Buyer Assistant

Alıcı ZekAI platformuna girer, bir ürün linkini yapıştırır ve kendi ihtiyacını serbest metin olarak yazar. Sistem SSE akışı ile analizi adım adım ekrana getirir.

### 1. Ürün Analizi (Ana Özellik)
**Çok-ajan SSE akışı:**

```
Alıcı İhtiyaç Analizi Ajanı  →  Ürün Gerçeklik Ajanı  ──┐
                                  Yorum Madenciliği Ajanı  ├→ Risk Sentez → Doğrulama
                                  Fiyat Piyasa Ajanı    ──┘
                                  İade Riski Ajanı      ──┘
```

Gemini, kullanıcının gerçekten piyasa fiyatı karşılaştırmasına ihtiyacı olduğuna karar verirse Google Search Grounding devreye girer ve gerçek zamanlı Türkiye piyasası verileriyle fiyat analizi yapar.

**Çıktı:**
- **Uyum Skoru (0–100):** Bu ürün alıcının ihtiyacına ne kadar uyuyor?
- **Güven Skoru (0–100):** Ürün sayfası ve yorumlar ne kadar güvenilir?
- **Fiyat Adalet Skoru (0–100):** Fiyat piyasaya göre makul mü?
- **İade Riski (%):** Bu ürünü iade etme ihtimali ne?
- **Karar:** Al / Düşün / Alma
- **Güçlü sinyaller & uyarılar** (kanıt düzeyiyle birlikte)
- **Piyasa alternatifleri** (Search Grounding etkinse)

### 2. Kombin Analizi
Birden fazla ürün sepete eklendiğinde kullanıcı bir amaç ve bütçe girer. Gemini bu ürünlerin birlikte ne kadar mantıklı olduğunu değerlendirir.

**Çıktı:** Genel skor, ihtiyaç uyumu, parça uyumu, bütçe dengesi, risk skoru, satın alma sırası önerisi, eksik parça uyarısı.

### 3. Ürün Karşılaştırma
Analiz ettiği 2–3 ürünü belirli bir ihtiyaca göre karşılaştırır.

**Çıktı:** Kazanan ürün, her ürün için tek cümlelik gerekçe, göreli uygunluk (en iyi / kabul edilebilir / önerilmez).

---

## Monorepo Yapısı

```
btk-zekai/
├── apps/
│   ├── akilli-market-web/       # Alıcı e-ticaret frontend  (Next.js 15)
│   └── zekai-platform-web/      # ZekAI platform frontend   (Next.js 15)
├── services/
│   ├── commerce-api/            # E-ticaret REST API        (ASP.NET Core 10)
│   │   └── src/
│   │       ├── ZekAI.Api/       # Controller'lar & middleware
│   │       ├── ZekAI.Application/  # CQRS handlers & servisler
│   │       ├── ZekAI.Domain/    # Entity'ler & domain kuralları
│   │       └── ZekAI.Infrastructure/ # DB & dış servis bağlantıları
│   ├── zekai-api/               # ZekAI REST API            (ASP.NET Core 10)
│   └── ai-service/              # AI agent servisi          (Python/FastAPI)
│       ├── seller/              # 7 Seller AI endpoint
│       ├── buyer/               # 3 Buyer AI endpoint
│       └── buyer_agent/         # Google ADK çok-ajan tanımları
├── infra/
│   └── postgres/init.sql        # İki DB'yi başlatan SQL
├── scripts/
│   ├── start-docker.bat         # Backend'i Docker ile başlatır
│   └── start-frontends.bat      # Frontend'leri yerel başlatır
├── docs/                        # Detaylı teknik belgeler
└── docker-compose.yml           # Tüm servisler tek dosyada
```

---

## Google ADK Çok-Ajan Mimarisi

Alıcı analizi Google Agent Development Kit (ADK) üzerine kurulu SequentialAgent + ParallelAgent mimarisiyle çalışır:

```python
root_agent = SequentialAgent(sub_agents=[
    need_understanding_agent,   # Alıcı ihtiyacını yapılandırır
    ParallelAgent(sub_agents=[  # 4 ajan aynı anda çalışır
        product_reality_agent,  # Ürün açıklaması gerçeklik tespiti
        review_mining_agent,    # Yorum madenciliği & duygu analizi
        price_market_agent,     # Fiyat & sahte indirim analizi
        return_risk_agent,      # İade riski hesabı
    ]),
    risk_synthesis_agent,       # Tüm bulguları sentezler
    verification_agent,         # Kanıtsız iddiaları temizler
])
```

**Maliyet Optimizasyonu:** Satıcı AI endpointleri tek Gemini çağrısı + structured output kullanır. Alıcı analizinde Google Search Grounding yalnızca advisor "piyasa verisi gerekli" dediğinde devreye girer. Simülasyon ve kombin analizinde 24 saatlik in-memory cache çalışır.

---

## Üretim Ortamı

### Frontend — Vercel
Her iki Next.js uygulaması Vercel'de çalışır. GitHub push ile otomatik deploy.

### Backend — Render (Frankfurt)
Commerce API, ZekAI API ve AI Service Render'da Docker container olarak çalışır. Aynı PostgreSQL instance'ını paylaşırlar (iki ayrı veritabanı: `akilli_market_db` ve `zekai_db`).

### Servisler Arası Güvenlik
- Frontend hiçbir zaman AI service'e doğrudan gitmez; her şey zekai-api üzerinden proxy'lenir.
- İki servisin JWT token'ları tamamen bağımsızdır.
- Satıcının Akıllı Market bağlantısı zekai-api'deki `SellerStoreConnection` tablosunda JWT token olarak saklanır.

---

## Yerel Kurulum

### Gereksinimler
- Docker Desktop
- Google AI Studio API key ([aistudio.google.com](https://aistudio.google.com))

### Başlatma

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd btk-zekai

# 2. .env dosyasını oluştur
cp .env.example .env
# .env dosyasını aç ve GOOGLE_API_KEY değerini doldur

# 3. Tüm servisleri başlat
docker compose up --build
```

### Portlar

| Servis | URL |
|--------|-----|
| Akıllı Market | http://localhost:3000 |
| ZekAI Platform | http://localhost:3001 |
| Commerce API Swagger | http://localhost:5001/swagger |
| ZekAI API Swagger | http://localhost:5002/swagger |
| AI Service | http://localhost:8000 |

---

## Detaylı Belgeler

| Belge | İçerik |
|-------|--------|
| [docs/architecture.md](docs/architecture.md) | Sistem mimarisi, servisler, veri akışı |
| [docs/ai-agents.md](docs/ai-agents.md) | Gemini ajan yapısı, ADK mimarisi |
| [docs/seller-features.md](docs/seller-features.md) | Tüm Seller Studio özellikleri |
| [docs/buyer-features.md](docs/buyer-features.md) | Tüm Buyer Assistant özellikleri |
| [docs/demo-guide.md](docs/demo-guide.md) | Adım adım demo rehberi |
