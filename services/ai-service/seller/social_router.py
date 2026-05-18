import asyncio
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel

from mock.responses import is_rate_limit, get_mock_social_content

router = APIRouter()

MODEL = "gemini-2.5-flash"

TONE_INSTRUCTIONS = {
    "profesyonel": "Profesyonel, kurumsal ve güvenilir bir ton. Marka itibarını öne çıkar, teknik değerleri vurgula.",
    "samimi": "Samimi, sıcak ve arkadaşça bir ton. Alıcıya doğrudan konuş, doğal bir dil kullan.",
    "mizahi": "Eğlenceli, mizahi ve neşeli bir ton. Emoji kullan, espri yap ama ürünün değerini düşürme.",
}


class SocialContentRequest(BaseModel):
    product_title: str
    category: str
    price: float
    description: str | None = None
    features: list[str] = []
    tone: str  # profesyonel | samimi | mizahi


class TiktokScene(BaseModel):
    time: str
    text: str


class SocialContentResponse(BaseModel):
    instagram: str
    tiktok: list[TiktokScene]
    twitter: str


class _InstagramOutput(BaseModel):
    caption: str


class _TiktokOutput(BaseModel):
    scenes: list[TiktokScene]


class _TwitterOutput(BaseModel):
    tweet: str


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _product_context(req: SocialContentRequest) -> str:
    features_text = ", ".join(req.features) if req.features else "belirtilmemiş"
    desc_text = req.description or "belirtilmemiş"
    return (
        f"Ürün: {req.product_title}\n"
        f"Kategori: {req.category}\n"
        f"Fiyat: ₺{req.price:.0f}\n"
        f"Açıklama: {desc_text}\n"
        f"Özellikler: {features_text}"
    )


def _generate_instagram_sync(client: genai.Client, req: SocialContentRequest) -> str:
    tone = TONE_INSTRUCTIONS.get(req.tone, TONE_INSTRUCTIONS["samimi"])
    prompt = (
        f"Şu ürün için bir Instagram gönderisi yaz:\n{_product_context(req)}\n\n"
        f"Ton: {tone}\n\n"
        "Kurallar:\n"
        "- 280-400 karakter arası\n"
        "- 4-6 emoji stratejik yerlerde\n"
        "- 6-10 alakalı Türkçe hashtag (# ile)\n"
        "- İlk cümle dikkat çekici hook olmalı\n"
        "- Ürünün faydası ve duygusu öne çıksın"
    )
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Sen bir Instagram e-ticaret içerik uzmanısın. "
                "Yüksek etkileşim getiren, görsel hikaye anlatan, satışa yönlendiren Türkçe içerikler üretirsin. "
                "Asla robota benzeyen, her zaman insancıl ve özgün yazarsın."
            ),
            response_mime_type="application/json",
            response_schema=_InstagramOutput,
            thinking_config=types.ThinkingConfig(thinking_budget=512),
        ),
    )
    return _InstagramOutput.model_validate_json(response.text).caption


def _generate_tiktok_sync(client: genai.Client, req: SocialContentRequest) -> list[TiktokScene]:
    tone = TONE_INSTRUCTIONS.get(req.tone, TONE_INSTRUCTIONS["samimi"])
    prompt = (
        f"Şu ürün için bir TikTok video scripti yaz:\n{_product_context(req)}\n\n"
        f"Ton: {tone}\n\n"
        "Kurallar:\n"
        "- Tam olarak 3 sahne üret\n"
        "- Sahne süreleri: '00:00-00:03', '00:03-00:09', '00:09-00:15'\n"
        "- Sahne 1 (hook): İzleyiciyi 3 saniyede yakala — soru, şok, ya da merak\n"
        "- Sahne 2 (body): Ürünün ana faydasını göster/anlat\n"
        "- Sahne 3 (CTA): Harekete geçirici çağrı, fiyat veya teklif"
    )
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Sen bir TikTok video script yazarısın. "
                "Hook-Body-CTA yapısına sıkı sıkıya bağlısın. "
                "Her sahne en fazla 2 cümle, direkt ve enerjik. "
                "Sahne metni ekrandaki seslendirme/yazı için optimize edilmiş."
            ),
            response_mime_type="application/json",
            response_schema=_TiktokOutput,
            thinking_config=types.ThinkingConfig(thinking_budget=512),
        ),
    )
    return _TiktokOutput.model_validate_json(response.text).scenes


def _generate_twitter_sync(client: genai.Client, req: SocialContentRequest) -> str:
    tone = TONE_INSTRUCTIONS.get(req.tone, TONE_INSTRUCTIONS["samimi"])
    prompt = (
        f"Şu ürün için bir Twitter/X gönderisi yaz:\n{_product_context(req)}\n\n"
        f"Ton: {tone}"
    )
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Sen 280 karakter sınırında çalışan bir e-ticaret copywriter'sın. "
                "Her kelime değer taşımalı. Yapı: güçlü hook (1 cümle) + ürün faydası + fiyat/teklif + 1-2 hashtag. "
                "Hiçbir zaman 270 karakteri geçme. URL için yer bırak."
            ),
            response_mime_type="application/json",
            response_schema=_TwitterOutput,
            thinking_config=types.ThinkingConfig(thinking_budget=512),
        ),
    )
    return _TwitterOutput.model_validate_json(response.text).tweet


@router.post("/social-content", response_model=SocialContentResponse)
async def generate_social_content(req: SocialContentRequest):
    client = _get_client()

    try:
        instagram, tiktok_scenes, twitter = await asyncio.gather(
            asyncio.to_thread(_generate_instagram_sync, client, req),
            asyncio.to_thread(_generate_tiktok_sync, client, req),
            asyncio.to_thread(_generate_twitter_sync, client, req),
        )
    except genai_errors.APIError as exc:
        if is_rate_limit(exc):
            return JSONResponse(content=get_mock_social_content(req.product_title, req.category, req.price))
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc

    return SocialContentResponse(
        instagram=instagram,
        tiktok=tiktok_scenes,
        twitter=twitter,
    )
