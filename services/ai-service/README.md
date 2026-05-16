# Zekai AI Service

FastAPI ve Google ADK tabanli AI analiz servisidir.

Standart calisma sekli root dizinden Docker Compose'tur:

```bash
docker compose up --build
```

Servis disaridan `http://localhost:8000`, container network icinden `http://ai-service:8000` adresindedir.

Frontend bu servisi dogrudan cagirmamalidir. Standart akis:

```txt
zekai-platform-web -> zekai-api -> ai-service
```

`GOOGLE_API_KEY` root `.env` icinde tanimli degilse AI endpointleri 503 ve net hata mesaji doner.
