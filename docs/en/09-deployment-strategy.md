# Deployment strategy: an always-on demo without paying for servers

## The problem

During the competition week we deployed the system like this:

| Part | Where |
|---|---|
| The two Next.js frontends | Vercel |
| `commerce-api`, `zekai-api`, `ai-service` | Render, free tier (Frankfurt) |
| PostgreSQL | Render, free tier |

The free tier has two problems: an idle service goes to sleep and the first request takes a long time, and the free
database has a limited lifetime. Six months later the frontends were still up, but all three services answered
`503`. A recruiter looking at my project got stuck on the login screen. Keeping three services and a database up
all year would also be an unnecessary expense for a new graduate.

## Two channels

I decided to present the project to two kinds of reader in two different ways:

| Channel | For whom | What |
|---|---|---|
| **Live demo** | Recruiters and anyone who wants a quick look | A one-click demo on Vercel that runs in the browser |
| **Code and the real system** | Developers | The code on GitHub, these documents, one Docker command and a short video of the real system running |

## How the demo works

In both frontends every network call goes through a single function:

```ts
export async function transport(input: string, init?: RequestInit): Promise<Response> {
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "api") {
    const { demoFetch } = await import("@/demo/handler");
    return demoFetch(input, init);
  }
  return fetch(input, init);
}
```

- A build with `NEXT_PUBLIC_DATA_MODE=api` calls the real APIs. The condition is fixed at build time, so the demo
  code is not bundled into that build at all.
- Every other build (Vercel) hands the request to
  [`demoFetch`](../../apps/zekai-platform-web/src/demo/handler.ts). `demoFetch` takes the same URL and the same
  `RequestInit` and returns a real `Response`: the same status codes, the same `{ message }` error body, the same
  JSON fields. The API client's error handling, token refresh on 401 and 204 handling run through the same lines
  in both modes.
- For SSE endpoints, the demo returns a `ReadableStream` with timed events flowing through it. The SSE reader in
  the interface does not know it is a demo, and it honours the cancel signal (`AbortSignal`) too.

| | Akıllı Market demo | ZekAI demo |
|---|---|---|
| Folder | [`src/demo`](../../apps/akilli-market-web/src/demo) | [`src/demo`](../../apps/zekai-platform-web/src/demo) |
| API it fulfils | `commerce-api` | `zekai-api` and the `commerce-api` paths the frontend calls directly |
| Sign-in cards | Buyer (Burak), seller (Mehmet) | Seller (Mehmet, with his connected store), buyer (Burak, with his records) |
| Code | 1,253 lines | 2,350 lines |

### Data

- Products, reviews and stores come from a JSON file generated from `commerce-api`'s
  [`DataSeeder`](../../services/commerce-api/src/ZekAI.Infrastructure/Seeders/DataSeeder.cs): 48 products, 204
  reviews, 8 stores. The demo and the real system show the same catalogue.
- Dates are not fixed; they are calculated relative to the day the demo is first opened: reviews "12 days ago", an
  order "2 days ago". The demo never looks stale.
- The demo data lives in the browser's `localStorage`. A write request works on a copy of the data and is saved only
  if the request succeeds; just like a transaction in the real API, a failed order does not reduce stock.
- The **Demoyu sıfırla** (reset the demo) button deletes the demo data and the session and goes back to the seed.

### Rules

The demo's rules are not invented; they are ports of the production code:

| Rule | Source |
|---|---|
| Decision engine, price fairness, return risk | [`decision_engine.py`](../../services/ai-service/buyer/decision_engine.py), [`scoring_engine.py`](../../services/ai-service/buyer/scoring_engine.py) |
| Kombin budget balance, overall score, purchase order | [`kombin_router.py`](../../services/ai-service/buyer/kombin_router.py) |
| Bundle pricing, cart, orders, review rules | `commerce-api` services |
| Bundle recommendation scoring | The deterministic scorer in `commerce-api` |
| Cache key (user, product, need, fingerprint) | `zekai-api` `BuyerService` |

The advisor that stands in for the AI is rule-based: it matches the topics in the need with review sentences and
quotes the source review in every warning. Details: [AI pipeline](07-ai-pipeline.md#ai-in-the-in-browser-demo).

## Saying "demo" on screen

- Every page of Akıllı Market has a banner at the top ("Canlı demo. Değişiklikler yalnızca bu tarayıcıda
  saklanır; gerçek ödeme ya da kargo yoktur.", meaning changes are kept only in this browser and there is no real
  payment or shipping) and a **Demoyu sıfırla** button.
- Every ZekAI screen has a **Canlı demo** badge in the corner; on wide screens it also explains that the data is in
  this browser and that the AI answers come from a rule-based demo engine.
- While building the demo I also fixed things that were wrong in both modes: the "8 agents" landing copy, the
  fixed "4.7 rating, 128 reviews" in the simulation preview and the Google/Apple sign-in buttons that did nothing.

## Vercel

- Two Vercel projects (`akilli-market`, `zekai`) are connected to this repository; every push to `main` redeploys
  both sites, and pull requests get preview deployments.
- `NEXT_PUBLIC_DATA_MODE` is not set in the projects, so the Vercel build comes out in demo mode. Nothing in Vercel
  had to change.

## The real system

Docker is all the real system needs: `docker compose up --build` starts PostgreSQL, both APIs and the AI service,
and the frontends run with `npm run dev` and `NEXT_PUBLIC_DATA_MODE=api`. The steps:
[Running it and the API](10-running-and-api.md).

## The cost

- **Two sources of truth.** The business rules live both in the real code and in the demo's port. If the real code
  changes and the port is not updated, the two modes behave differently. To reduce that risk, every port names the
  source file it was taken from.
- **The demo's AI is not real.** The rule-based advisor does not understand language; it cannot see a topic that is
  not on its list, or irony.
- **The two sites don't know about each other.** In the real system, content published from ZekAI shows up on Akıllı
  Market instantly; in the demo the two sites live at different addresses with separate browser storage, so that
  link does not exist.
- **The catalogue was generated once.** I produced the JSON from the seeder with a one-off converter and did not put
  the converter in the repository; if the seed changes, the catalogue has to be regenerated.
- **More code.** About 3,600 lines of demo code were added across the two apps; every file stays under 300 lines.
