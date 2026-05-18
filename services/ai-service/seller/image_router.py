import asyncio
import base64
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel

from mock.responses import is_mockable_gemini_error, fetch_picsum_b64

router = APIRouter()

# Nano Banana 2 — speed-optimized image generation
IMAGE_MODEL = "gemini-3.1-flash-image-preview"


class ImageGenerateRequest(BaseModel):
    product_title: str
    category: str
    description: str | None = None
    style: str = "ecommerce"


class ImageGenerateResponse(BaseModel):
    image_base64: str
    mime_type: str
    description: str


class MultiImageRequest(BaseModel):
    product_title: str
    category: str
    description: str | None = None


class ImageResult(BaseModel):
    type: str  # studio | unboxing | lifestyle
    label: str
    image_base64: str
    mime_type: str


class MultiImageResponse(BaseModel):
    images: list[ImageResult]


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _generate_image_sync(client: genai.Client, prompt: str) -> tuple[str, str]:
    """Returns (base64_data, mime_type). Runs synchronously — wrap in asyncio.to_thread."""
    response = client.models.generate_content(
        model=IMAGE_MODEL,
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            thinking_config=types.ThinkingConfig(thinking_level="minimal"),
        ),
    )

    parts = getattr(response, "parts", None)
    if parts is None and response.candidates:
        parts = response.candidates[0].content.parts

    for part in parts or []:
        inline_data = getattr(part, "inline_data", None)
        if inline_data and inline_data.data:
            mime = inline_data.mime_type or "image/png"
            data = inline_data.data
            if isinstance(data, bytes):
                return base64.b64encode(data).decode("utf-8"), mime
            return data, mime
    raise ValueError("AI'dan görsel alınamadı.")


def _build_studio_prompt(title: str, category: str, desc: str | None) -> str:
    extra = f" — {desc[:80]}" if desc else ""
    return (
        f"Professional product photograph of: {title}{extra}. "
        f"Category: {category}. "
        "Perfectly clean white background, professional studio lighting, product perfectly centered, "
        "sharp focus, no shadows, no text, no watermarks, no people. "
        "High resolution commercial quality suitable for online marketplace listing."
    )


def _build_unboxing_prompt(title: str, category: str, desc: str | None) -> str:
    extra = f" — {desc[:80]}" if desc else ""
    return (
        f"Flat lay unboxing photograph of: {title}{extra}. "
        f"Category: {category}. "
        "Product taken out of its box, arranged neatly on a clean white or light gray surface together with its box and all included accessories. "
        "Top-down view, soft natural light, minimal style, no people, no text, no watermarks. "
        "Shows everything included in the package."
    )


def _build_lifestyle_prompt(title: str, category: str, desc: str | None) -> str:
    extra = f" — {desc[:80]}" if desc else ""
    return (
        f"Lifestyle photograph of: {title}{extra}. "
        f"Category: {category}. "
        "Product being naturally used by a person in a realistic everyday environment. "
        "Warm, inviting ambient lighting, natural setting that matches the product use case. "
        "Professional photography, no text, no watermarks. Shows the product in real-life context."
    )


@router.post("/ai-image", response_model=ImageGenerateResponse)
async def generate_product_image(req: ImageGenerateRequest):
    """Single image generation (legacy endpoint — kept for backwards compatibility)."""
    client = _get_client()
    prompt = _build_studio_prompt(req.product_title, req.category, req.description)
    try:
        image_b64, mime_type = await asyncio.to_thread(_generate_image_sync, client, prompt)
    except genai_errors.APIError as exc:
        if is_mockable_gemini_error(exc):
            b64, mime = await asyncio.to_thread(fetch_picsum_b64, "studio")
            return JSONResponse(content={
                "image_base64": b64,
                "mime_type": mime,
                "description": f"{req.product_title} için demo görsel (Gemini limit aşıldı).",
                "_mock": True,
            })
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return ImageGenerateResponse(
        image_base64=image_b64,
        mime_type=mime_type,
        description=f"{req.product_title} için AI tarafından üretildi.",
    )


@router.post("/ai-images", response_model=MultiImageResponse)
async def generate_product_images(req: MultiImageRequest):
    """Generate 3 distinct product shots in parallel: Studio, Unboxing, Lifestyle."""
    client = _get_client()

    shot_specs = [
        ("studio",    "Stüdyo",    _build_studio_prompt(req.product_title, req.category, req.description)),
        ("unboxing",  "Kutu Açma", _build_unboxing_prompt(req.product_title, req.category, req.description)),
        ("lifestyle", "Kullanım",  _build_lifestyle_prompt(req.product_title, req.category, req.description)),
    ]

    try:
        results = await asyncio.gather(
            *[asyncio.to_thread(_generate_image_sync, client, prompt) for _, _, prompt in shot_specs],
            return_exceptions=True,
        )
    except genai_errors.APIError as exc:
        if is_mockable_gemini_error(exc):
            mock_images = await asyncio.gather(
                *[asyncio.to_thread(fetch_picsum_b64, shot_type) for shot_type, _, _ in shot_specs]
            )
            return JSONResponse(content={
                "images": [
                    {"type": t, "label": lbl, "image_base64": b64, "mime_type": mime}
                    for (t, lbl, _), (b64, mime) in zip(shot_specs, mock_images)
                ],
                "_mock": True,
            })
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc

    # Bireysel görev hataları — rate limit ise mock'a düş, değilse atla
    mockable_error = any(
        isinstance(r, genai_errors.APIError) and is_mockable_gemini_error(r) for r in results
    )
    if mockable_error:
        mock_images = await asyncio.gather(
            *[asyncio.to_thread(fetch_picsum_b64, shot_type) for shot_type, _, _ in shot_specs]
        )
        return JSONResponse(content={
            "images": [
                {"type": t, "label": lbl, "image_base64": b64, "mime_type": mime}
                for (t, lbl, _), (b64, mime) in zip(shot_specs, mock_images)
            ],
            "_mock": True,
        })

    images: list[ImageResult] = []
    first_error: Exception | None = None
    for (shot_type, label, _), result in zip(shot_specs, results):
        if isinstance(result, Exception):
            first_error = first_error or result
            continue
        b64, mime = result
        images.append(ImageResult(type=shot_type, label=label, image_base64=b64, mime_type=mime))

    if not images:
        detail = f"Görsel üretilemedi: {first_error}" if first_error else "Hiçbir görsel üretilemedi. Lütfen tekrar deneyin."
        raise HTTPException(status_code=500, detail=detail)

    return MultiImageResponse(images=images)
