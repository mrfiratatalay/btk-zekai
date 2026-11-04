# ZekAI documentation

In this folder I explain ZekAI in my own words and in detail: how the project was born during a hackathon week,
which problems we solved and how, and the reasoning behind every technical decision. I also wrote down what each
decision cost, because I think half of explaining a decision is being able to say what you gave up.

## Where to start

| Who are you? | Suggested order |
|---|---|
| First time here, no technical detail needed | [Story](01-story.md) → [Demo tour](02-demo-tour.md) |
| A developer curious about the architecture and the code | [Story](01-story.md) → [Architecture](03-architecture.md) → [AI pipeline](07-ai-pipeline.md) → [Problems I solved](11-problems-i-solved.md) |
| A quick review before an interview | [Problems I solved](11-problems-i-solved.md) → [Interview questions and limits](12-faq-and-limits.md) |
| Running the project on your own machine | [Running it and the API](10-running-and-api.md) |

## All documents

| # | Document | What's inside |
|---|---|---|
| 01 | [Story](01-story.md) | The HackAthon'26 week, team and roles, what I did after the competition, a before/after table |
| 02 | [Demo tour](02-demo-tour.md) | A five-minute, non-technical tour and how the demo differs from the real system |
| 03 | [Architecture](03-architecture.md) | Two products, three services, layers and the journey of a request |
| 04 | [Database](04-database.md) | Two separate databases, the schema, rules enforced in the database, migrations |
| 05 | [Domain rules](05-domain-rules.md) | Formulas for bundle discounts, orders, reviews, the decision engine, price fairness, return risk and kombins |
| 06 | [Security](06-security.md) | Two separate JWTs, the seller API key, secrets, the error format and known gaps |
| 07 | [AI pipeline](07-ai-pipeline.md) | Using Gemini with cost control: one call, a deterministic verdict, caching, fallback answers |
| 08 | [Frontend and design](08-frontend-and-design.md) | Two Next.js apps, state management, reading SSE, design language, mobile |
| 09 | [Deployment strategy](09-deployment-strategy.md) | A live demo without server costs: two channels and an in-browser demo layer |
| 10 | [Running it and the API](10-running-and-api.md) | Setup, environment variables and the API by example |
| 11 | [Problems I solved](11-problems-i-solved.md) | Twelve short stories: problem, solution, reasoning |
| 12 | [Interview questions and limits](12-faq-and-limits.md) | Likely interview questions, known limits and the roadmap |

## Good to know

- Code, class and variable names are in English; the interface is in Turkish. Whenever I mention a screen or a
  button, I give its Turkish label as it appears on screen together with a translation. The Turkish version of
  these documents is in [docs](../README.md).
- Links go straight to the relevant source file, so you can open the code behind a claim.
- I counted every number in these documents from the code. Some files we wrote during the hackathon week are well
  over 300 lines; I say so openly in [known limits](12-faq-and-limits.md#known-limits). The demo layer I added
  later and these documents all stay under 300 lines.
