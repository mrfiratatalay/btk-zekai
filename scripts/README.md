# Scripts

Bu projede kalici calisma standardi full Docker Compose'tur.

```bat
scripts\start-all.bat
```

Bu script repo kokunde su komutu calistirir:

```bat
docker compose up --build
```

Standart adresler:

| Servis | Adres |
| --- | --- |
| Akilli Market Web | `http://localhost:3000` |
| Zekai Platform Web | `http://localhost:3001` |
| commerce-api Swagger | `http://localhost:5001/swagger` |
| zekai-api Swagger | `http://localhost:5002/swagger` |
| ai-service | `http://localhost:8000` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

Temiz test icin:

```bat
docker compose down -v
docker compose up --build
```

Not: `down -v` veritabanini sifirlar; sadece temiz test icin kullan.
