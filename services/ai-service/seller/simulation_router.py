import asyncio
import hashlib
import json
import os
import time
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import errors as genai_errors, types
from pydantic import BaseModel, ValidationError

router = APIRouter()

MODEL = os.getenv("SIMULATION_MODEL", "gemini-2.5-flash-lite")
FALLBACK_MODEL = os.getenv("SIMULATION_FALLBACK_MODEL", "gemini-2.5-flash")
SIMULATION_TIMEOUT_SECONDS = int(os.getenv("SIMULATION_TIMEOUT_SECONDS", "45"))
SIMULATION_CACHE_TTL_SECONDS = int(os.getenv("SIMULATION_CACHE_TTL_SECONDS", "86400"))
SIMULATION_CACHE_MAX_ITEMS = int(os.getenv("SIMULATION_CACHE_MAX_ITEMS", "256"))


FocusArea = Literal[
    "image", "title", "price", "rating", "reviews",
    "features", "shipping", "warranty", "cta",
]

FOCUS_AREAS: list[str] = [
    "image", "title", "price", "rating", "reviews",
    "features", "shipping", "warranty", "cta",
]

FOCUS_LABELS: dict[str, str] = {
    "image": "Gorsellere bakiyor",
    "title": "Basligi okuyor",
    "price": "Fiyati tartiyor",
    "rating": "Puanlari inceliyor",
    "reviews": "Yorumlara bakiyor",
    "features": "Ozellikleri inceliyor",
    "shipping": "Kargoya bakiyor",
    "warranty": "Garantiye bakiyor",
    "cta": "Sepete eklemeyi dusunuyor",
}

DEFAULT_SEGMENTS = [
    {
        "id": "butce_odakli_alici",
        "name": "Elif",
        "age": 28,
        "city": "Istanbul",
        "segment": "Butce odakli alici",
        "profile": "Fiyat performans dengesine bakar ve gereksiz pahali urunlerden uzak durur.",
        "caresAbout": "Fiyat, yorumlar ve garanti",
        "focusArea": "price",
    },
    {
        "id": "kalite_arayan_profesyonel",
        "name": "Mert",
        "age": 34,
        "city": "Ankara",
        "segment": "Kalite arayan profesyonel",
        "profile": "Isinde uzun sure kullanabilecegi guvenilir urunleri tercih eder.",
        "caresAbout": "Kalite, teknik ozellikler ve garanti",
        "focusArea": "features",
    },
    {
        "id": "yorumlara_bakan_kullanici",
        "name": "Zeynep",
        "age": 31,
        "city": "Izmir",
        "segment": "Yorumlara bakan kullanici",
        "profile": "Karar vermeden once diger alicilarin deneyimlerini dikkatle okur.",
        "caresAbout": "Yorumlar, puan ve sikayetler",
        "focusArea": "reviews",
    },
    {
        "id": "hizli_karar_veren",
        "name": "Burak",
        "age": 25,
        "city": "Bursa",
        "segment": "Hizli karar veren",
        "profile": "Urun bilgisi netse ve teslimat iyi gorunuyorsa hizli satin alir.",
        "caresAbout": "Kargo, baslik ve satin alma kolayligi",
        "focusArea": "shipping",
    },
    {
        "id": "tasarim_odakli_alici",
        "name": "Derya",
        "age": 39,
        "city": "Eskisehir",
        "segment": "Tasarim odakli alici",
        "profile": "Urunun gorunusu, sunumu ve marka algisi kararinda etkili olur.",
        "caresAbout": "Gorseller, marka algisi ve aciklama",
        "focusArea": "image",
    },
]

_SIMULATION_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}


class ReviewInput(BaseModel):
    author_name: str | None = None
    rating: int = 0
    title: str | None = None
    text: str
    verified_purchase: bool = False


class SimulateRequest(BaseModel):
    product_title: str
    category: str
    price: float
    description: str | None = None
    features: list[str] = []
    reviews: list[ReviewInput] = []


class PersonaResult(BaseModel):
    id: str
    name: str
    age: int
    city: str
    segment: str
    profile: str
    caresAbout: str
    decision: str
    reason: str
    lookedAt: list[str]
    recommendation: str
    monologue: str
    focusArea: str
    focusLabel: str
    bubbleText: str


class SimulateResponse(BaseModel):
    personas: list[PersonaResult]


# Gemini response schemas intentionally avoid strict Field constraints. Large
# constrained schemas can be rejected by Gemini structured output.
class _GeminiPersona(BaseModel):
    id: str
    name: str
    age: int
    city: str
    segment: str
    profile: str
    caresAbout: str
    decision: str
    reason: str
    lookedAt: list[str]
    recommendation: str
    monologue: str
    focusArea: str
    bubbleText: str


class _GeminiSimulation(BaseModel):
    personas: list[_GeminiPersona]
    seller_summary: str = ""


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key or api_key == "your_google_api_key_here":
        raise HTTPException(status_code=503, detail="GOOGLE_API_KEY tanimli degil.")
    return genai.Client(api_key=api_key)


def _sse(event: dict[str, Any]) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


def _cache_key(req: SimulateRequest) -> str:
    payload = {
        "product_title": req.product_title.strip().lower(),
        "category": req.category.strip().lower(),
        "price": round(req.price, 2),
        "description": (req.description or "").strip().lower()[:2000],
        "features": [item.strip().lower() for item in req.features[:30]],
        "reviews": [
            {
                "rating": review.rating,
                "title": (review.title or "").strip().lower()[:160],
                "text": review.text.strip().lower()[:500],
                "verified_purchase": review.verified_purchase,
            }
            for review in req.reviews[:12]
        ],
    }
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _get_cached_result(key: str) -> SimulateResponse | None:
    cached = _SIMULATION_CACHE.get(key)
    if not cached:
        return None
    created_at, result = cached
    if time.time() - created_at > SIMULATION_CACHE_TTL_SECONDS:
        _SIMULATION_CACHE.pop(key, None)
        return None
    return SimulateResponse.model_validate(result)


def _save_cached_result(key: str, result: SimulateResponse) -> None:
    if len(_SIMULATION_CACHE) >= SIMULATION_CACHE_MAX_ITEMS:
        oldest_key = min(_SIMULATION_CACHE.items(), key=lambda item: item[1][0])[0]
        _SIMULATION_CACHE.pop(oldest_key, None)
    _SIMULATION_CACHE[key] = (time.time(), result.model_dump())


def _safe_focus_area(value: str | None, used: set[str], fallback_index: int) -> str:
    area = (value or "").strip()
    if area not in FOCUS_AREAS:
        area = FOCUS_AREAS[fallback_index % len(FOCUS_AREAS)]
    if area in used:
        area = next((candidate for candidate in FOCUS_AREAS if candidate not in used), area)
    used.add(area)
    return area


def _safe_decision(value: str | None) -> str:
    decision = (value or "").strip().lower()
    return decision if decision in {"buy", "skip", "undecided"} else "undecided"


def _fallback_persona(index: int, req: SimulateRequest) -> PersonaResult:
    base = DEFAULT_SEGMENTS[index % len(DEFAULT_SEGMENTS)]
    focus_area = str(base["focusArea"])
    focus_label = FOCUS_LABELS.get(focus_area, FOCUS_LABELS["features"])
    return PersonaResult(
        id=str(base["id"]),
        name=str(base["name"]),
        age=int(base["age"]),
        city=str(base["city"]),
        segment=str(base["segment"]),
        profile=str(base["profile"]),
        caresAbout=str(base["caresAbout"]),
        decision="undecided",
        reason=f"{req.product_title} icin bilgi yeterli gorunuyor ama karar vermeden once detaylari netlestirmek ister.",
        lookedAt=[focus_label, "Fiyat", "Ozellikler"],
        recommendation="Urun aciklamasinda fiyat, garanti ve en guclu faydayi daha net goster.",
        monologue="Bilgiler fena degil ama biraz daha kanit gormek isterim.",
        focusArea=focus_area,
        focusLabel=focus_label,
        bubbleText=focus_label,
    )


def _normalize_simulation(raw: _GeminiSimulation, req: SimulateRequest) -> SimulateResponse:
    used_focus: set[str] = set()
    personas: list[PersonaResult] = []

    for index, item in enumerate(raw.personas[:5]):
        focus_area = _safe_focus_area(item.focusArea, used_focus, index)
        focus_label = FOCUS_LABELS.get(focus_area, FOCUS_LABELS["features"])
        looked_at = item.lookedAt[:5] if item.lookedAt else [focus_label]
        if looked_at[0] != focus_label:
            looked_at = [focus_label, *looked_at[:4]]

        personas.append(
            PersonaResult(
                id=(item.id or f"persona_{index + 1}").strip().replace(" ", "_")[:80],
                name=(item.name or DEFAULT_SEGMENTS[index]["name"])[:80],
                age=max(18, min(75, int(item.age or DEFAULT_SEGMENTS[index]["age"]))),
                city=(item.city or DEFAULT_SEGMENTS[index]["city"])[:80],
                segment=(item.segment or DEFAULT_SEGMENTS[index]["segment"])[:120],
                profile=(item.profile or DEFAULT_SEGMENTS[index]["profile"])[:280],
                caresAbout=(item.caresAbout or DEFAULT_SEGMENTS[index]["caresAbout"])[:180],
                decision=_safe_decision(item.decision),
                reason=(item.reason or "Urun bilgilerine gore kararsiz kaldi.")[:360],
                lookedAt=looked_at,
                recommendation=(item.recommendation or "Urun sayfasinda ana faydayi daha net anlat.")[:260],
                monologue=(item.monologue or "Biraz daha net bilgi gormek isterim.")[:220],
                focusArea=focus_area,
                focusLabel=focus_label,
                bubbleText=(item.bubbleText or focus_label)[:90],
            )
        )

    while len(personas) < 5:
        fallback = _fallback_persona(len(personas), req)
        fallback.focusArea = _safe_focus_area(fallback.focusArea, used_focus, len(personas))
        fallback.focusLabel = FOCUS_LABELS.get(fallback.focusArea, FOCUS_LABELS["features"])
        fallback.lookedAt = [fallback.focusLabel, "Fiyat", "Ozellikler"]
        personas.append(fallback)

    if req.reviews and all(persona.focusArea != "reviews" for persona in personas):
        review_persona = next(
            (
                persona for persona in personas
                if "yorum" in persona.reason.lower() or "yorum" in persona.recommendation.lower()
            ),
            personas[2],
        )
        review_persona.focusArea = "reviews"
        review_persona.focusLabel = FOCUS_LABELS["reviews"]
        review_persona.lookedAt = [review_persona.focusLabel, *review_persona.lookedAt[:4]]
        if "yorum" not in review_persona.reason.lower():
            review_persona.reason = (
                "Musteri yorumlarindaki memnuniyet ve tereddutleri okuyarak kararini netlestirmeye calisiyor. "
                + review_persona.reason
            )[:360]
        if "yorum" not in review_persona.recommendation.lower():
            review_persona.recommendation = (
                "Yorumlarda tekrar eden guclu faydalari ve sikayetleri urun sayfasinda ozetle."
            )

    if all(persona.decision == "buy" for persona in personas):
        cautious = next(
            (
                persona for persona in personas
                if persona.focusArea in {"price", "reviews", "warranty"}
            ),
            personas[-1],
        )
        cautious.decision = "undecided"
        cautious.reason = (
            f"{req.product_title} ilgisini cekti ancak fiyat, yorum veya garanti kaniti netlesmeden "
            "hemen satin alma kararini erteledi."
        )
        cautious.recommendation = (
            "Kararsiz kullanici icin yorum, garanti ve fiyat avantajini sayfada daha gorunur yap."
        )
        cautious.monologue = "Ilgimi cekti ama biraz daha kanit gormeliyim."

    return SimulateResponse(personas=personas)


def _simulation_prompt(req: SimulateRequest) -> str:
    features = "\n".join(f"- {item}" for item in req.features[:20]) or "- Ozellik verisi yok"
    description = (req.description or "Aciklama yok")[:1800]
    reviews = "\n".join(
        (
            f"- ({review.rating}/5"
            f"{', dogrulanmis satin alma' if review.verified_purchase else ''}) "
            f"{(review.title or 'Baslik yok')[:120]}: {review.text[:500]}"
        )
        for review in req.reviews[:12]
        if review.text.strip()
    ) or "- Yorum verisi yok"
    return f"""
Sen ZekAI seller studio icin maliyet-bilincine sahip bir e-ticaret musteri simulasyon ajanisin.
Tek gorevin, bu urun sayfasini inceleyen 5 farkli Turk musteri perspektifini tek JSON ciktisinda uretmek.

Urun:
- Baslik: {req.product_title}
- Kategori: {req.category}
- Fiyat: {req.price:.2f} TRY
- Aciklama: {description}
- Ozellikler:
{features}
- Musteri yorumlari:
{reviews}

Kurallar:
- Sadece bu tek urun sayfasi bilgisine dayan.
- Yorumlarda tekrar eden memnuniyetleri, sikayetleri ve tereddutleri karar gerekcelerine yansit.
- En az bir persona yorumlara veya puana bakarak karar versin.
- Eger yorumlarda eksik bilgi, kalite, beden/uyumluluk, garanti, ses, kargo veya fiyat endisesi varsa bunu saticiya oneride acikca soyle.
- 5 persona birbirinden farkli olmali.
- Her persona icin decision sadece buy, skip veya undecided olsun.
- focusArea sadece su degerlerden biri olsun: {", ".join(FOCUS_AREAS)}.
- 5 persona mumkun oldugunca farkli focusArea kullansin.
- lookedAt listesinin ilk elemani focusArea ile uyumlu olsun.
- recommendation saticiya tek cumlelik uygulanabilir oneridir.
- bubbleText en fazla 8 kelimelik kisa dusunce veya soru olsun.
- Son kullanici dili dogal olsun, rapor dili kullanma.
- Ayni urunde herkes satin almasin; en az 1 persona skip veya undecided olmali.
""".strip()


def _generate_simulation_with_model(
    client: genai.Client,
    req: SimulateRequest,
    model: str,
) -> SimulateResponse:
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=_GeminiSimulation,
        temperature=0.35,
    )
    response = client.models.generate_content(
        model=model,
        contents=_simulation_prompt(req),
        config=config,
    )
    raw = _GeminiSimulation.model_validate_json(response.text or "{}")
    return _normalize_simulation(raw, req)


def _run_simulation_sync(client: genai.Client, req: SimulateRequest) -> SimulateResponse:
    models = [MODEL]
    if FALLBACK_MODEL and FALLBACK_MODEL != MODEL:
        models.append(FALLBACK_MODEL)

    last_exc: Exception | None = None
    for index, model in enumerate(models):
        try:
            return _generate_simulation_with_model(client, req, model)
        except Exception as exc:
            last_exc = exc
            if index == len(models) - 1:
                break
            if not _is_retryable_gemini_error(exc) and not isinstance(exc, (ValidationError, json.JSONDecodeError)):
                break

    if last_exc:
        raise last_exc
    raise RuntimeError("Simulasyon modeli calistirilamadi.")


def _is_retryable_gemini_error(exc: BaseException) -> bool:
    if isinstance(exc, (asyncio.TimeoutError, TimeoutError)):
        return True
    if not isinstance(exc, genai_errors.APIError):
        return False
    code = getattr(exc, "status_code", None) or getattr(exc, "code", None)
    return code in (408, 429, 500, 502, 503, 504)


async def _simulate_once(req: SimulateRequest) -> tuple[SimulateResponse, bool]:
    key = _cache_key(req)
    cached = _get_cached_result(key)
    if cached:
        return cached, True

    client = _get_client()
    result = await asyncio.wait_for(
        asyncio.to_thread(_run_simulation_sync, client, req),
        timeout=SIMULATION_TIMEOUT_SECONDS,
    )
    _save_cached_result(key, result)
    return result, False


@router.post("/simulate-stream")
async def simulate_stream(req: SimulateRequest) -> StreamingResponse:
    async def generate():
        yield _sse({"type": "step", "message": "Urun sayfasi ve hedef alanlar hazirlaniyor..."})

        try:
            cached = _get_cached_result(_cache_key(req))
            if cached:
                result = cached
                yield _sse({"type": "step", "message": "Kayitli simulasyon bulundu, AI cagrisi yapilmadi."})
            else:
                yield _sse({"type": "step", "message": "Tek simulasyon ajani 5 musteri perspektifini uretiyor..."})
                result, _ = await _simulate_once(req)
                yield _sse({"type": "step", "message": "Karar motoru musteri tepkilerini siraliyor..."})

            yield _sse({"type": "step", "message": f"{len(result.personas)} profil hazir, sahne oynatiliyor..."})
            for persona in result.personas:
                await asyncio.sleep(0.15)
                yield _sse({"type": "persona", "persona": persona.model_dump()})
            yield _sse({"type": "done"})
        except (ValidationError, json.JSONDecodeError):
            yield _sse({"type": "error", "message": "Gemini beklenen simulasyon JSON'unu uretmedi. Lutfen tekrar deneyin."})
        except Exception as exc:
            msg = "Gemini gecici olarak yanit veremedi." if _is_retryable_gemini_error(exc) else "Musteri simulasyonu olusturulamadi."
            yield _sse({"type": "error", "message": f"{msg} {str(exc)[:120]}"})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(req: SimulateRequest):
    try:
        result, _ = await _simulate_once(req)
        return result
    except (ValidationError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=503, detail="Gemini beklenen simulasyon JSON'unu uretmedi.") from exc
    except Exception as exc:
        msg = "Gemini gecici olarak yanit veremedi." if _is_retryable_gemini_error(exc) else "Musteri simulasyonu olusturulamadi."
        raise HTTPException(status_code=503, detail=f"{msg} {str(exc)[:120]}") from exc
