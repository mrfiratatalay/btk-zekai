# Scripts

Windows lokal gelistirme icin ana giris noktasi:

```bat
scripts\start-all.bat
```

Bu komut iki ayri terminal acar:

- ADK backend: `http://localhost:8000`
- Next.js frontend: `http://localhost:3000`

## Ilk kurulum

Backend bagimliliklarini elle hazirlamak istersen:

```bat
scripts\setup-backend.bat
```

Frontend icin ayri kurulum script'i yok; `scripts\start-frontend.bat` ilk calismada
`node_modules` yoksa `npm ci` veya `npm install` calistirir.

## Tek tek calistirma

```bat
scripts\start-backend.bat
scripts\start-frontend.bat
```

## Gerekli araclar

- Node.js LTS
- Python 3.11+ veya 3.12
- `backend\buyer_agent\.env` icinde `GOOGLE_API_KEY`

`.env`, `.venv`, `.next`, `node_modules` ve ADK session DB dosyalari git'e alinmaz.
