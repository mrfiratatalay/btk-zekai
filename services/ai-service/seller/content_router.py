import asyncio
import os
import urllib.request

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel

from mock.responses import is_mockable_gemini_error, get_mock_content

router = APIRouter()

MODEL = "gemini-2.5-flash-lite"


class SimulationContext(BaseModel):
    buy_count: int = 0
    skip_count: int = 0
    undecided_count: int = 0
    skipper_reasons: list[str] = []
    undecided_concerns: list[str] = []
    recommendations: list[str] = []


class ContentGenerateRequest(BaseModel):
    product_title: str
    category: str
    price: float
    current_description: str | None = None
    current_features: list[str] = []
    image_url: str | None = None
    simulation_context: SimulationContext | None = None


class ContentGenerateResponse(BaseModel):
    title: str
    short_description: str
    description: str
    features: list[str]
    what_i_improved: str


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _fetch_image_bytes(url: str) -> tuple[bytes, str] | None:
    """Download image bytes from URL. Runs in sync thread."""
    try:
        full_url = f"http://localhost:5001{url}" if url.startswith("/") else url
        req = urllib.request.Request(full_url, headers={"User-Agent": "ZekaiAI/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            mime = resp.headers.get_content_type() or "image/jpeg"
            return resp.read(), mime
    except Exception:
        return None


def _build_simulation_section(ctx: SimulationContext) -> str:
    lines = [
        "─── MÜŞTERİ SİMÜLASYONU SONUÇLARI ───",
        f"Sonuç: {ctx.buy_count} satın aldı / {ctx.skip_count} vazgeçti / {ctx.undecided_count} kararsız",
    ]
    if ctx.skipper_reasons:
        lines.append("Vazgeçme nedenleri:")
        for r in ctx.skipper_reasons:
            lines.append(f"  • {r}")
    if ctx.undecided_concerns:
        lines.append("Kararsız kalma endişeleri:")
        for c in ctx.undecided_concerns:
            lines.append(f"  • {c}")
    if ctx.recommendations:
        lines.append("Müşteri önerileri:")
        for r in ctx.recommendations:
            if r:
                lines.append(f"  • {r}")
    lines.append(
        "GÖREV: Bu spesifik itirazları ve endişeleri DOĞRUDAN karşılayan içerik yaz. "
        "Genel iyileştirme değil — bu müşterilerin vazgeçme nedenlerini çözen, "
        "onları ikna edecek somut mesajlar ver."
    )
    return "\n".join(lines)


def _build_prompt(req: ContentGenerateRequest) -> str:
    features_text = ", ".join(req.current_features) if req.current_features else "yok"
    desc_text = req.current_description or "yok"
    vision_note = (
        "Sana ürün görseli de sağlandı — görselden gözlemlediğin renk, malzeme, form, "
        "aksesuarlar ve ayırt edici detayları açıklamaya entegre et."
        if req.image_url else ""
    )
    sim_section = _build_simulation_section(req.simulation_context) if req.simulation_context else ""
    return f"""Sen bir Türk e-ticaret içerik uzmanısın; SEO optimizasyonu, dönüşüm oranı ve ürün kopyası uzmanlığına sahipsin.
{vision_note}

Mevcut Ürün Bilgileri:
- Başlık: {req.product_title}
- Kategori: {req.category}
- Fiyat: ₺{req.price:.0f}
- Mevcut Açıklama: {desc_text}
- Mevcut Özellikler: {features_text}

{sim_section}

Üretim Kuralları:
1. title: SEO uyumlu, anahtar kelime içeren, dikkat çekici başlık (50-80 karakter). Marka adı varsa koru.
2. short_description: 1-2 cümle, ana fayda ve benzersiz değer önerisi (max 160 karakter).
3. description: 2-3 paragraf — önce kullanım senaryosu (alıcı hangi sorunu çözüyor), sonra teknik detaylar, sonra güven sinyalleri (garanti, kalite). Görsel sağlandıysa gözlemlediğin detayları entegre et.{"Simülasyon verisi varsa vazgeçme nedenlerini birebir ele al." if req.simulation_context else ""}
4. features: tam olarak 5 madde, somut ve ölçülebilir bilgiler, kullanıcı faydası odaklı. "✓" veya madde işareti ekleme.
5. what_i_improved: 1-2 cümle, {"simülasyon bulgularına göre neyi çözdüğünü" if req.simulation_context else "mevcut içerikten ne değiştirdin ve neden daha iyi"} açıkla. Satıcıya özet ver."""


def _generate_content_sync(client: genai.Client, req: ContentGenerateRequest) -> ContentGenerateResponse:
    """Synchronous generation — wrap with asyncio.to_thread."""
    prompt = _build_prompt(req)

    contents: list = []

    if req.image_url:
        result = _fetch_image_bytes(req.image_url)
        if result:
            img_bytes, mime_type = result
            contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type))

    contents.append(types.Part.from_text(text=prompt))

    response = client.models.generate_content(
        model=MODEL,
        contents=contents if len(contents) > 1 else prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ContentGenerateResponse,
            temperature=0.2,
        ),
    )
    return ContentGenerateResponse.model_validate_json(response.text)


@router.post("/ai-content", response_model=ContentGenerateResponse)
async def generate_content(req: ContentGenerateRequest):
    client = _get_client()
    try:
        return await asyncio.to_thread(_generate_content_sync, client, req)
    except genai_errors.APIError as exc:
        if is_mockable_gemini_error(exc):
            return JSONResponse(content=get_mock_content(req.product_title, req.category, req.price))
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc
