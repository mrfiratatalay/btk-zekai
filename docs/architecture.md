# ZekAI — Sistem Mimarisi

## Genel Bakış

ZekAI, iki ayrı platforma sahip AI destekli bir e-ticaret karar sistemidir.

- **Akıllı Market** — Alıcıların alışveriş yaptığı, satıcıların ürün yönettiği e-ticaret platformu
- **ZekAI Platform** — Satıcılar için AI destekli ürün optimizasyonu; alıcılar için pişmanlık riski analizi

Sistem 5 servis, 2 frontend, 2 veritabanından oluşur ve Docker üzerinde çalışır.

---

## Monorepo Yapısı

```
btk-zekai/
├── apps/
│   ├── akilli-market-web/       # E-ticaret frontend  (port 3000)
│   └── zekai-platform-web/      # ZekAI platform      (port 3001)
├── services/
│   ├── commerce-api/            # E-ticaret API        (port 5001)
│   ├── zekai-api/               # ZekAI API            (port 5002)
│   └── ai-service/              # AI Agent servisi     (port 8000) ← henüz devre dışı
├── infra/
│   └── postgres/init.sql        # İki DB'yi oluşturur
├── scripts/
│   ├── start-docker.bat         # Backend Docker ile başlatır
│   └── start-frontends.bat      # Frontend'leri local başlatır
├── docker-compose.yml
└── .env                         # GOOGLE_API_KEY (ai-service için)
```

---

## Servisler ve Portlar

| Servis | Local Port | Teknoloji | Veritabanı |
|--------|-----------|-----------|------------|
| akilli-market-web | 3000 | Next.js 15 | — |
| zekai-platform-web | 3001 | Next.js 15 | — |
| commerce-api | 5001 | ASP.NET Core 10 | akilli_market_db |
| zekai-api | 5002 | ASP.NET Core 10 | zekai_db |
| ai-service | 8000 | Python / FastAPI / Google ADK | — |
| postgres | 5432 | PostgreSQL 16 + pgvector | — |
| redis | 6379 | Redis 7 | — |

---

## İki Ayrı Veritabanı

Tek PostgreSQL instance içinde iki bağımsız database:

```
PostgreSQL (localhost:5432)
├── akilli_market_db   →  commerce-api
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
```

**Store Connect Mekanizması:**
Satıcı ZekAI platformuna kendi Akıllı Market hesabını bağlar.
zekai-api bu hesap bilgileriyle commerce-api'ye login olur, dönen JWT token'ı
`SellerStoreConnection` tablosunda saklar. Sonraki tüm ürün işlemleri bu token ile proxy'lenir.

---

## Docker Kurulumu

### Başlatma
```
scripts\start-docker.bat   → postgres, redis, commerce-api, zekai-api
scripts\start-frontends.bat → akilli-market-web (3000), zekai-platform-web (3001)
```

### Gerekli Ortam Değişkeni
```ini
# .env (kök dizinde)
GOOGLE_API_KEY=your_google_ai_studio_key
```

### Swagger / Dokümantasyon
- http://localhost:5001/swagger  → Commerce API
- http://localhost:5002/swagger  → ZekAI API
- http://localhost:8000/health   → AI Service sağlık kontrolü

---

## JWT Konfigürasyonu

| Servis | Secret | Issuer | Audience | Süre |
|--------|--------|--------|----------|------|
| commerce-api | `commerce-secret-key-minimum-32-characters-long!` | commerce-api | commerce-clients | 24 saat |
| zekai-api | `zekai-secret-key-minimum-32-characters-long-xyz!` | zekai-api | zekai-clients | 24 saat |

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
