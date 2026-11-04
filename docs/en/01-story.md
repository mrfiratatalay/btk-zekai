# Story: a hackathon week, then a showcase

## The competition

We built ZekAI for **HackAthon'26**, a joint event by BTK Akademi, Google and Girişimcilik Vakfı (the
Entrepreneurship Foundation). The theme was an AI application for e-commerce. My teammate **Ayşe Mandıralı** and I
were a team of two, and **I was the team captain**. We did not place; this repository is the system we wrote that
week.

The repository was created on 12 May 2026, and the real work happened in the six days from 14 to 19 May. By the
end of the competition the git history had 75 commits: 60 mine and 15 Ayşe's. Ayşe's work arrived as eight pull
requests; I reviewed and merged seven of them.

## The idea

Both sides of e-commerce ask the same question: **"Will this product actually work?"**

- The **buyer** cannot check, one by one, whether a product fits their need, whether the price is fair and what
  the reviews really say. The result is regret and returns.
- The **seller** does not know why a visitor leaves without buying. Is the title weak, is the price too high, or
  are the reviews left unanswered?

ZekAI supports both sides with AI. A buyer pastes a product link and describes their need in their own words;
ZekAI weighs the product, the reviews and the price together and answers "Alabilirsin" (go ahead), "Dikkatli
İlerle" (proceed with care) or "Alternatife Bak" (look for an alternative). A seller connects their store, has five
different customer profiles "walk through" a product page, regenerates its content, images and social media copy,
builds bundles to sell together and gets draft replies to reviews.

To show an integration we needed a store to integrate with, so we wrote a second product: **Akıllı Market**, a
small marketplace in the spirit of Trendyol or Hepsiburada. It has its own database, its own users and its own
seller panel. ZekAI connects to it from the outside, using an API key the seller gets from the marketplace, the way
a real SaaS product connects to a marketplace. Details: [Architecture](03-architecture.md).

## How the week went

| Day | What happened (from the commit messages) |
|---|---|
| 14 May | First market prototype; buyer analysis and alternatives; Ayşe's seller panel layout |
| 15 May | Separate frontends for ZekAI and the market; the buyer decision centre; Seller Studio with AI editing and simulation |
| 16 May | The market became an independent e-commerce service; `commerce-api` and `zekai-api` split apart and Docker Compose arrived; I cut the returns module from scope; AI requests started going through `zekai-api` |
| 17 May | Social media content generator; landing page and dark theme |
| 18 May | Deployment to Vercel and Render; mobile layouts for every screen; fallback answers and error passthrough for Gemini failures; full-screen customer simulation |
| 19 May | From Ayşe: bundle recommendations, the social content workspace and Customer Voice. From me: fewer Gemini calls in buyer analysis and kombins, the comparison verdict and drafts stored in the database |

## Who did what

Checked against the git history:

- **Me (Fırat Atalay, team captain):** I split the system into two products and three services; wrote the buyer
  side (product analysis, the decision centre, comparison, kombins) and Seller Studio's AI editing, image
  generation, simulation and draft flows; made the changes that cut Gemini costs; set up the Vercel and Render
  deployment; and reviewed and merged the pull requests.
- **Ayşe Mandıralı:** wrote the seller panel's side menu and layout, the Windows start scripts, the bundle
  recommendation flow and its Gemini cache, the social content workspace and the Customer Voice module. She also
  prepared the first documents for the competition submission.

I wrote a significant part of the code together with AI (Claude Code), under rules I set myself.

## After the competition

Six months have passed since the competition. The frontends were still up on Vercel, but the three services
behind them ran on Render's free tier; they had gone to sleep and the database had expired. Anyone looking at the
project could not get past the login screen. When I put this repository in my portfolio, I did four things:

1. **I built a demo that runs in the browser.** Both frontends now run without a backend, in the browser, behind
   the same API contract. Every role signs in with one click and no password. Details:
   [Deployment strategy](09-deployment-strategy.md).
2. **I removed what was not true on screen.** The landing page still said "8 agents", although on the last day
   of the competition I had cut the pipeline down to a single Gemini call and a deterministic decision engine. The
   simulation preview showed a fixed "4.7 rating, 128 reviews, ships tomorrow" for every product. The login page
   had Google and Apple buttons that did nothing. I fixed or removed all of them.
3. **I cleaned up the repository.** I removed template leftovers, tracked build artefacts and files nothing used.
4. **I wrote these documents.** The competition documents described that week, and some of their claims had
   fallen behind the code. For example, they said the store connection was stored "encrypted"; there is no
   encryption in the code. In this version I checked every claim against the code and did not hide the gaps.

## Rules I set for myself

- **No made-up data.** Every number on screen is either computed from data or not shown at all.
- **The demo does not change the real system.** The demo layer only steps in at the transport layer; it is not
  even bundled into the real API build.
- **Gaps are written down honestly.** There are no tests, some service files are very large and some secrets are
  plain text. I listed them one by one in [Security](06-security.md) and [Limits](12-faq-and-limits.md).

## Before and after

| | End of the competition (May 2026) | Today |
|---|---|---|
| **Live demo** | The frontends depend on services on Render; once they sleep, nobody can sign in | A demo that runs in the browser; every role with one click |
| **Landing copy** | "8 AI agents" | The real pipeline: advisor → market check if needed → decision engine |
| **Simulation preview** | A fixed 4.7 rating and 128 reviews on every product | The product's own rating, review count, shipping and warranty |
| **Login page** | Google/Apple buttons that did nothing | A one-click sign-in card for each role |
| **Repository** | Template files, `tsbuildinfo`, unused types | Clean; only working code |
| **Documents** | The competition submission; some claims out of date | 12 documents checked against the code, in Turkish and English |
