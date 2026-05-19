import asyncio
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel, Field

from mock.responses import get_mock_bundle_recommendations

router = APIRouter()

MODEL = "gemini-2.5-flash"


class BundleCandidate(BaseModel):
    id: str
    title: str
    category: str
    price: float
    description: str | None = None
    features: list[str] = []


class BundleRecommendRequest(BaseModel):
    primary: BundleCandidate
    candidates: list[BundleCandidate]


class AiBundleRec(BaseModel):
    complementary_product_id: str
    semantic_score: int = Field(ge=0, le=100)
    why_together: str
    bundle_title: str
    bundle_short_description: str
    bundle_campaign_text: str
    cta_label: str
    suggested_discount: int = Field(ge=3, le=25)


class AiBundleRecommendResponse(BaseModel):
    recommendations: list[AiBundleRec]
    missing_opportunity_note: str | None = None


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _build_prompt(req: BundleRecommendRequest) -> str:
    candidates_lines = []
    for c in req.candidates:
        desc = f" | {c.description[:80]}..." if c.description else ""
        candidates_lines.append(
            f"  - ID: {c.id} | {c.title} | {c.category} | ₺{c.price:.0f}{desc}"
        )
    candidates_text = "\n".join(candidates_lines) if candidates_lines else "  (Aday ürün yok)"
    primary = req.primary
    primary_desc = f"\n- Açıklama: {primary.description[:120]}" if primary.description else ""
    primary_features = f"\n- Özellikler: {', '.join(primary.features[:5])}" if primary.features else ""

    return f"""Sen bir Türk e-ticaret paket stratejisi uzmanısın. Satıcıya, ana ürünüyle birlikte satılan en uyumlu paket önerilerini sun.

ANA ÜRÜN:
- ID: {primary.id}
- Başlık: {primary.title}
- Kategori: {primary.category}
- Fiyat: ₺{primary.price:.0f}{primary_desc}{primary_features}

ADAY TAMAMLAYICI ÜRÜNLER:
{candidates_text}

GÖREV:
1. Aday ürünlerden en uyumlu en fazla 3 ürünü seç. 3 mantıklı eşleşme yoksa daha az öner; hiç mantıklı uyum yoksa boş liste dön. Seçim kriterleri (önem sırasıyla):
   a) Kullanım senaryosu örtüşmesi — birlikte kullanılır mı?
   b) Semantik uyum — aynı müşteri segmenti alır mı?
   c) Fiyat dengesi — çok pahalı ya da çok ucuz olmamalı
2. Her seçim için şunları üret:
   - complementary_product_id: AYNEN adaydaki ID'yi yaz
   - semantic_score: 0-100 uyum puanı
   - why_together: "Bu iki ürünü birlikte alanlar genellikle..." ile başlayan somut gerekçe (1-2 cümle)
   - bundle_title: dikkat çeken paket adı (ör: "Gaming Starter Pack", "Ev Ofis Seti")
   - bundle_short_description: paketin müşteriye faydası, max 100 karakter
   - bundle_campaign_text: sepette gösterilecek kampanya metni, max 80 karakter (ör: "İkisini birlikte al, %10 kazan!")
   - cta_label: çağrı butonu metni (ör: "Paketi Sepete Ekle")
   - suggested_discount: % indirim önerisi (3-25 arası, fiyat oranına göre makul)
3. Eğer hiç mantıklı uyum yoksa: recommendations boş liste dön, missing_opportunity_note'a neden açıkla.

Türkçe yaz. Satış odaklı ve ikna edici ol."""


def _recommend_sync(client: genai.Client, req: BundleRecommendRequest) -> AiBundleRecommendResponse:
    """Synchronous bundle recommendation call — wrap with asyncio.to_thread."""
    if not req.candidates:
        return AiBundleRecommendResponse(
            recommendations=[],
            missing_opportunity_note="Mağazada tamamlayıcı ürün bulunmuyor. Farklı kategoride ürün ekleyerek paket fırsatı oluşturabilirsin.",
        )

    prompt = _build_prompt(req)
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Sen deneyimli bir e-ticaret stratejisti ve paket satış uzmanısın. "
                "Yalnızca gerçekten anlamlı ve müşteriyi ikna edebilecek paket kombinasyonlarını önerirsin. "
                "Düşük uyumlu kombinasyonları önermektense missing_opportunity_note kullanmayı tercih edersin."
            ),
            response_mime_type="application/json",
            response_schema=AiBundleRecommendResponse,
            thinking_config=types.ThinkingConfig(thinking_budget=512),
        ),
    )
    return AiBundleRecommendResponse.model_validate_json(response.text)


@router.post("/bundle-recommend", response_model=AiBundleRecommendResponse)
async def recommend_bundles(req: BundleRecommendRequest):
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        candidate_ids = [c.id for c in req.candidates]
        return JSONResponse(content=get_mock_bundle_recommendations(req.primary.id, candidate_ids))

    client = genai.Client(api_key=api_key)
    try:
        return await asyncio.to_thread(_recommend_sync, client, req)
    except genai_errors.APIError as exc:
        candidate_ids = [c.id for c in req.candidates]
        return JSONResponse(content=get_mock_bundle_recommendations(req.primary.id, candidate_ids))
