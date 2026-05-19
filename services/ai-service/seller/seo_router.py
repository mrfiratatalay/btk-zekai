import asyncio
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel

from mock.responses import get_mock_seo, is_mockable_gemini_error

router = APIRouter()

MODEL = os.getenv("GEMINI_SEO_MODEL", "gemini-2.5-flash-lite").strip()
THINKING_BUDGET = int(os.getenv("GEMINI_SEO_THINKING_BUDGET", "0"))


class SeoRequest(BaseModel):
    product_title: str
    category: str
    price: float
    description: str | None = None
    features: list[str] = []
    brand: str | None = None


class SeoResponse(BaseModel):
    focus_keyword: str
    secondary_keywords: list[str]
    seo_title: str
    meta_description: str
    url_slug_suggestion: str
    improvement_tips: list[str]


def _build_prompt(req: SeoRequest) -> str:
    features_text = ", ".join(req.features) if req.features else "belirtilmemiş"
    desc_text = req.description or "belirtilmemiş"
    brand_text = req.brand or "belirtilmemiş"
    return (
        "Sen Türk e-ticaret pazarına hâkim, dönüşüm odaklı bir SEO uzmanısın. "
        "Aşağıdaki ürün için Akıllı Market storefront'unda arama görünürlüğünü ve tıklama "
        "oranını artıracak SEO çıktısı üret. Türkçe yaz.\n\n"
        f"Ürün: {req.product_title}\n"
        f"Marka: {brand_text}\n"
        f"Kategori: {req.category}\n"
        f"Fiyat: ₺{req.price:.0f}\n"
        f"Açıklama: {desc_text}\n"
        f"Özellikler: {features_text}\n\n"
        "ÇIKTI KURALLARI (mutlaka uy):\n"
        "- focus_keyword: Tek, en yüksek aramaya sahip birincil ifade (2-4 kelime).\n"
        "- secondary_keywords: 5-8 tamamlayıcı ifade; long-tail varyasyonlar, kullanım niyeti, fiyat/yorum/öneri sorguları. Tekrarsız.\n"
        "- seo_title: 50-65 karakter, birincil kelime başa yakın, marka varsa korunsun. Tıklatan ifade kullan.\n"
        "- meta_description: 140-160 karakter, ana fayda + fiyat sinyali + güven mesajı + net CTA.\n"
        "- url_slug_suggestion: kebab-case, sadece [a-z0-9-], Türkçe karakterleri ascii'ye çevir, en fazla 60 karakter.\n"
        "- improvement_tips: 4-6 madde, satıcının BUGÜN uygulayabileceği somut SEO/CRO aksiyonları. "
        "Genel laf değil — bu ürüne özel, ölçülebilir."
    )


def _generate_sync(client: genai.Client, req: SeoRequest) -> SeoResponse:
    prompt = _build_prompt(req)
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SeoResponse,
            temperature=0.3,
            thinking_config=types.ThinkingConfig(thinking_budget=THINKING_BUDGET),
        ),
    )
    return SeoResponse.model_validate_json(response.text)


def _mock_response(req: SeoRequest) -> JSONResponse:
    return JSONResponse(get_mock_seo(req.product_title, req.category, req.price))


@router.post("/seo")
async def generate_seo(req: SeoRequest):
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        return _mock_response(req)

    client = genai.Client(api_key=api_key)
    try:
        result = await asyncio.to_thread(_generate_sync, client, req)
        return JSONResponse(result.model_dump())
    except genai_errors.APIError as exc:
        if is_mockable_gemini_error(exc):
            return _mock_response(req)
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc
