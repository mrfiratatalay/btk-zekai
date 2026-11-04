import { categoryName } from "./commerce";
import type { ZekaiDb } from "./db";
import { advise } from "./engine-buyer";
import { compositeScore } from "./engine-decision";
import { formatTl } from "./text";

/**
 * Kombin analysis. Budget balance, overall-score weights, decision thresholds and the
 * purchase order are ported from services/ai-service/buyer/kombin_router.py. The part
 * Gemini does in production (fit, synergy, comments) comes from the rule-based advisor.
 */
export interface KombinInput {
  goal: string;
  budget: number;
  use_cases: string[];
  priorities: string[];
  style: string[];
  products: { id: string; title: string; category: string; price: number }[];
}

export function budgetBalance(total: number, budget: number): number {
  if (budget <= 0) return total <= 0 ? 55 : 30;
  const ratio = total / budget;
  if (ratio <= 0.75) return 92;
  if (ratio <= 0.95) return 84;
  if (ratio <= 1.0) return 76;
  if (ratio <= 1.15) return 58;
  if (ratio <= 1.35) return 42;
  return 25;
}

function budgetWarning(total: number, budget: number): string | null {
  if (budget <= 0) return "Bütçe belirtilmediği için fiyat dengesini sınırlı yorumladım.";
  if (total > budget) return `Seçilen ürünler bütçeyi yaklaşık ${Math.round(total - budget)} TL aşıyor.`;
  if (total > budget * 0.9) return "Bütçenin büyük kısmı kullanılıyor; opsiyonel parçaları sona bırakmak daha mantıklı.";
  return null;
}

const MISSING_IDEAS: Record<string, string> = {
  Elektronik: "Koruyucu kılıf ya da şarj aksesuarı", Aksesuar: "Kablo düzenleyici ya da taşıma çantası",
  "Spor & Outdoor": "Spor çorabı ve su şişesi", Mutfak: "Saklama kabı seti", "Ev & Yaşam": "Masa organizeri",
  Giyim: "Kombini tamamlayacak bir dış giyim parçası", "Anne & Bebek": "Yedek şarj adaptörü",
};

export function initialScores(input: KombinInput) {
  const total = input.products.reduce((s, p) => s + p.price, 0);
  return { overall: 25, need_fit: 0, part_fit: 0, budget_balance: budgetBalance(total, input.budget), risk: 0 };
}

export function analyzeKombin(db: ZekaiDb, input: KombinInput) {
  const need = [input.goal, ...input.use_cases, ...input.priorities, ...input.style].join(". ");
  const total = input.products.reduce((s, p) => s + p.price, 0);
  const rows = input.products.map((p) => {
    const product = db.commerce.products.find((x) => x.id === p.id);
    const report = product ? advise(db, product, need) : null;
    return { input: p, report, category: product ? categoryName(product) : p.category };
  });
  const fits = rows.map((r) => r.report?.fit_score ?? 62);
  const needFit = Math.round(fits.reduce((s, f) => s + f, 0) / Math.max(1, fits.length));
  const categories = new Set(rows.map((r) => r.category));
  const partFit = Math.max(35, Math.min(92, 58 + (categories.size - 1) * 11 - (rows.length - categories.size) * 9));
  const risk = Math.round(rows.reduce((s, r) => s + (100 - (r.report?.trust_score ?? 60)), 0) / Math.max(1, rows.length));
  const balance = budgetBalance(total, input.budget);
  const overall = Math.max(0, Math.min(100, Math.round(needFit * 0.42 + partFit * 0.34 + balance * 0.18 + (100 - risk) * 0.06)));
  const maxPrice = Math.max(...rows.map((r) => r.input.price));
  const productResults = rows.map((r, i) => {
    const role = r.input.price === maxPrice ? "ana" : rows.length >= 3 && r.input.price < total * 0.12 ? "opsiyonel" : "tamamlayici";
    const strong = r.report?.strengths.find((s) => s.confidence !== "low");
    const weak = r.report?.warnings.find((w) => w.confidence !== "low");
    return {
      productId: r.input.id, role, fitScore: fits[i], riskScore: 100 - (r.report?.trust_score ?? 60),
      aiComment: weak ? `${weak.warning}.` : strong ? `${strong.strength}.` : "Hedefle çelişen bir sinyal yok; kombinde destekleyici bir parça.",
      pairsWellWith: rows.filter((o) => o !== r && o.category !== r.category).map((o) => o.input.id),
    };
  });
  const roleWeight: Record<string, number> = { ana: 0, tamamlayici: 1, opsiyonel: 2 };
  const purchaseOrder = [...productResults]
    .sort((a, b) => roleWeight[a.role] - roleWeight[b.role] || b.fitScore - a.fitScore
      || (rows.find((r) => r.input.id === a.productId)!.input.price - rows.find((r) => r.input.id === b.productId)!.input.price))
    .map((p) => p.productId);
  const missingCategory = [...categories].find((c) => MISSING_IDEAS[c]);
  const weakest = productResults.reduce((a, b) => (a.fitScore <= b.fitScore ? a : b));
  const remaining = input.budget > 0 ? input.budget - total : 0;
  const suggestions = db.commerce.products
    .filter((p) => p.published && p.stock > 0 && !input.products.some((x) => x.id === p.id) && !categories.has(categoryName(p)))
    .filter((p) => remaining <= 0 || p.price <= Math.max(remaining, 400))
    .map((p) => ({ p, score: advise(db, p, need).fit_score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ p }) => ({ title: p.title, price: p.price, reason: `${categoryName(p)} kategorisinden; kombindeki eksik işlevi tamamlar.` }));
  const decision = overall >= 78 ? "al" : overall >= 60 ? "dusun" : "alma";
  return {
    live: { overall, need_fit: needFit, part_fit: partFit, budget_balance: balance, risk },
    result: {
      model: "demo-rule-engine", cached: false, decision,
      scores: { overall, needFit, partFit, budgetBalance: balance, risk },
      headline: decision === "al" ? "Kombin hedefine uygun görünüyor" : decision === "dusun" ? "Kombin büyük ölçüde uygun, birkaç noktaya dikkat" : "Kombin hedefle tam örtüşmüyor",
      summary: `Toplam ${formatTl(total)}${input.budget > 0 ? `, bütçenin %${Math.round((total / input.budget) * 100)}'i` : ""}. ${categories.size} farklı kategoriden ${rows.length} parça seçtin; ihtiyaç uyumu ortalaması ${needFit}/100.`,
      productResults,
      missingPiece: missingCategory ? MISSING_IDEAS[missingCategory] : undefined,
      warningItem: weakest.fitScore < 55 ? `${rows.find((r) => r.input.id === weakest.productId)!.input.title} hedefe en az uyan parça.` : budgetWarning(total, input.budget) ?? undefined,
      purchaseOrder, suggestions,
    },
  };
}

/** Compare verdict: ranks the analyses by the same composite score the decision engine uses. */
export function compareVerdict(db: ZekaiDb, need: string, analyses: { productId: string; productTitle: string; productPrice: number; userNeedText: string; fitScore: number; trustScore: number; priceScore: number; returnRiskPercent: number }[]) {
  const scored = analyses.map((a) => {
    const product = need.trim() ? db.commerce.products.find((p) => p.id === a.productId) : undefined;
    const fit = product ? advise(db, product, need).fit_score : a.fitScore;
    return { a, fit, score: compositeScore(fit, a.trustScore, a.priceScore, a.returnRiskPercent) };
  }).sort((x, y) => y.score - x.score);
  const [winner, runnerUp] = scored;
  const pricest = Math.max(...analyses.map((a) => a.productPrice));
  const caution = winner.a.productPrice === pricest && analyses.length > 1
    ? "Kazanan aynı zamanda en pahalı seçenek; bütçeni kontrol et."
    : runnerUp && winner.score - runnerUp.score < 5 ? "İkinci seçenekle fark küçük; önceliğine göre karar verebilirsin." : undefined;
  return {
    winner_id: winner.a.productId,
    headline: `${winner.a.productTitle} bu ihtiyaç için öne çıkıyor`,
    winner_reason: `Uyum ${winner.fit}/100, güven ${winner.a.trustScore}/100 ve iade riski %${winner.a.returnRiskPercent} ile en dengeli seçenek.`,
    caution,
    product_verdicts: scored.map((s) => ({
      product_id: s.a.productId,
      relative_fit: s === winner ? "best" : winner.score - s.score <= 10 ? "ok" : "skip",
      one_line_reason: s.fit < 55 ? `İhtiyaca uyumu zayıf (${s.fit}/100).` : s.a.returnRiskPercent > 30 ? `İade riski yüksek (%${s.a.returnRiskPercent}).`
        : `Dengeli skorlar: uyum ${s.fit}, güven ${s.a.trustScore}, fiyat ${s.a.priceScore}.`,
    })),
  };
}
