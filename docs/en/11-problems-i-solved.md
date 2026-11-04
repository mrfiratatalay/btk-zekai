# Problems I solved

This page collects the most instructive problems in the project as short stories. For each one I describe the
problem first, then the solution and why I chose it. The details are in the related documents and in the code.

## 1. Writing a store before connecting to one

**Problem.** ZekAI's real value is reading and improving a seller's products. In the first prototype the "store"
was a fake data layer inside ZekAI; what we showed as an integration was really a function call.

**Solution.** I split the store into an independent product with its own database and identity system, Akıllı
Market. ZekAI connects to it only over HTTP, with the seller's API key.

**Why this way.** A real seller tool cannot see a marketplace's database; it connects to its API. The split made us
face real integration questions early: how is a key issued, how is a connection revoked, how do both sides stay
consistent? The cost is two identity systems and two databases.
Details: [Architecture](03-architecture.md#why-two-separate-products).

## 2. Two kinds of identity in one header

**Problem.** Two kinds of clients call `commerce-api`: Akıllı Market's own frontend (with a user JWT) and ZekAI
(with the seller's API key). Both use the `Authorization: Bearer ...` header.

**Solution.** A "policy scheme" looks at the shape of the token: if it contains a dot it is sent to the JWT
handler, otherwise to the API key handler. A request with a key is processed with that seller's identity and the
`Seller` role, so the controllers never have to tell the two paths apart.
Code: [`Program.cs`](../../services/commerce-api/src/ZekAI.Api/Program.cs),
[`ApiKeyAuthHandler`](../../services/commerce-api/src/ZekAI.Api/Auth/ApiKeyAuthHandler.cs).

**Why this way.** A separate header (`X-Api-Key`) would have worked too. Keeping it in the same header let ZekAI call
the marketplace like any other seller and required no change in the seller controllers. The cost is that the
distinction depends on the token's shape: if a key with a dot were ever issued, it would take the wrong path. We
generate the keys ourselves (`am_live_` and a GUID), so today this is safe.

## 3. From seven agents to one call

**Problem.** The first version of the buyer analysis was a seven-agent pipeline built with Google ADK, and the
kombin analysis made five separate Gemini calls. Every analysis carried the cost, latency and failure risk of
seven calls.

**Solution.** On the last day of the competition I rewrote both pipelines: a single structured "advisor" call, a
market check with Google Search only if the advisor asks for it, and a verdict made in code at the end. The kombin
analysis went from five calls to one.

**Why this way.** All the specialist agents were looking at the same input (product, reviews, need); one structured
call can fill the same fields in a single pass. The cost is losing specialists that each looked deeper into one
topic. Details: [AI pipeline](07-ai-pipeline.md#2-call-only-as-much-as-needed).

## 4. Not leaving the purchase decision to the model

**Problem.** A model can answer the same question differently twice, and it does not give a reliable answer to
"why?".

**Solution.** The model only produces scores and evidence; the "Alabilirsin / Dikkatli İlerle / Alternatife Bak"
(go ahead / proceed with care / look for an alternative) verdict comes from a pure function with explicit
thresholds. The "why this result?" list on screen is the set of rules that produced the verdict.
Code: [`decision_engine.py`](../../services/ai-service/buyer/decision_engine.py).

**Why this way.** The same scores always give the same verdict, and the rule engine can be tested without the
model. The cost is that the thresholds were chosen by intuition, not from data.

## 5. Never paying twice for the same question

**Problem.** When a buyer opened the same product with the same need again, or a seller asked for content for the
same product again, Gemini was called again.

**Solution.** I store every expensive output with the SHA-256 hash of its input. The analysis key includes the
product's fingerprint: price, stock, title, description, rating and review count. When the product changes, the
key changes too; there is no separate cache-clearing code.
Code: [`BuyerService`](../../services/zekai-api/src/ZekAI.Infrastructure/Services/BuyerService.cs).

**Why this way.** Instead of asking "when should the cache be cleared?", I derived the key from everything that
changes the result. The cost is that cache tables nobody cleans keep growing.

## 6. Not fooling the user when the quota runs out

**Problem.** On Gemini's free tier the quota runs out quickly, or the model is temporarily unavailable. When that
happened, the seller screens could be left with a bare error.

**Solution.** On a quota or transient error, the seller tools return a sample answer but flag it with
`_mock: true`; the interface sees the flag and shows a yellow warning. The buyer analysis, on the other hand, never
makes up a sample answer and ends with a clear error.

**Why this way.** A seller seeing a sample title does no harm; a buyer seeing a made-up "go ahead" does. The cost is
that fallbacks can end up in the cache; I list that in [known limits](12-faq-and-limits.md#known-limits).

## 7. Showing a long AI answer without the wait

**Problem.** An analysis can involve two model calls. Waiting in front of an empty screen made the product look
broken.

**Solution.** The AI service sends a Server-Sent Event at every step. `zekai-api` relays the stream to the browser
line by line and catches the final report on the way to write it to the cache. Because the request needs a `POST`
body and an `Authorization` header, the browser reads a `ReadableStream` with `fetch` instead of using
`EventSource`.
Code: [`BuyerController.AnalyzeBuyer`](../../services/zekai-api/src/ZekAI.Api/Controllers/BuyerController.cs).

**Why this way.** The stream is one-way; WebSocket would have been unnecessary complexity. The cost is that a
dropped connection does not resume automatically.

## 8. Splitting a bundle discount to the last cent

**Problem.** In a "buy both, get 5% off" campaign, which product gets the discount? If it goes to one product, the
numbers break when that product is returned.

**Solution.** We split the discount between the two products in proportion to their prices, and every cart and
order line carries its own discount. In the cart a bundle is two linked lines that always have the same quantity;
removing one removes both. Only one active bundle can exist per product pair at a time, enforced by a partial
unique index that ignores archived bundles. Ayşe wrote the seller-side flow of bundles and its Gemini cache.
Formula and example: [Domain rules](05-domain-rules.md#bundle-discount-buy-together).

## 9. Taking a seller's change to the storefront instantly

**Problem.** On Akıllı Market's product page, reviews stay in Next.js's data cache for 30 seconds and the FAQ
section for 60. When a seller published a reply to a review or a new FAQ entry, a buyer could see the old page for
up to a minute.

**Solution.** After every product change, `commerce-api` calls Akıllı Market's `/api/revalidate` endpoint, and
Next.js regenerates the home page and that product's page. Ayşe's Customer Voice module uses the same path to bring
published review replies to the storefront instantly.
Code: [`revalidate/route.ts`](../../apps/akilli-market-web/src/app/api/revalidate/route.ts).

**Why this way.** Invalidating the cache at the moment of change, instead of turning caching off for those sections,
gives both a fast page and fresh data. The cost is that the revalidation secret is also embedded in the client
code ([Security](06-security.md#known-gaps)).

## 10. Moving a dead live demo into the browser

**Problem.** Six months after the competition the services on Render answered `503`; nobody could sign in on the
live site.

**Solution.** I gathered every network call of both frontends into a single `transport` function and, in the Vercel
build, connected it to a demo layer that fulfils the same contract in the browser. The rules are ports of the
production code, and the data is a catalogue generated from the seeder.
Details: [Deployment strategy](09-deployment-strategy.md).

**Why this way.** An always-on demo without renting a server, and without touching the real code. The cost is that
the rules live in two places.

## 11. The "but" problem in Turkish reviews

**Problem.** When I first wrote the demo's rule-based advisor, its analysis of a pair of headphones said "reviews are
positive about the microphone, with complaints about sound quality"; the truth was the opposite. The cause was this
review: "Müzik dinlemek için harika, ama online toplantılarda mikrofon biraz zayıf kalıyor." (Great for music, but
the microphone is a bit weak in online meetings.) Looking at the whole sentence mixed up two judgements, and the
"değil" (not) in "fena değil" (not bad) was counted as negative.

**Solution.** I split reviews into clauses at "ama, ancak, fakat" (but, however, yet) and count a clause as evidence
for a topic only if that clause mentions a single topic. I also corrected the list of cues by looking at real
reviews. The same day I found a second bug: for a "music and meetings" need, an office chair scored 54 for fit and
beat a pair of headphones. Now, if none of the need's topics appear in the product or its reviews, the fit is
capped at 35.
Code: [`engine-buyer.ts`](../../apps/zekai-platform-web/src/demo/engine-buyer.ts),
[`text.ts`](../../apps/zekai-platform-web/src/demo/text.ts).

**Why this way.** A rule-based engine does not understand language; you only see where it goes wrong when you test
it on real data. I found both bugs by reading the results while preparing the screenshots. The cost is that the
engine still cannot see irony or topics that are not on its list.

## 12. Fake figures on screen

**Problem.** While auditing the demo I noticed an inconsistency in the simulation preview: every product showed
"4.7 rating, 128 reviews, ships tomorrow, 2-year warranty", whatever its real rating and review count. They were
placeholder values written to fill the design during the competition week, but on screen they looked like real
data. The landing page was also still describing an eight-agent pipeline that no longer existed.

**Solution.** The preview now shows the product's own rating, review count, shipping text and the warranty from its
features; if the information is missing it says "Garanti bilgisi yok" (no warranty information). I aligned the
landing copy with the real pipeline and removed the footer links to pages that did not exist and the Google/Apple
sign-in buttons that did nothing. Then I scanned the interface for any other hard-coded figures.
Code: [`SellerSimulation.tsx`](../../apps/zekai-platform-web/src/components/seller-studio/SellerSimulation.tsx),
[`ZekaiLanding.tsx`](../../apps/zekai-platform-web/src/components/landing/ZekaiLanding.tsx).

**Why this way.** Those figures made the demo look fuller, but once someone looking at the project notices that one
of them is fake, they start doubting every other number on screen. That is why I set the rule "every number on
screen either comes from data or is not shown". The cost is that the preview looks plainer for products with few
reviews.
