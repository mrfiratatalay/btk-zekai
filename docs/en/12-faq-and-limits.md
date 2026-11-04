# Interview questions and limits

I wrote this page for a quick review before an interview. It collects the questions I might be asked with my short
answers, then the project's known limits and the order in which I would fix things next.

## Likely interview questions

### Architecture

**Is this a microservice architecture?**
Not exactly. There are two separate products (Akıllı Market and ZekAI) and an AI service that ZekAI uses. Each
product owns its own database, and they talk to each other only over HTTP. I split them for ownership, not for
scale: a marketplace and a seller tool that connects to it would be systems of two different companies in real
life. There is no message queue and no service discovery.
Details: [Architecture](03-architecture.md#why-two-separate-products).

**Why is the AI service in Python and the APIs in .NET?**
The Google GenAI SDK and ADK we use for Gemini are in Python. For business rules, identity and data we used .NET,
with EF Core migrations and type-safe DTOs. The browser never sees the AI service; everything goes through
`zekai-api`. The cost is two languages, two dependency chains and two kinds of Docker images.

**How do you keep the two services consistent?**
Today I rely on ordering: `zekai-api` writes its own record first, then calls `commerce-api`. If the second step
fails, the two sides can disagree for a while. The right fix is an outbox table with a background job that
retries, and endpoints that are safe to call more than once (idempotent). Details: [Database](04-database.md).

### AI

**Why didn't you leave the decision to the model?**
A model can answer the same question differently twice, and it does not give a reliable answer to "why?". The
model only produces scores and evidence; a pure function with explicit thresholds makes the decision. The same
scores always give the same verdict, and the reason on screen is the rule that produced it.
Details: [AI pipeline](07-ai-pipeline.md#1-the-model-scores-the-code-decides).

**Did quality drop when you went from seven agents to one call?**
I did not measure it systematically; I do not have an evaluation set. I made the decision on cost, latency and the
number of failure points: one call instead of seven, two when needed. The right approach would have been to build
a small evaluation set from real product and need pairs and compare both pipelines on it.

**How do you invalidate the cache?**
I don't; I derive the key from everything that changes the result. The analysis key includes the product's
fingerprint (price, stock, title, description, rating, review count). When the product changes, the key changes
and the old record simply stops being used. The cost is that tables grow, because no job cleans expired records.

**What happens when the Gemini quota runs out?**
The seller tools return a sample answer flagged with `_mock: true`, and the interface shows a yellow warning. The
buyer analysis never makes up a sample answer and ends with a clear error, because a made-up "go ahead" would
affect a purchase. A known gap: fallback answers can also be saved as drafts.

**Reviews go into the model; isn't prompt injection a risk?**
It is. Reviews are user content, and a review can contain instructions. Two things limit the risk: the model cannot
return anything but schema-bound JSON, and the code, not the model, makes the decision, so a malicious review can at
most affect the scores. Beyond that I have no dedicated defence. The first step would be to catch extreme scores and
warnings without evidence in code.

### Data and domain rules

**Can the bundle discount have rounding errors?**
Yes. The total discount is rounded, and then each product's share is rounded separately. In a bundle of two
products priced 100.10 TL each, a 5% discount is 10.01 TL; each share is 5.005 TL, and C#'s default rounding takes
both down to 5.00. The customer gets 10.00 TL off instead of 10.01. The fix is to give the leftover cent to the last
line. Code: [`CartService.UpsertBundleItem`](../../services/commerce-api/src/ZekAI.Infrastructure/Services/CartService.cs).

**What if two people buy the last item at the same time?**
Today both can; there is no concurrency control on stock deduction. I would consider two fixes: optimistic locking
with PostgreSQL's `xmin` row version, rejecting the losing order with `409`, or deducting stock in a single
`UPDATE ... WHERE Stock >= quantity` statement. Details: [Security](06-security.md#known-gaps).

**Why is the product ID a slug and not a GUID?**
The buyer pastes a product link into ZekAI, and the last segment of the link is enough to find the product, with no
extra search. The cost is that the slug stays the same even if the title changes.
Details: [Database](04-database.md#1-the-product-id-is-a-readable-slug).

### Security

**JWT and API key in the same header: is that safe?**
The token's shape makes the distinction: a token with a dot goes to the JWT handler, one without goes to the API
key handler. We generate the keys ourselves, so this is safe today. The real weakness is elsewhere: the keys are
stored in plain text in the database. Only a hash should be stored.
Details: [Security](06-security.md#store-connection-the-sellers-api-key).

**Why are tokens kept in `localStorage`?**
It was the shortest path at hackathon speed. An XSS hole could read them. The right way is an HttpOnly cookie and a
short-lived access token; this and the other gaps are in the table on the [Security](06-security.md#known-gaps)
page.

### Process

**How did you split the work in a team of two?**
I was the team captain. I wrote the architecture, the buyer side and Seller Studio's AI flows; Ayşe wrote the
seller panel layout, the bundle recommendation flow, the social content workspace and the Customer Voice module.
Ayşe's work arrived as eight pull requests; I reviewed and merged seven of them.
Details: [Story](01-story.md#who-did-what).

**You wrote part of the code with AI; how well do you know it?**
I wrote a significant part of the code together with AI (Claude Code), under rules I set myself. I decided the
architecture, what to leave to the model and the rules; the AI made the writing faster. While writing these
documents I checked every claim against the code again, and I did not hide the gaps I found.

**Why are there no tests? What would you test first?**
During the hackathon week we prioritised features and did not write tests; that is a gap. I would start with the
pure functions: the decision engine, price fairness, return risk and bundle pricing (including rounding). I would
run the same test cases against the TypeScript port in the demo as well, so the test breaks if the two drift apart.
Then integration tests against PostgreSQL: identity (JWT and API key), the cart and orders.

**What would you do differently if you started again?**
I would write tests for the rules from day one, read secrets only from environment variables and build an
evaluation set before cutting the pipeline from seven agents to one. I would also split the service classes before
they grew.

## Known limits

| Limit | Details |
|---|---|
| No tests | None of the rules is protected automatically. |
| Large files | Excluding migrations, 35 source files are over 300 lines. The largest are the seed data ([`DataSeeder.cs`](../../services/commerce-api/src/ZekAI.Infrastructure/Seeders/DataSeeder.cs), 1,506 lines), `zekai-api` [`SellerService`](../../services/zekai-api/src/ZekAI.Infrastructure/Services/SellerService.cs) (1,401), [`SellerDrafts.tsx`](../../apps/zekai-platform-web/src/components/seller-studio/SellerDrafts.tsx) (1,348) and `commerce-api` `SellerService` (1,089). |
| Security gaps | Plain-text secrets and keys, endpoints without role checks, no rate limiting; the twelve-row table is on the [Security](06-security.md#known-gaps) page. |
| Consistency across services | No shared transaction or outbox; if a publish stops halfway, the two sides can disagree for a while. |
| Fallbacks in the cache | Sample answers returned when the quota runs out can be saved as drafts; after Gemini recovers, the same request can bring the fallback back. |
| Fixed bonus in the bundle scorer | The `commerce-api` scorer adds +18/+20 to five product pairs so they stand out in the presentation, and the demo's port carries the same bonus. A shortcut that should not exist in a real store. |
| A missing cent in bundle discounts | Shares are rounded separately, so the total discount can be off by one cent. |
| ADK's dead path | The old seven-agent pipeline still lives in [`buyer_agent/agent.py`](../../services/ai-service/buyer_agent/agent.py) and can be called through `zekai-api`; the interface does not use it. |
| In-memory caches | The `ai-service` caches disappear when the service restarts and are not shared between instances. |
| Package versions | Both APIs target .NET 10, but `commerce-api` runs on EF Core 10 packages and `zekai-api` on EF Core 9. |
| Unused infrastructure | The Docker image and `init.sql` install pgvector, but no table uses vectors. |
| A silenced migration warning | `commerce-api` suppresses `PendingModelChangesWarning` at startup. |
| Demo limits | The rule-based advisor does not understand language; the two demo sites don't know about each other; the catalogue was generated from the seed once. Details: [Deployment strategy](09-deployment-strategy.md#the-cost). |
| Frontend debts | The SSE reading code is repeated in four files; there are unused dependencies and two lock files; the interface is Turkish only. Details: [Frontend and design](08-frontend-and-design.md#known-debts). |
| No measurements | We ran no load tests; I cannot give a measured number about performance. |

## Roadmap

In order of priority:

1. **Tests.** Table-driven unit tests for the decision engine, the scoring functions and bundle pricing, with the
   same cases run against the demo's TypeScript port.
2. **Quick security wins.** Read secrets only from the environment; store only hashes of refresh tokens and API
   keys; add role checks to `zekai-api`'s seller endpoints; rate-limit the AI endpoints; trigger storefront
   revalidation only from the server; turn off the ADK developer UI.
3. **Concurrency.** Optimistic locking on stock with `409` for the losing order; order numbers that cannot collide.
4. **Consistency.** An outbox with retries for publishing to the marketplace.
5. **Cleanup.** Remove the ADK path; keep fallback answers out of the draft cache; a job that cleans the cache
   tables; remove the fixed bonus from the bundle scorer; a single lock file.
6. **Restructuring.** Split `SellerService` and `SellerDrafts.tsx`; a shared SSE reader; RFC 9457 Problem Details and
   a global exception handler.
7. **The missing cent.** Give the leftover cent of a bundle discount to the last line.
