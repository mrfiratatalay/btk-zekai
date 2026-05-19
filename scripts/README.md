# Scripts

Bu projede backend servisleri Docker Compose ile, frontendler ise lokal dev server ile calistirilir.

```bat
scripts\start-docker.bat
scripts\start-frontends.bat
```

`start-docker.bat` dusuk kaynak kullanimi icin:

- Eksik image varsa servisleri sirayla build eder.
- Image hazirsa tekrar build yapmaz.
- Servisleri arka planda baslatir.
- Loglari ekrana surekli basmaz.

Standart adresler:

| Servis | Adres |
| --- | --- |
| Akilli Market Web | `http://localhost:3000` |
| Zekai Platform Web | `http://localhost:3001` |
| commerce-api Swagger | `http://localhost:5001/swagger` |
| zekai-api Swagger | `http://localhost:5002/swagger` |
| ai-service | `http://localhost:8000` |
| PostgreSQL | `localhost:5432` |

Log izlemek icin:

```bat
docker compose logs -f
```

Durdurmak icin:

```bat
docker compose down
```

Temiz test icin:

```bat
docker compose down -v
scripts\start-docker.bat
```

Not: `down -v` veritabanini sifirlar; sadece temiz test icin kullan.
