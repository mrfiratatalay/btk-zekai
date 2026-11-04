# Domain rules

This page collects when the system allows what, and how the scores are calculated. The formulas come from the
code; I worked out the numbers in the example tables by hand with the same formulas.

## Bundle discount (buy together)

A seller can sell a main product together with a complementary product as a bundle. The discount is calculated on
the bundle total and split between the two products **in proportion to their prices**:

```text
discount          = round(total × percent / 100, 2)
product's share   = round(discount × product price / total, 2)
price in bundle   = product price − product's share
```

Example: the "Günlük Teknoloji Paketi" (everyday tech bundle) from the seed data, 5% off.

| Product | Price | Discount share | Price in the bundle |
|---|---|---|---|
| Premium Bluetooth Kulaklık (headphones) | 1,015.00 | 50.75 | 964.25 |
| MagSafe-compatible phone case | 399.00 | 19.95 | 379.05 |
| **Total** | **1,414.00** | **70.70** | **1,343.30** |

**Why proportional?** If the whole discount were written to one product, it would be unclear how much to refund
when that product is returned. Because every cart and order line carries its own discount, line-level refunds and
reporting stay correct. Code:
[`CartService.UpsertBundleItem`](../../services/commerce-api/src/ZekAI.Infrastructure/Services/CartService.cs),
[`BuyerService.AddBundleOrderItem`](../../services/commerce-api/src/ZekAI.Infrastructure/Services/BuyerService.cs).

Rules:

- The discount percentage must be between 0 and 50.
- When a bundle is published, both products must be in stock; the storefront only shows published bundles whose
  two products are both listed and in stock.
- Only one active bundle can exist per product pair at a time (the partial unique index in the database).
- In the cart a bundle is two lines that always carry the same quantity. Removing one line removes the other, and
  bundle products cannot be updated one by one.
- C#'s `Math.Round` uses "banker's rounding" by default, so exact half-cents round to the even digit. Because each
  share is rounded separately, the two shares can add up to one cent less than the total discount; I list this in
  [known limits](12-faq-and-limits.md#known-limits).

## Orders

- The client sends only the product ID and the quantity; **the server takes the price from the database**. A price
  changed in the browser never reaches the order.
- Stock is deducted in the same `SaveChanges` call as the order lines; if there is not enough stock, the order is
  not created at all.
- The order number is `ZK-<unix seconds>`. An order starts as `Pending` and becomes `Delivered` when the buyer
  clicks **Teslim Aldım** (I received it). Only pending orders can be marked as received.

## Reviews

| Rule | Code |
|---|---|
| Only the buyer role can write reviews | `[Authorize(Roles = "Buyer")]` |
| A seller cannot review their own product | `CreateReviewAsync` → `409` |
| A user reviews a product only once | `CreateReviewAsync` → `409` |
| The rating is clamped to 1–5 | `Math.Clamp(rating, 1, 5)` |
| If the user has an order containing the product, the review is a "verified purchase" | `VerifiedPurchase` |
| A product's rating and review count are calculated from the stored reviews | `ProductService` |

The last row matters: the product table has a `Rating` column, but the rating shown in the storefront is
recalculated from the reviews every time. A hand-entered rating can never contradict the real reviews.

## Buyer verdict: the decision engine

ZekAI's verdict does not come from AI but from a pure function in
[`decision_engine.py`](../../services/ai-service/buyer/decision_engine.py). The model only produces four scores and
evidence-backed warnings. I explain why in [AI pipeline](07-ai-pipeline.md).

| Threshold | Value |
|---|---|
| Fit: "buy" threshold / "don't buy" threshold | 70 / 40 |
| Confidence: "buy" threshold / "don't buy" threshold | 60 / 35 |
| Return risk: "buy" upper limit / "don't buy" lower limit | 25% / 50% |
| High-confidence warnings that mean "don't buy" | 2 |

1. **Alternatife Bak (look for an alternative):** fit < 40, confidence < 35, return risk > 50%, at least two
   high-confidence warnings, or at least one high-confidence better alternative. Any single condition is enough.
2. **Alabilirsin (go ahead):** fit ≥ 70, confidence ≥ 60, return risk ≤ 25% and no high-confidence warning. All of
   them are required.
3. **Dikkatli İlerle (proceed with care):** every other case.

Composite score: `0.40 × fit + 0.25 × confidence + 0.20 × price + 0.15 × (100 − return risk)`.

Example (the input from the code's own docstring): fit 72, confidence 64, price 58, return risk 22%, no warnings.

| Step | Result |
|---|---|
| Composite score | 28.8 + 16.0 + 11.6 + 11.7 = **68** |
| Any "don't buy" condition? | No |
| Every "buy" condition? | 72 ≥ 70, 64 ≥ 60, 22 ≤ 25, no warnings: **yes** |
| Verdict | **Alabilirsin** |

Add two high-confidence warnings to the same input and the verdict becomes **Alternatife Bak**, without any score
changing.

## Price fairness

When the market check finds at least two price candidates, the price score is calculated against the candidates'
**median**:

| Price / median | Score | Label |
|---|---|---|
| ≤ 0.75 | 90 | cheap |
| 0.75 – 0.90 | linear from 80 down to 70 | cheap |
| 0.90 – 1.10 | 70 − 150 × (distance of the ratio from 1) | fair |
| 1.10 – 1.30 | linear from 45 down to 25 | expensive |
| > 1.30 | 20 | expensive |

With fewer than two candidates, the advisor's own price score is used. I chose the median over the mean so that a
single outlier (say, a wrongly matched expensive model) cannot skew the result.
Code: [`calculate_price_fairness`](../../services/ai-service/buyer/scoring_engine.py).

## Return risk

```text
risk = category base risk
     + return/regret phrases in reviews × 6     (at most 24)
     + (70 − fit) × 0.45                         (when fit is below 70, at most 22)
     + (60 − confidence) × 0.35                  (when confidence is below 60, at most 18)
     + high-confidence warnings × 6              (at most 18)
```

Category base risks include clothing 32%, shoes 35%, accessories 24%, home 18%, sports 20%, electronics 12% and
books 6%; a category not on the list gets 18%. Example: an electronics product with fit 56 and one high-confidence
warning gives `12 + 6.3 + 6 = 24.3`, so 24%.
Code: [`calculate_return_risk`](../../services/ai-service/buyer/scoring_engine.py).

## Overall regret risk

For saved analyses, the interface shows a single percentage:
`100 − (fit + confidence + price) / 3 + 0.35 × return risk`. For the example above, that is 43%.
Code: [`applyVerifiedReport`](../../apps/zekai-platform-web/src/lib/adk/buyer-agent.ts).

## Kombin: judging products together

The buyer evaluates several products together, against a goal and a budget.

| Total / budget | Budget balance |
|---|---|
| ≤ 0.75 | 92 |
| ≤ 0.95 | 84 |
| ≤ 1.00 | 76 |
| ≤ 1.15 | 58 |
| ≤ 1.35 | 42 |
| > 1.35 | 25 |

- Overall score: `0.42 × need fit + 0.34 × item compatibility + 0.18 × budget balance + 0.06 × (100 − risk)`.
- Verdict: 78 and above **buy**, 60–77 **think about it**, below that **don't buy**.
- Purchase order: the "main" product first, then the complements, the optional items last; within a role, by fit
  (descending), then by price (ascending).

Code: [`kombin_router.py`](../../services/ai-service/buyer/kombin_router.py).

## Bundle recommendations

In the real system, Gemini gives candidate products a semantic fit score; `zekai-api` takes the top three and
caches the result against a hash of the seller's product list. `commerce-api` also contains a deterministic scorer
left over from the first version: category complementarity (8–35), shared keywords (up to 15), price ratio (2–20),
stock (up to 10) and rating and reviews (up to 15). For the presentation we gave five product pairs a fixed bonus
(+18/+20) in this scorer so they would stand out. It is a shortcut that should not exist in a real store, and I
also list it in [known limits](12-faq-and-limits.md#known-limits). The in-browser demo uses a port of this
deterministic scorer.
