import asyncio
import json
import os
from typing import Literal

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel

from mock.responses import is_mockable_gemini_error, MOCK_PERSONAS

router = APIRouter()

MODEL = "gemini-2.5-flash"


class SimulateRequest(BaseModel):
    product_title: str
    category: str
    price: float
    description: str | None = None
    features: list[str] = []


class PersonaResult(BaseModel):
    id: str
    name: str
    age: int
    city: str
    segment: str
    profile: str
    caresAbout: str
    decision: str  # buy | skip | undecided
    reason: str
    lookedAt: list[str]
    recommendation: str
    monologue: str


class SimulateResponse(BaseModel):
    personas: list[PersonaResult]


# ── Step 1 output: dynamic persona generation ─────────────────────────────────

class _DynamicPersona(BaseModel):
    id: str
    name: str
    age: int
    city: str
    segment: str
    profile: str
    caresAbout: str


class _PersonaList(BaseModel):
    personas: list[_DynamicPersona]


# ── Step 2 output: per-persona decision ───────────────────────────────────────

class _AIPersonaDecision(BaseModel):
    decision: Literal["buy", "skip", "undecided"]
    reason: str
    looked_at: list[str]
    recommendation: str
    monologue: str


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanımlı değil.")
    return genai.Client(api_key=api_key)


def _generate_personas_sync(client: genai.Client, req: SimulateRequest) -> list[_DynamicPersona]:
    """Step 1: Generate 5 realistic buyer personas tailored to this product."""
    prompt = f"""Bu ürün için bu ürünü gerçekten satın almayı düşünebilecek 5 farklı alıcı profili üret.

Ürün: {req.product_title}
Kategori: {req.category}
Fiyat: ₺{req.price:.0f}
{f"Açıklama: {req.description[:150]}" if req.description else ""}

Kurallar:
- Her profil BU ÜRÜNe özgü, gerçekçi ve birbirinden farklı bir alıcı tipini temsil etmeli
- id: slug formatında, nokta/boşluk yok (ör: genc_oyuncu, caliskan_anne)
- Türkiye şehirleri kullan (İstanbul, Ankara, İzmir, Bursa, Konya, Eskişehir vb.)
- segment: kısa açıklama (Öğrenci, Freelancer, Oyuncu, Çalışan Anne, vb.)
- profile: 1-2 cümle, bu kişinin bağlamı ve bu ürünü neden arayabileceği
- caresAbout: bu kişinin SADECE BU ÜRÜN için öncelik verdiği 1-2 somut alan"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=_PersonaList,
        ),
    )
    # APIError (rate limit dahil) burada yukarı iletilir
    result = _PersonaList.model_validate_json(response.text)
    return result.personas[:5]  # max 5


def _build_persona_prompt(
    persona: _DynamicPersona,
    product_title: str,
    category: str,
    price: float,
    description: str | None,
    features: list[str],
) -> str:
    features_text = ", ".join(features) if features else "belirtilmemiş"
    desc_text = description or "belirtilmemiş"
    return f"""Sen bir e-ticaret alışveriş simülatörüsün. Aşağıdaki müşteri profilini birebir canlandır ve ürünü bu müşteri gözüyle değerlendir.

Müşteri Profili:
- İsim: {persona.name}, {persona.age} yaşında, {persona.city}
- Segment: {persona.segment}
- Profil: {persona.profile}
- Önceliği: {persona.caresAbout}

Değerlendirilecek Ürün:
- Başlık: {product_title}
- Kategori: {category}
- Fiyat: ₺{price:.0f}
- Açıklama: {desc_text}
- Özellikler: {features_text}

Bu müşteri olarak ürünü gerçekçi biçimde değerlendir. Karar, gerçekten bu ürünün bu müşteriye uygunluğuna göre olmalı.
- decision: "buy" (satın alır), "skip" (almaz), "undecided" (kararsız)
- reason: Kararın kısa gerekçesi, bu müşterinin bakış açısından (1-2 cümle)
- looked_at: Müşterinin baktığı bilgi alanları (ör: ["Fiyat", "Özellikler", "Açıklama"])
- recommendation: Seller'a 1 cümlelik somut iyileştirme önerisi — bu müşteri segmentini daha iyi nasıl ikna edersin?
- monologue: Bu müşterinin iç sesi, birinci şahıs, samimi (1 cümle)"""


async def _evaluate_persona(
    client: genai.Client,
    persona: _DynamicPersona,
    req: SimulateRequest,
) -> PersonaResult:
    prompt = _build_persona_prompt(
        persona, req.product_title, req.category, req.price, req.description, req.features
    )
    fallback = PersonaResult(
        id=persona.id,
        name=persona.name,
        age=persona.age,
        city=persona.city,
        segment=persona.segment,
        profile=persona.profile,
        caresAbout=persona.caresAbout,
        decision="undecided",
        reason="Değerlendirme tamamlanamadı.",
        lookedAt=["Fiyat"],
        recommendation="Ürün bilgilerini tamamla.",
        monologue="Yeterli bilgi bulamadım.",
    )
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=_AIPersonaDecision,
                thinking_config=types.ThinkingConfig(thinking_budget=3072),
            ),
        )
        ai = _AIPersonaDecision.model_validate_json(response.text)
        return PersonaResult(
            id=persona.id,
            name=persona.name,
            age=persona.age,
            city=persona.city,
            segment=persona.segment,
            profile=persona.profile,
            caresAbout=persona.caresAbout,
            decision=ai.decision,
            reason=ai.reason,
            lookedAt=ai.looked_at,
            recommendation=ai.recommendation,
            monologue=ai.monologue,
        )
    except Exception:
        return fallback


# ── Mock SSE Stream ────────────────────────────────────────────────────────────

async def _mock_simulate_stream() -> None:
    """Rate limit aşıldığında mock persona stream'i üretir."""
    yield f'data: {json.dumps({"type": "mock_notice"})}\n\n'
    yield f'data: {json.dumps({"type": "step", "message": "Müşteri profilleri oluşturuluyor... (demo mod)"})}\n\n'
    await asyncio.sleep(0.5)
    yield f'data: {json.dumps({"type": "step", "message": "5 profil hazır, değerlendirme başlıyor... (demo mod)"})}\n\n'

    for persona in MOCK_PERSONAS:
        await asyncio.sleep(0.7)
        yield f'data: {json.dumps({"type": "persona", "persona": persona})}\n\n'

    yield f'data: {json.dumps({"type": "done"})}\n\n'


@router.post("/simulate-stream")
async def simulate_stream(req: SimulateRequest) -> StreamingResponse:
    """SSE endpoint — streams persona results one by one as they complete."""

    async def generate():
        client = _get_client()

        # Step 1: Generate dynamic personas — rate limit buradan tespit edilir
        yield f'data: {json.dumps({"type": "step", "message": "Müşteri profilleri oluşturuluyor..."})}\n\n'
        try:
            personas = await asyncio.to_thread(_generate_personas_sync, client, req)
        except genai_errors.APIError as exc:
            if is_mockable_gemini_error(exc):
                async for event in _mock_simulate_stream():
                    yield event
                return
            yield f'data: {json.dumps({"type": "error", "message": str(exc)})}\n\n'
            return
        except Exception as exc:
            yield f'data: {json.dumps({"type": "error", "message": str(exc)})}\n\n'
            return

        yield f'data: {json.dumps({"type": "step", "message": f"{len(personas)} profil hazır, değerlendirme başlıyor..."})}\n\n'

        # Step 2: Evaluate all personas concurrently, stream results as they complete
        queue: asyncio.Queue = asyncio.Queue()

        async def eval_and_enqueue(persona: _DynamicPersona) -> None:
            result = await _evaluate_persona(client, persona, req)
            await queue.put(result)

        tasks = [asyncio.create_task(eval_and_enqueue(p)) for p in personas]

        for _ in range(len(personas)):
            result: PersonaResult = await queue.get()
            yield f'data: {json.dumps({"type": "persona", "persona": result.model_dump()})}\n\n'

        await asyncio.gather(*tasks, return_exceptions=True)
        yield f'data: {json.dumps({"type": "done"})}\n\n'

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(req: SimulateRequest):
    client = _get_client()

    # Step 1: Generate dynamic personas for this product
    try:
        personas = await asyncio.to_thread(_generate_personas_sync, client, req)
    except genai_errors.APIError as exc:
        if is_mockable_gemini_error(exc):
            mock_result = {"personas": MOCK_PERSONAS, "_mock": True}
            return JSONResponse(content=mock_result)
        raise HTTPException(status_code=503, detail="Persona üretimi başarısız.")
    except Exception:
        raise HTTPException(status_code=503, detail="Persona üretimi başarısız.")

    # Step 2: Evaluate all personas in parallel with high-thinking mode
    tasks = [_evaluate_persona(client, persona, req) for persona in personas]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    output: list[PersonaResult] = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            p = personas[i]
            output.append(
                PersonaResult(
                    id=p.id, name=p.name, age=p.age, city=p.city,
                    segment=p.segment, profile=p.profile, caresAbout=p.caresAbout,
                    decision="undecided",
                    reason="Değerlendirme sırasında hata oluştu.",
                    lookedAt=["Fiyat"],
                    recommendation="Ürün bilgilerini tamamla.",
                    monologue="Yeterli bilgi bulamadım.",
                )
            )
        else:
            output.append(result)  # type: ignore[arg-type]

    return SimulateResponse(personas=output)
