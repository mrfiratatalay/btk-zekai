# Running it and the API

## Just trying the frontend (no backend needed)

When `NEXT_PUBLIC_DATA_MODE` is not set, the frontends run with the in-browser demo layer. Node.js 20 or later is
enough:

```bash
cd apps/zekai-platform-web
npm install
npm run dev -- --port 3001
```

`http://localhost:3001/login` shows the same one-click sign-in cards as the live demo.

## Running the real system

You need Docker, Node.js 20+ and, for the AI features, a [Google AI Studio](https://aistudio.google.com) key. The
system also starts without a key; only the AI endpoints answer `503`.

```bash
git clone https://github.com/mrfiratatalay/btk-zekai.git
cd btk-zekai
cp .env.example .env           # fill in GOOGLE_API_KEY
docker compose up --build      # PostgreSQL, commerce-api, zekai-api, ai-service
```

The frontends are not part of Docker Compose; start them in two terminals:

```bash
cd apps/akilli-market-web && cp .env.example .env.local && npm install && npm run dev
cd apps/zekai-platform-web && cp .env.example .env.local && npm install && npm run dev -- --port 3001
```

Both `.env.example` files contain `NEXT_PUBLIC_DATA_MODE=api`, which is why the frontends connect to the real
APIs. On Windows, [`scripts/start-docker.bat`](../../scripts/start-docker.bat) and
[`scripts/start-frontends.bat`](../../scripts/start-frontends.bat) do the same job; the second script also creates
the `.env.local` files and runs `npm install` when needed.

| Address | What's there |
|---|---|
| http://localhost:3000 | Akıllı Market |
| http://localhost:3001 | ZekAI |
| http://localhost:5001/swagger | `commerce-api` Swagger |
| http://localhost:5002/swagger | `zekai-api` Swagger |
| http://localhost:8000/health | The AI service's status and whether the key is set |

The APIs apply their migrations at startup and write sample data into an empty database.

## Accounts

| Product | Email | Password |
|---|---|---|
| Akıllı Market buyer | `burak@ornekstore.com` | `Buyer123!` |
| Akıllı Market seller (Mehmet Elektronik) | `mehmet@ornekstore.com` | `Seller123!` |
| ZekAI buyer | `buyer@zekai.com` | `Buyer123!` |
| ZekAI seller | `seller@zekai.com` | `Seller123!` |

In the real system the ZekAI seller's store is not connected on first start. On the **Ayarlar** (settings) screen,
choose Akıllı Market and enter Mehmet Elektronik's API key: `am_live_demo_mehmet_elektronik_2024`. The key is also
shown in Akıllı Market's seller panel.

## Environment variables

| Variable | Read by | Default |
|---|---|---|
| `GOOGLE_API_KEY` | `ai-service` | None; without it the AI endpoints answer `503` |
| `BUYER_ADVISOR_MODEL`, `KOMBIN_ADVISOR_MODEL`, `COMPARE_MODEL`, `SIMULATION_MODEL`, `GEMINI_CONTENT_MODEL`, `GEMINI_SOCIAL_MODEL`, `GEMINI_BUNDLE_MODEL`, `GEMINI_SEO_MODEL`, `GEMINI_CUSTOMER_VOICE_MODEL` | `ai-service` | `gemini-2.5-flash-lite` |
| `SIMULATION_FALLBACK_MODEL` | `ai-service` | `gemini-2.5-flash` |
| `BUYER_ADVISOR_TIMEOUT_SECONDS`, `BUYER_MARKET_TIMEOUT_SECONDS` | `ai-service` | 45 |
| `KOMBIN_CACHE_TTL_SECONDS`, `SIMULATION_CACHE_TTL_SECONDS`, `SELLER_IMAGE_CACHE_TTL_SECONDS` | `ai-service` | 86400 (24 hours) |
| `ConnectionStrings__Default`, `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpiryMinutes` | both APIs | In `docker-compose.yml` |
| `CommerceApi__BaseUrl`, `AiService__BaseUrl`, `AkilliMarket__BaseUrl` | `zekai-api` | In `docker-compose.yml` |
| `NEXT_PUBLIC_DATA_MODE` | both frontends | Unset: the in-browser demo; `api`: the real APIs |
| `NEXT_PUBLIC_COMMERCE_API_URL`, `NEXT_PUBLIC_ZEKAI_API_URL`, `NEXT_PUBLIC_COMMERCE_WEB_URL` | the frontends | `localhost` addresses |

## The API by example

**1. Sign in to the marketplace (JWT):**

```bash
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mehmet@ornekstore.com","password":"Seller123!"}'
# {"token":"eyJ...","refreshToken":"...","user":{"id":"...","email":"mehmet@ornekstore.com","fullName":"Mehmet Kaya","role":"Seller"}}
```

**2. The same seller's products, this time with the API key.** The token has no dot, so `commerce-api` validates it
as an API key rather than a JWT:

```bash
curl -s http://localhost:5001/api/seller/products \
  -H "Authorization: Bearer am_live_demo_mehmet_elektronik_2024"
```

**3. Sign in to ZekAI and connect the store:**

```bash
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"seller@zekai.com","password":"Seller123!"}' | jq -r .token)

curl -s -X POST http://localhost:5002/api/seller/connections \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"platform":"akilli-market","apiKey":"am_live_demo_mehmet_elektronik_2024"}'
# {"id":"...","platform":"akilli-market","storeName":"Mehmet Elektronik","status":"Connected","lastSyncAt":null,"productCount":12,"hasApiKey":true}
```

**4. A buyer analysis as a live stream.** `-N` turns off buffering, so events show up as they arrive. The need is
in Turkish ("for music and online meetings, my budget is 1,300 TL"):

```bash
BUYER=$(curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"buyer@zekai.com","password":"Buyer123!"}' | jq -r .token)

curl -N -X POST http://localhost:5002/api/buyer/analyze \
  -H "Authorization: Bearer $BUYER" -H "Content-Type: application/json" \
  -d '{"productId":"bluetooth-kulaklik-pro-x1","buyerNeed":"Müzik ve online toplantı için, bütçem 1.300 TL"}'
# data: {"author":"buyer_advisor","content":{"parts":[{"text":"Urun ve ihtiyac birlikte degerlendiriliyor..."}]}}
# data: {"author":"buyer_advisor","actions":{"state_delta":{"advisor_raporu":{"fit_score":...}}}}
# ...
# data: {"author":"decision","actions":{"state_delta":{"final_rapor":{"verdict":{"level":"consider",...}}}}}
```

Send the same request a second time and the first event is `"author":"cache"`; Gemini is not called.

**5. The error format:**

```bash
curl -s -X POST http://localhost:5002/api/buyer/analyze \
  -H "Authorization: Bearer $BUYER" -H "Content-Type: application/json" -d '{"productId":"","buyerNeed":""}'
# HTTP 400
# {"message":"productId ve buyerNeed zorunludur."}
```

Error bodies consist of a single `message` field (in Turkish; here, "productId and buyerNeed are required"). We do
not use RFC 9457 Problem Details, and some `404`s (for example, a product that does not exist) come back without a
body. Details: [Security](06-security.md#error-contract).

## Common situations

| Situation | Cause and fix |
|---|---|
| AI screens say "GOOGLE_API_KEY tanımlı değil" (not set) | Put the key in the `.env` file at the repository root and recreate the service with `docker compose up -d --force-recreate ai-service` |
| A yellow "AI kapasitesi geçici olarak doldu" (AI capacity temporarily full) warning | The Gemini quota is used up and the content shown is sample data. Try again later |
| The frontend shows the sign-in cards but not the real data | `.env.local` does not contain `NEXT_PUBLIC_DATA_MODE=api`, so it started in demo mode |
| Resetting the database | `docker compose down -v`, then `docker compose up --build` again |
