import asyncio
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel, Field

from mock.responses import get_mock_social_content, is_mockable_gemini_error

router = APIRouter()

MODEL = os.getenv("GEMINI_SOCIAL_MODEL", "gemini-2.5-flash-lite").strip()
THINKING_BUDGET = int(os.getenv("GEMINI_SOCIAL_THINKING_BUDGET", "0"))

TONE_INSTRUCTIONS = {
    "profesyonel": "Profesyonel, kurumsal ve güvenilir bir ton. Marka itibarını öne çıkar, teknik değerleri vurgula.",
    "samimi": "Samimi, sıcak ve arkadaşça bir ton. Alıcıya doğrudan konuş, doğal bir dil kullan.",
    "mizahi": "Eğlenceli, mizahi ve neşeli bir ton. Emoji kullan, espri yap ama ürünün değerini düşürme.",
}

PURPOSE_INSTRUCTIONS = {
    "satis": "Satışı artır: faydayı, fiyat algısını ve hızlı aksiyonu öne çıkar.",
    "guven": "Güven oluştur: risk azaltan, iç rahatlatan ve kanıt odaklı mesajlar kullan.",
    "tanitim": "Ürün tanıtımı: temel özellikleri, kullanım senaryosunu ve farkını anlaşılır anlat.",
}

PLATFORM_LABELS = {
    "instagram": "Instagram",
    "tiktok": "TikTok / Reels",
    "twitter": "X",
}


class SocialContentRequest(BaseModel):
    product_title: str
    category: str
    price: float
    description: str | None = None
    features: list[str] = []
    tone: str
    purpose: str = "guven"
    platforms: list[str] = Field(default_factory=lambda: ["instagram", "tiktok", "twitter"])
    note: str | None = None


class InstagramContent(BaseModel):
    caption: str
    hashtags: list[str]
    cta: str
    overlay_text: str


class TiktokScene(BaseModel):
    title: str
    description: str


class TiktokContent(BaseModel):
    hook: str
    scenes: list[TiktokScene]
    caption: str
    hashtags: list[str]


class TwitterContent(BaseModel):
    post: str
    hashtags: list[str]
    cta: str


class SocialContentResponse(BaseModel):
    tone: str
    purpose: str
    platforms: list[str]
    instagram: InstagramContent | None = None
    tiktok: TiktokContent | None = None
    twitter: TwitterContent | None = None


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _normalize_platforms(platforms: list[str]) -> list[str]:
    normalized = []
    for platform in platforms:
        key = platform.lower().strip()
        if key in {"x", "twitter"}:
            key = "twitter"
        if key in PLATFORM_LABELS and key not in normalized:
            normalized.append(key)
    return normalized or ["instagram"]


def _product_context(req: SocialContentRequest) -> str:
    features_text = ", ".join(req.features) if req.features else "belirtilmemiş"
    desc_text = req.description or "belirtilmemiş"
    note_text = req.note.strip() if req.note and req.note.strip() else "belirtilmemiş"
    return (
        f"Ürün: {req.product_title}\n"
        f"Kategori: {req.category}\n"
        f"Fiyat: ₺{req.price:.0f}\n"
        f"Açıklama: {desc_text}\n"
        f"Özellikler: {features_text}\n"
        f"Satıcı notu: {note_text}"
    )


def _generate_sync(client: genai.Client, req: SocialContentRequest) -> SocialContentResponse:
    platforms = _normalize_platforms(req.platforms)
    tone = TONE_INSTRUCTIONS.get(req.tone, TONE_INSTRUCTIONS["samimi"])
    purpose = PURPOSE_INSTRUCTIONS.get(req.purpose, PURPOSE_INSTRUCTIONS["guven"])
    platform_text = ", ".join(PLATFORM_LABELS[p] for p in platforms)

    prompt = (
        f"Aşağıdaki Türk e-ticaret ürünü için seçilen platformlara özel Türkçe sosyal medya içerikleri üret.\n\n"
        f"{_product_context(req)}\n\n"
        f"Ton: {tone}\n"
        f"Amaç: {purpose}\n"
        f"Platformlar: {platform_text}\n\n"
        "KURALLAR (MUTLAKA UY):\n"
        "- Sadece seçilen platformlar için içerik üret; diğerlerini null bırak.\n"
        "- Her platform için tüm alanları DOLU döndür, hiçbirini boş bırakma.\n"
        "- Instagram: caption 300-420 karakter, 5-8 hashtag (#ile), kısa CTA cümlesi, overlay_text max 50 karakter.\n"
        "- TikTok: dikkat çeken hook cümlesi, tam olarak 3 sahne (title+description), caption, 3-5 hashtag.\n"
        "- X: 220 karakteri geçmeyen post, 1-3 hashtag, kısa CTA.\n"
        "- Türkçe yaz. Satıcının direkt kullanabileceği içerik üret.\n"
        "- Metni pazarlama amacıyla güçlü kur: net fayda, güven unsuru, satın alma motivasyonu ve platforma uygun CTA kullan.\n"
        "- Satıcı notu verilmişse kampanya, hedef kitle veya özel vurguyu doğal biçimde içeriğe yedir."
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Sen Türk e-ticaret satıcıları için platforma özel sosyal medya içeriği üreten uzman bir içerik stratejistisin. "
                "Her platform için eksiksiz ve dolu içerik üretirsin. Hiçbir alanı boş bırakmazsın."
            ),
            response_mime_type="application/json",
            response_schema=SocialContentResponse,
            thinking_config=types.ThinkingConfig(thinking_budget=THINKING_BUDGET),
        ),
    )

    result = SocialContentResponse.model_validate_json(response.text)
    result.tone = req.tone
    result.purpose = req.purpose
    result.platforms = platforms
    return result


def _mock_response(req: SocialContentRequest) -> JSONResponse:
    platforms = _normalize_platforms(req.platforms)
    payload = get_mock_social_content(
        product_title=req.product_title,
        category=req.category,
        price=req.price,
        tone=req.tone,
        purpose=req.purpose,
        platforms=platforms,
    )
    return JSONResponse(payload)


@router.post("/social-content")
async def generate_social_content(req: SocialContentRequest):
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        # API key yoksa demo mock dön — diğer seller agent'larıyla tutarlı.
        return _mock_response(req)

    client = genai.Client(api_key=api_key)
    try:
        result = await asyncio.to_thread(_generate_sync, client, req)
        return JSONResponse(result.model_dump())
    except genai_errors.APIError as exc:
        if is_mockable_gemini_error(exc):
            # Rate-limit / transient hata → demo mock; UI _mock bayrağını gösterir.
            return _mock_response(req)
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc
