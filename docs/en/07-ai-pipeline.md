# AI pipeline: using Gemini under control

ZekAI's whole product is built on AI. That is why the most important engineering question in the project was not
"how do I call the model?" but "what do I leave to the model, and what do I not?". This page explains my answers.

## What runs on AI?

[`ai-service`](../../services/ai-service) exposes 12 endpoints; the default model is `gemini-2.5-flash-lite`.

| Endpoint | What it produces | Note |
|---|---|---|
| `/buyer/analyze` | Fit, confidence, price and return scores, evidence-backed warnings | SSE; a market check with Google Search when needed |
| `/buyer/kombin-analyze` | How several products work together | SSE |
| `/buyer/compare-verdict` | A winner among 2–3 analyses, with reasons | SSE |
| `/seller/ai-content` | Title, descriptions, feature bullets | Can take a simulation result as input |
| `/seller/simulate`, `/seller/simulate-stream` | Five customer profiles' decisions and reasons | The streaming version sends one person at a time; fallback model `gemini-2.5-flash` |
| `/seller/social-content` | Copy for Instagram, TikTok and X | |
| `/seller/ai-image`, `/seller/ai-images` | Studio, unboxing and in-use images | `gemini-3.1-flash-image-preview` |
| `/seller/bundle-recommend` | Semantic fit scores for complementary products | |
| `/seller/customer-voice` | Draft review replies and FAQ suggestions | |
| `/seller/seo` | Keyword and meta suggestions | The endpoint exists, but the interface does not use it |

## 1. The model scores, the code decides

**Problem.** A language model can answer the same question differently twice. The code shows this concern: the
scoring module's docstring says volatile scores such as price fairness and return risk are computed in code "so
that they give the same value when run again with the same input". I did not want to leave a purchase decision to
that volatility, and we also had to be able to explain the decision to the user.

**Solution.** I separated the jobs. Gemini only produces four scores (fit, confidence, price fairness, return risk)
along with evidence-backed warnings and strengths. The prompt says so explicitly: "Don't make the final decision;
produce scores, warnings and strong signals. The decision will be made in code." The verdict comes from a pure
function in [`decision_engine.py`](../../services/ai-service/buyer/decision_engine.py) with explicit thresholds,
and price fairness and return risk come from the formulas in
[`scoring_engine.py`](../../services/ai-service/buyer/scoring_engine.py), not from the model. The thresholds:
[Domain rules](05-domain-rules.md#buyer-verdict-the-decision-engine).

**Why.** The same scores always give the same verdict. The "Neden bu sonuç?" (why this result?) list on screen is
the rule that produced the verdict, not an invented explanation. And the rule engine can be tested independently
of the model.

**Cost.** I chose the thresholds from product intuition, not from data. Some subtle cases the model might catch
(for example, "the rating is low, but it is ideal for this user") get lost inside the rules.

## 2. Call only as much as needed

**Problem.** The first version of the buyer analysis was a seven-agent pipeline built with Google ADK: an agent
that understood the need, then four specialists running in parallel (product reality, review mining, price and
return risk), then synthesis and verification agents. The kombin analysis made five separate Gemini calls as
well. Every analysis meant seven calls: seven times the cost, the latency and the points of failure.

**Solution.** On the last day of the competition I rewrote both pipelines:

1. **Advisor:** evaluates the product, the need and up to 12 reviews in a single structured call.
2. **Market check:** a second call with Google Search, only if the advisor says `needs_market_check: true`. The
   prompt lists when that is needed: the user stated a firm budget, the price is critical, or a possibly better
   alternative would change the verdict.
3. **Decision engine:** code.

The kombin analysis went from five calls to one in the same way. Code:
[`buyer_router.py`](../../services/ai-service/buyer/buyer_router.py),
[`kombin_router.py`](../../services/ai-service/buyer/kombin_router.py).

**Cost.** Each specialist agent could look deeper into its own topic; a single advisor is more general. The ADK
definitions still live in [`buyer_agent/agent.py`](../../services/ai-service/buyer_agent/agent.py) and can still
be called through `zekai-api`, but the interface no longer uses them. Removing that dead path is on my roadmap.

## 3. Structured output, limits in both directions

- Every call uses `response_mime_type="application/json"` and a Pydantic schema; the model cannot return free
  text. Scores are `0-100`, warnings at most 5, alternatives at most 2, and texts are length-limited.
- If the model returns an answer that does not fit the schema, the user gets a clear error ("Gemini did not
  produce the expected JSON report"). A half-finished report is never shown.
- The input is capped too: at most 25 reviews, 2,000 characters per review, a 5,000-character description. A long
  list of reviews cannot inflate the bill or the latency.
- `temperature` is 0.2. The market prompt also contains the rule "the source URL may be empty, but do not invent
  a URL".

## Caching: never pay twice for the same question

Every expensive output is stored with a hash of its input. When the same input comes again, Gemini is not called.

| Output | Cache key | Where | Lifetime |
|---|---|---|---|
| Product analysis | SHA-256(user, product, normalised need, product fingerprint) | `zekai_db.AnalysisCaches` | 7 days |
| Content, social, SEO, simulation | Product signature and a hash of the request (`InputHash`) | Draft and output tables | Until archived |
| Bundle recommendation | A hash of the seller's product list | `BundleRecommendationCaches` | 7 days |
| Simulation, kombin, images | A hash of the request | `ai-service` memory | 24 hours, 128–256 entries |

The **product fingerprint** in the analysis key includes the price, stock, title, description, rating and review
count. When the seller changes the price or a new review arrives, the key changes on its own; no separate "clear
the cache" code is needed. Code: [`BuyerService`](../../services/zekai-api/src/ZekAI.Infrastructure/Services/BuyerService.cs).

**Cost.** In-memory caches disappear when the service restarts and are not shared between instances. No job cleans
the cache tables in the database, so expired records pile up.

## Errors, quotas and fallback answers

- **No key:** the AI endpoints return `503` with the message "GOOGLE_API_KEY is not set".
- **Quota or transient errors** (`429`, `500`, `502`, `503`, `504`, timeouts): the seller tools return a sample
  answer and flag it with `_mock: true`. The interface sees the flag and shows a yellow warning ("Demo mode: AI
  capacity is temporarily full. This analysis is not real Gemini data."). The user never mistakes a sample answer
  for a real one.
- **The buyer analysis never makes up a fallback.** Because the verdict affects a purchase, if Gemini cannot answer,
  the stream ends with a clear error event. If the market check fails, the analysis continues with the data it has
  and says so in the stream.

A known gap: fallback answers are also saved as drafts under the same input hash (with their source marked as
`mock`). Because the cache lookup does not look at the source, the same request can bring the fallback back even
after Gemini recovers. The bundle recommendation cache already excludes fallbacks; drafts should do the same.

## Live streaming (SSE)

An analysis can involve two model calls, each with a 45-second timeout. Instead of leaving the user in front of an
empty screen, we send an event whenever a step finishes: `buyer_advisor`, `market_check`, `decision`.

- **Why SSE?** The stream is one-way, so a two-way WebSocket connection is unnecessary. It is plain HTTP, so it
  passes through proxies; the `X-Accel-Buffering: no` header turns off buffering in intermediate layers.
- **Proxy:** `zekai-api` opens the response with `ResponseHeadersRead` and relays it to the browser line by line,
  catching the `final_rapor` (final report) event on the way and writing it to the cache. The browser never sees
  the AI service.
- **Reading:** the interface uses `fetch` with a `ReadableStream` instead of `EventSource`, because the request is
  a `POST` with a body and an `Authorization` header.

**Cost.** There is no automatic reconnection; if the connection drops, the analysis starts over (or comes back
from the cache if a completed result exists). Long-lived connections can also run into the timeouts of free
hosting tiers.

## Customer simulation

There are five fixed profiles: budget-minded, quality-seeking, review-reading, quick-deciding and design-focused.
Each profile has a "focus area" it cares about (price, features, reviews, shipping, photos). For each profile the
model produces a decision, a reason, the areas it looked at, a suggestion for the seller and a short inner voice;
the interface animates this by highlighting that part of the product card. The simulation result can feed into
the **İçerik Düzenle** (edit content) screen: "Simülasyona göre AI ile düzenle" (edit with AI based on the
simulation) asks for content that answers the reasons the lost customers gave.

## AI in the in-browser demo

The live demo has no Gemini. Instead, a [rule-based advisor](../../apps/zekai-platform-web/src/demo/engine-buyer.ts)
runs: it finds the topics in the need (microphone, battery, size, assembly and so on) from a fixed list, splits
reviews into clauses separated by "ama/ancak" (but/however) and decides whether each clause is positive or
negative with simple cues. Every warning quotes the review sentence it came from. The decision engine, price
fairness, return risk, kombin and bundle scoring, on the other hand, are a
[TypeScript port](../../apps/zekai-platform-web/src/demo/engine-decision.ts) of the production code, so the demo's
verdicts come from the same rules as the real system. This engine does not understand language the way Gemini
does; I list its limits in [Interview questions and limits](12-faq-and-limits.md).
