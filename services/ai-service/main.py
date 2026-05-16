import os

import uvicorn
from fastapi.responses import JSONResponse
from google.adk.cli.fast_api import get_fast_api_app


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = get_fast_api_app(
    agents_dir=BASE_DIR,
    session_service_uri="sqlite:///sessions.db",
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    web=True,
)


def _has_google_api_key() -> bool:
    key = os.getenv("GOOGLE_API_KEY", "").strip()
    return bool(key) and key != "your_google_api_key_here"


@app.middleware("http")
async def require_google_api_key(request, call_next):
    ai_paths = ("/run", "/run_sse", "/apps/")
    if request.url.path.startswith(ai_paths) and not _has_google_api_key():
        return JSONResponse(
            status_code=503,
            content={
                "message": "GOOGLE_API_KEY tanimli degil. Root .env dosyasina gecerli Google AI Studio API key ekleyin.",
            },
        )
    return await call_next(request)


@app.get("/health")
async def health():
    return {"status": "ok", "googleApiKeyConfigured": _has_google_api_key()}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
