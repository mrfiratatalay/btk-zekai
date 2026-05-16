# BTK Zekai - AI Commerce Platform

Akilli Market ve Zekai AI Platform tek Docker Compose standardi ile calisir.

## Mimari

```txt
Akilli Market Web              Zekai Platform Web
http://localhost:3000          http://localhost:3001
        |                              |
        v                              v
commerce-api                     zekai-api
http://localhost:5001            http://localhost:5002
        |                              |
        +---------- PostgreSQL --------+
                                       |
                                       v
                                  ai-service
                                  http://ai-service:8000
```

Browser tarafindaki public URL'ler her zaman `localhost` kullanir. Container ici backend-to-backend cagristirma Docker service name kullanir.

## Gereksinimler

- Docker Desktop
- Google AI Studio API key (AI analiz icin)

## Kurulum

Root dizinde `.env.example` dosyasini `.env` olarak kopyala ve `GOOGLE_API_KEY` degerini doldur.

```env
GOOGLE_API_KEY=your_google_ai_studio_key
```

Gercek `.env` dosyasi commitlenmez.

## Calistirma

```bash
docker compose up --build
```

Temiz test icin:

```bash
docker compose down -v
docker compose up --build
```

Not: `down -v` PostgreSQL volume'unu siler; sadece temiz test icin kullan.

## Standart Portlar

| Servis | URL |
| --- | --- |
| Akilli Market Web | http://localhost:3000 |
| Zekai Platform Web | http://localhost:3001 |
| commerce-api Swagger | http://localhost:5001/swagger |
| zekai-api Swagger | http://localhost:5002/swagger |
| ai-service | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Env Standardi

Browser public env:

```env
NEXT_PUBLIC_COMMERCE_API_URL=http://localhost:5001
NEXT_PUBLIC_ZEKAI_API_URL=http://localhost:5002
NEXT_PUBLIC_COMMERCE_WEB_URL=http://localhost:3000
```

Container ici backend env:

```env
CommerceApi__BaseUrl=http://commerce-api:8080
AiService__BaseUrl=http://ai-service:8000
Redis__ConnectionString=redis:6379
```

Frontend dogrudan AI service'e gitmez:

```txt
zekai-platform-web -> zekai-api -> ai-service
```

## Test Hesaplari

Akilli Market:

| Email | Sifre | Rol |
| --- | --- | --- |
| mehmet@ornekstore.com | Seller123! | Satici |
| burak@ornekstore.com | Buyer123! | Alici |
| ali@test.com | Buyer123! | Alici |

Zekai Platform hesaplari ayridir. Zekai Seller Studio'da Demo Store baglantisi icin:

```txt
mehmet@ornekstore.com / Seller123!
```

## Demo Akislari

### Alici Akisi

1. http://localhost:3000 uzerinden Akilli Market'i ac.
2. Bir urun sayfasinin URL'ini kopyala: `http://localhost:3000/product/{id}`.
3. http://localhost:3001 uzerinden Zekai Platform'a gir.
4. Urun linkini yapistir, ihtiyacini yaz ve analizi baslat.

### Satici Akisi

1. http://localhost:3001 uzerinden Zekai Platform'a gir.
2. Seller Studio'da Demo Store'u bagla.
3. Akilli Market seller hesabi ile giris yap.
4. Urunleri cek, AI ile duzenle ve kaydet.
5. Degisiklikleri http://localhost:3000 uzerindeki urun sayfasinda kontrol et.
