import { categoryName, ratingOf, reviewsOf } from "./commerce";
import type { CommerceProduct, ZekaiDb } from "./db";
import { decide, priceFairness, returnRisk, type Evidence } from "./engine-decision";
import { aspectsIn, budgetFrom, clausesOf, formatTl, lower, polarity, quote, type Aspect } from "./text";

/**
 * Demo stand-in for the Gemini "Buyer Advisor" call. Gemini reads the product, the need and
 * the reviews and returns four scores with evidence. This rule-based version does the same
 * job with a fixed aspect list: every warning or strength quotes the review sentence it
 * came from. The verdict is then computed by the ported decision engine, as in production.
 */
type Signal = { aspect: Aspect; sentence: string; rating: number; negative: boolean };

/** One signal per review clause that talks about exactly one of the asked aspects. */
function signalsFor(db: ZekaiDb, product: CommerceProduct, aspects: Aspect[]): Signal[] {
  const signals: Signal[] = [];
  for (const review of reviewsOf(db, product.id)) {
    for (const clause of clausesOf(`${review.title}. ${review.text}`)) {
      const value = lower(clause);
      const matched = aspects.filter((aspect) => aspect.terms.some((t) => value.includes(t)));
      if (matched.length !== 1) continue;
      const tone = polarity(clause) ?? (review.rating >= 4 ? "positive" : review.rating <= 2 ? "negative" : null);
      if (tone) signals.push({ aspect: matched[0], sentence: clause, rating: review.rating, negative: tone === "negative" });
    }
  }
  return signals;
}

export interface AdvisorReport {
  fit_score: number;
  trust_score: number;
  price_fairness_score: number;
  return_risk_percent: number;
  final_summary: string;
  warnings: Evidence[];
  strengths: Evidence[];
  needs_market_check: boolean;
  market_check_reason: string;
}

const clamp = (v: number, lo = 5, hi = 97) => Math.max(lo, Math.min(hi, Math.round(v)));

export function advise(db: ZekaiDb, product: CommerceProduct, need: string): AdvisorReport {
  const aspects = aspectsIn(need);
  const signals = signalsFor(db, product, aspects);
  const warnings: Evidence[] = [];
  const strengths: Evidence[] = [];
  const productText = lower(`${product.title} ${product.description} ${Object.entries(product.features).flat().join(" ")}`);
  let fit = 64;
  for (const aspect of aspects) {
    const neg = signals.filter((s) => s.aspect === aspect && s.negative);
    const pos = signals.filter((s) => s.aspect === aspect && !s.negative);
    if (neg.length > 0 && neg.length >= pos.length) {
      fit -= 11 * Math.min(2, neg.length);
      warnings.push({ warning: `${aspect.label} konusunda yorumlarda şikâyet var`, evidence: `“${quote(neg[0].sentence)}” (${neg[0].rating}/5)`, confidence: neg.length >= 2 ? "high" : "medium" });
    } else if (pos.length > 0) {
      fit += 7 * Math.min(2, pos.length);
      strengths.push({ strength: `${aspect.label} yorumlarda olumlu`, evidence: `“${quote(pos[0].sentence)}” (${pos[0].rating}/5)`, confidence: pos.length >= 2 ? "high" : "medium" });
    } else if (aspect.terms.some((t) => productText.includes(t))) {
      fit += 3;
      strengths.push({ strength: `${aspect.label} ürün bilgisinde belirtilmiş`, evidence: "Ürün açıklaması ve teknik özellikler", confidence: "low" });
    } else {
      fit -= 5;
      warnings.push({ warning: `${aspect.label} hakkında veri yok`, evidence: "Ne ürün bilgisinde ne de yorumlarda bu konu geçiyor.", confidence: "low" });
    }
  }
  const budget = budgetFrom(need);
  if (budget !== null && product.price > budget) {
    fit -= 14;
    warnings.push({ warning: `Fiyat bütçeni aşıyor (${formatTl(product.price)} > ${formatTl(budget)})`, evidence: "İhtiyaç metnindeki bütçe", confidence: "high" });
  } else if (budget !== null) {
    strengths.push({ strength: `Bütçene uyuyor (${formatTl(product.price)})`, evidence: "İhtiyaç metnindeki bütçe", confidence: "medium" });
  }
  const { rating, reviewCount } = ratingOf(db, product.id);
  const reviews = reviewsOf(db, product.id);
  const verified = reviews.length ? reviews.filter((r) => r.verifiedPurchase).length / reviews.length : 0;
  const lowShare = reviews.length ? reviews.filter((r) => r.rating <= 2).length / reviews.length : 0;
  const trust = clamp(18 + rating * 9 + Math.min(12, reviewCount * 1.5) + verified * 10 - lowShare * 22);
  const discount = product.originalPrice && product.originalPrice > product.price ? 6 : 0;
  const needsMarket = budget !== null || /fiyat|bütçe|pahalı|uygun fiyat|ucuz/.test(lower(need)) || product.price >= 2500;
  return {
    fit_score: clamp(fit),
    trust_score: trust,
    price_fairness_score: clamp(58 + discount),
    return_risk_percent: 0,
    final_summary: summaryOf(strengths, warnings),
    warnings: warnings.slice(0, 5),
    strengths: strengths.slice(0, 5),
    needs_market_check: needsMarket,
    market_check_reason: needsMarket ? "Kullanıcı fiyat ya da bütçe belirtti; piyasa karşılaştırması karar için belirleyici." : "",
  };
}

function summaryOf(strengths: Evidence[], warnings: Evidence[]): string {
  const strong = strengths.find((s) => s.confidence !== "low");
  const weak = warnings.find((w) => w.confidence !== "low");
  if (strong && weak) return `${strong.strength} ancak ${lower(weak.warning ?? "")}. Kararı bu kanıtlara göre ver.`;
  if (weak) return `${weak.warning}. İhtiyacının bu kısmı için ürün riskli görünüyor.`;
  if (strong) return `${strong.strength}. İhtiyacınla örtüşen güçlü sinyaller var.`;
  return "İhtiyacına dair ürün bilgisinde ve yorumlarda belirgin bir sinyal bulunamadı; kararı puan ve fiyata göre ver.";
}

export interface MarketReport {
  price_assessment: string;
  market_context: string;
  market_price_candidates: { title: string; price: number; currency: string; source_url: string }[];
  alternatives: { title: string; approx_price: number; currency: string; source_url: string; why_better_fit: string; trade_offs: string; confidence: "high" | "medium" | "low" }[];
}

/** Demo "market check": instead of Google Search it compares against similar catalogue items. */
export function marketCheck(db: ZekaiDb, product: CommerceProduct, need: string, advisor: AdvisorReport, storeUrl: string): MarketReport {
  const words = (title: string) => new Set(lower(title).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 4));
  const own = words(product.title);
  const sameCategory = db.commerce.products.filter((p) => p.id !== product.id && p.published && p.stock > 0
    && p.categoryId === product.categoryId && p.price >= product.price * 0.4 && p.price <= product.price * 2.5);
  // Prefer items of the same kind (sharing a title word such as "kulaklık") over the whole category.
  const sameKind = sameCategory.filter((p) => [...words(p.title)].some((w) => own.has(w)));
  const similar = sameKind.length >= 2 ? sameKind : sameCategory;
  const budget = budgetFrom(need) ?? product.price * 1.15;
  const alternatives = similar
    .filter((p) => p.price <= budget)
    .map((p) => ({ p, fit: advise(db, p, need).fit_score }))
    .filter((x) => x.fit >= advisor.fit_score + 8)
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 2)
    .map(({ p, fit }) => ({
      title: p.title, approx_price: p.price, currency: "TRY", source_url: `${storeUrl}/product/${p.id}`,
      why_better_fit: `İhtiyaç metnindeki konularda yorumları daha güçlü (uyum ${fit}/100).`,
      trade_offs: p.price > product.price ? `${formatTl(p.price - product.price)} daha pahalı.` : "Daha az yorumu olabilir; yorumları kontrol et.",
      confidence: (fit - advisor.fit_score >= 15 ? "high" : "medium") as "high" | "medium",
    }));
  const candidates = similar.slice(0, 5).map((p) => ({ title: p.title, price: p.price, currency: "TRY", source_url: `${storeUrl}/product/${p.id}` }));
  return {
    price_assessment: "bilinmiyor",
    market_context: similar.length
      ? `Akıllı Market kataloğunda ${similar.length} benzer ürün bulundu; fiyat bu ürünlerin medyanıyla karşılaştırıldı.`
      : "Aynı kategoride karşılaştırılabilir ürün bulunamadı.",
    market_price_candidates: candidates,
    alternatives,
  };
}

export function finalReport(db: ZekaiDb, product: CommerceProduct, advisor: AdvisorReport, market: MarketReport | null) {
  const fairness = priceFairness(product.price, market?.market_price_candidates.map((c) => c.price) ?? [], advisor.price_fairness_score);
  const complaints = advisor.warnings.map((w) => `${w.warning} ${w.evidence}`);
  const risk = returnRisk(categoryName(product), advisor.fit_score, advisor.trust_score, complaints, advisor.warnings);
  const alternatives = market?.alternatives ?? [];
  const verdict = decide({ fit: advisor.fit_score, trust: advisor.trust_score, priceFairness: fairness.score, returnRisk: risk.risk, warnings: advisor.warnings, strengths: advisor.strengths, alternatives });
  return {
    model: "demo-rule-engine", search_model: null, used_search: market !== null, cached: false,
    fit_score: advisor.fit_score, trust_score: advisor.trust_score, price_fairness_score: fairness.score, return_risk_percent: risk.risk,
    verified_fit_score: advisor.fit_score, verified_trust_score: advisor.trust_score,
    verified_price_fairness_score: fairness.score, verified_return_risk_percent: risk.risk,
    final_summary: advisor.final_summary, warnings: advisor.warnings, strengths: advisor.strengths,
    verified_warnings: advisor.warnings, verified_strengths: advisor.strengths, return_risk_factors: risk.factors,
    market_context: market?.market_context ?? "", market_price_candidates: market?.market_price_candidates ?? [],
    alternatives, verdict, verification_quality: "medium",
  };
}
