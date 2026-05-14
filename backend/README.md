# Zekai ADK Backend

Bu backend, alici karar analizini Google ADK uzerinde calisan cok ajanli bir workflow olarak sunar.

## Kurulum

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item buyer_agent\.env.example buyer_agent\.env
```

`buyer_agent\.env` icine Google AI Studio API anahtarini yaz:

```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=...
```

## Calistirma

```powershell
python main.py
```

Varsayilan adres: `http://localhost:8000`

ADK dev UI icin:

```powershell
adk web --agents_dir .
```

Frontend tarafinda gerekirse:

```env
NEXT_PUBLIC_ADK_API_URL=http://localhost:8000
```
