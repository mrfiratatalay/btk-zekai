# Frontend and design

## Two apps, one foundation

| | Akıllı Market | ZekAI |
|---|---|---|
| Folder | [`apps/akilli-market-web`](../../apps/akilli-market-web) | [`apps/zekai-platform-web`](../../apps/zekai-platform-web) |
| Pages | 11 | 23 |
| Framework | Next.js 16 (App Router), React 19, strict TypeScript | The same |
| Styling | Tailwind CSS 4, shadcn/ui (Radix), lucide icons | The same, plus Framer Motion |
| State | Zustand: cart and favourites | Zustand: the buyer's records; TanStack Query: some of the seller screens |
| Special | Product pages are rendered on the server and regenerated when a seller changes something | The analysis flow with React Flow, the kombin figure with three.js |
| Theme | Light | Light and dark (`next-themes`) |

We kept the two apps separate because they represent two separate products; there is no shared package. The cost
is that some components and the API client are written twice, once in each app.

## Screens don't know the data layer

Screens call functions under `lib/api` (`getProduct`, `generateAiContent`, `runBuyerAgentStream` and so on). Those
functions make every network call from a single place:
[`transport.ts`](../../apps/zekai-platform-web/src/lib/api/transport.ts). In the real API build this is `fetch`; in
the demo on Vercel it is the demo layer in the browser. Error handling, token refresh on 401 and the SSE reader run
the same way in both modes; I did not touch any screen's data code while building the demo.

The one exception is the Akıllı Market product page: in real mode it is rendered on the server, but since the demo
data lives in the browser, the demo fills the same view component
([`ProductPageView`](../../apps/akilli-market-web/src/components/shop/ProductPageView.tsx)) in the browser.

## Server state and caching

- **Akıllı Market storefront:** product pages are rendered on the server with fresh data on every request; sections
  that rarely change, such as the FAQ, stay in the cache for 60 seconds. When a seller changes a product,
  `commerce-api` calls the [`/api/revalidate`](../../apps/akilli-market-web/src/app/api/revalidate/route.ts)
  endpoint, and `revalidatePath` refreshes the home page and that product's page. Ayşe's Customer Voice module
  uses the same path to bring a seller's published review reply to the storefront instantly.
- **Cart:** the Zustand store mirrors the cart on the server. When the quantity goes up, the interface updates
  itself first and then merges the line returned by the server.
- **ZekAI buyer data:** saved analyses, decision rooms and kombins live in Zustand stores; the source of truth is
  always the API. The comparison queue deliberately lives only in memory and empties on a page reload.
- **Completed analyses:** the interface also keeps a finished analysis in `localStorage`, so going back to the same
  page shows the result without replaying the flow.

## Showing the live stream

The analysis, kombin, comparison and simulation answers arrive piece by piece over SSE. The interface opens a
`ReadableStream` with `fetch`, reads the lines, parses each `data:` line as JSON and completes the matching step.

- **Analysis:** [`AnalysisLoadingView`](../../apps/zekai-platform-web/src/components/platform/AnalysisLoadingView.tsx)
  draws the advisor → market check → decision nodes with React Flow; a node completes only when its own result
  arrives, and there is no fake progress bar. After the final report arrives, the result screen opens 8 seconds
  later so the flow can be seen.
- **Simulation:** as each customer arrives, the part of the product card they are looking at (price, reviews,
  shipping…) is highlighted and their inner voice appears as a speech bubble.
- **Kombin:** products are placed on a 3D figure (head, wrist, feet and so on), and the scores update live while
  the stream runs.

This reading code is repeated in four files; moving it into a shared helper is on my roadmap.

## Design language

| | Akıllı Market | ZekAI |
|---|---|---|
| Accent colour | Orange `#FF6000` | Lime `#C1F25D` (`#ADFF41` in the dark theme) |
| Typeface | The system font | Plus Jakarta Sans |
| Character | A familiar marketplace: a dense product grid and prominent prices | A calm workspace: generous spacing, rounded cards, a single accent colour |

The verdict badges use both colour and text: green "Alabilirsin", yellow "Dikkatli İlerle", red "Alternatife Bak".
For colour-blind users, the meaning stays in the text.

## Mobile

On 18 May I made a mobile pass over every screen. On a phone, Seller Studio uses a fixed tab bar at the bottom
instead of the side menu, and the landing page and the market collapse into a single column. On phones the demo
badge shrinks into a small button so that it does not cover the screens' own bottom buttons.

## Accessibility

Radix-based components bring keyboard and screen reader support with them, and some icon buttons have an
`aria-label`. Beyond that we did not run a systematic accessibility audit; contrast and focus order checks are on
my roadmap.

## Known debts

- Some components are very large:
  [`SellerDrafts.tsx`](../../apps/zekai-platform-web/src/components/seller-studio/SellerDrafts.tsx) is 1,348 lines
  and `SellerSimulation.tsx` 750 lines. They grew at hackathon speed.
- `zekai-platform-web` has two lock files: Vercel uses `pnpm-lock.yaml`, the Docker image `package-lock.json`. They
  drift apart easily; that is why `package-lock.json` was out of sync until I fixed it.
- `recharts` and `react-hook-form` are listed as dependencies but not used in any file.
- The frontend Dockerfiles run the development server (`npm run dev`), not a production build.
- The interface is Turkish only; there is no multi-language support.
