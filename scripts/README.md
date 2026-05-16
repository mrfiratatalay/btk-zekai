# Scripts

Windows lokal gelistirme icin yardimci bat dosyalari.

## Hizli Baslangic (Tum Servisler)

```bat
scripts\start-all.bat
```

Bu komut **uc ayri terminal** acar:

| Servis           | Adres                        |
|------------------|------------------------------|
| .NET Backend     | `http://localhost:5224`       |
| Swagger          | `http://localhost:5224/swagger` |
| ZekAI Platform   | `http://localhost:3000`       |
| ZekAI Market     | `http://localhost:3002`       |

## Ilk Kurulum

Backend bagimliliklarini hazirlamak icin:

```bat
scripts\setup-backend.bat
```

Frontend'ler icin ayri kurulum scripti yok; ilk calismada `node_modules` yoksa
otomatik olarak `npm ci` veya `npm install` calistirilir.

## Tek Tek Calistirma

```bat
scripts\start-backend.bat     REM .NET API  (port 5224)
scripts\start-frontend.bat    REM ZekAI Platform  (port 3000)
scripts\start-market.bat      REM ZekAI Market  (port 3002)
```

## Loglama

Tum script'ler calisma loglarini `scripts\logs\` klasorune yazar.
Log dosyalari tarih-saat damgali olarak olusturulur:

```
scripts\logs\zekai-platform-20260516-040100.log
scripts\logs\zekai-market-20260516-040100.log
scripts\logs\dotnet-backend-20260516-040100.log
scripts\logs\setup-backend-20260516-040100.log
```

## Gerekli Araclar

- Node.js LTS
- .NET 10 SDK
- PostgreSQL
- Python 3.11+ veya 3.12 (buyer_agent icin)
- `backend\buyer_agent\.env` icinde `GOOGLE_API_KEY`

## Notlar

- `.env`, `.venv`, `.next`, `node_modules`, `scripts\logs\` ve ADK session DB dosyalari git'e alinmaz.
- ZekAI Platform ve ZekAI Market **birbirinden bagimsiz** Next.js uygulamalarıdır.
