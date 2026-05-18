import os

import uvicorn
from fastapi.responses import JSONResponse
from google.adk.cli.fast_api import get_fast_api_app

from seller.social_router import router as social_router
from seller.content_router import router as content_router
from seller.simulation_router import router as simulation_router
from seller.image_router import router as image_router
from seller.bundle_router import router as bundle_router
from buyer.buyer_router import router as buyer_router
from buyer.kombin_router import router as kombin_router


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

# Seller AI endpoints (Native Gemini SDK)
app.include_router(social_router, prefix="/seller", tags=["seller-ai"])
app.include_router(content_router, prefix="/seller", tags=["seller-ai"])
app.include_router(simulation_router, prefix="/seller", tags=["seller-ai"])
app.include_router(image_router, prefix="/seller", tags=["seller-ai"])
app.include_router(bundle_router, prefix="/seller", tags=["seller-ai"])
app.include_router(buyer_router, prefix="/buyer", tags=["buyer-ai"])
app.include_router(kombin_router, prefix="/buyer", tags=["buyer-ai"])


def _has_google_api_key() -> bool:
    key = os.getenv("GOOGLE_API_KEY", "").strip()
    return bool(key) and key != "your_google_api_key_here"


@app.middleware("http")
async def require_google_api_key(request, call_next):
    ai_paths = ("/run", "/run_sse", "/apps/", "/seller/", "/buyer/")
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
