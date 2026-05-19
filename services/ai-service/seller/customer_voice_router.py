import asyncio
import os

from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel

router = APIRouter()

MODEL = os.getenv("GEMINI_CUSTOMER_VOICE_MODEL", "gemini-2.5-flash-lite").strip()
THINKING_BUDGET = int(os.getenv("GEMINI_CUSTOMER_VOICE_THINKING_BUDGET", "0"))


# ── Request / Response models ─────────────────────────────────────────────────

class ReviewInput(BaseModel):
    review_id: int
    author_name: str
    rating: int
    text: str
    tags: list[str] = []


class CustomerVoiceRequest(BaseModel):
    product_title: str
    category: str
    reviews: list[ReviewInput]


class ReplyDraft(BaseModel):
    review_id: int
    needs_reply: bool
    issue_type: str
    sentiment: str
    suggested_reply: str


class FaqDraft(BaseModel):
    question: str
    answer: str
    source_review_ids: list[int]
    category_tag: str


class CustomerVoiceResponse(BaseModel):
    reply_drafts: list[ReplyDraft]
    faq_drafts: list[FaqDraft]


# ── Core ──────────────────────────────────────────────────────────────────────

def _generate_sync(client: genai.Client, req: CustomerVoiceRequest) -> CustomerVoiceResponse:
    reviews_text = "\n".join(
        f"[ID:{r.review_id}] {r.rating}/5 - {r.author_name}: {r.text}"
        + (f" Etiketler: {', '.join(r.tags)}" if r.tags else "")
        for r in req.reviews
    )

    prompt = (
        f"Aşağıdaki Türk e-ticaret ürünü için müşteri yorumlarını analiz et.\n\n"
        f"Ürün: {req.product_title}\nKategori: {req.category}\n\n"
        f"Yorumlar:\n{reviews_text}\n\n"
        "GÖREV 1 - YORUM YANITLARI:\n"
        "Her yorum için karar ver: cevap gerekli mi?\n"
        "- 5 yıldız kısa memnuniyet yorumlarına CEVAP VERME (needs_reply: false, suggested_reply: '')\n"
        "- Şikayet, soru, karışık, düşük puan içeren yorumlara KISA profesyonel cevap yaz\n"
        "- Cevaplar satıcı ağzından, Türkçe, 1-3 cümle, doğal\n"
        "- Garanti / iade / telafi gibi belirsiz vaatler VERME\n"
        "- Müşteriyi suçlama\n"
        "- issue_type: 'kargo' | 'urun_kalitesi' | 'kurulum' | 'kullanim' | 'fiyat' | 'diger'\n"
        "- sentiment: 'positive' | 'negative' | 'mixed'\n\n"
        "GÖREV 2 - SSS ÖNERİLERİ:\n"
        "Yorumlardan 3-5 adet ürüne özgü sık sorulan soru-cevap çıkar.\n"
        "- Gerçekten birden fazla yorumda geçen konuları seç\n"
        "- Cevaplar kısa, net, Türkçe\n"
        "- source_review_ids: bu sorunun çıktığı yorum ID'leri\n"
        "- category_tag: 'kurulum' | 'kullanim' | 'sarj' | 'kablo' | 'garanti' | 'boyut' | 'diger'\n\n"
        "KURAL: Tüm alanları dolu döndür. suggested_reply alanını ASLA null bırakma (gerekli değilse '' döndür)."
    )

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Sen Türk e-ticaret satıcıları için müşteri yorumlarını analiz eden ve "
                "profesyonel cevap taslakları ile SSS önerileri hazırlayan bir AI asistansın. "
                "Satıcı adına konuşursun. Hiçbir zaman kesin garanti, iade veya tazminat söz verme."
            ),
            response_mime_type="application/json",
            response_schema=CustomerVoiceResponse,
            thinking_config=types.ThinkingConfig(thinking_budget=THINKING_BUDGET),
        ),
    )

    return CustomerVoiceResponse.model_validate_json(response.text)


@router.post("/customer-voice", response_model=CustomerVoiceResponse)
async def generate_customer_voice(req: CustomerVoiceRequest):
    if not req.reviews:
        raise HTTPException(status_code=400, detail="En az bir yorum gerekli.")

    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")

    client = genai.Client(api_key=api_key)
    try:
        return await asyncio.to_thread(_generate_sync, client, req)
    except genai_errors.APIError as exc:
        raise HTTPException(status_code=503, detail=f"Gemini API hatası: {exc}") from exc
