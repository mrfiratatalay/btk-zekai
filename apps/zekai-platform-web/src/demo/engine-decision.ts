/**
 * TypeScript port of services/ai-service/buyer/decision_engine.py and scoring_engine.py.
 * Same thresholds, weights and formulas: in the demo the verdict comes from exactly the
 * rules the real system applies to Gemini's scores.
 */
export type Evidence = { warning?: string; strength?: string; evidence: string; confidence: "high" | "medium" | "low" };
type Reason = { icon: "ok" | "warn" | "bad"; rule: string; text: string };

const FIT_BUY = 70;
const FIT_AVOID = 40;
const TRUST_BUY = 60;
const TRUST_AVOID = 35;
const RETURN_RISK_BUY_MAX = 25;
const RETURN_RISK_AVOID_MIN = 50;
const HIGH_CONF_WARNING_AVOID_MIN = 2;
const WEIGHTS = { fit: 0.4, trust: 0.25, price: 0.2, return: 0.15 };

const clamp = (value: number, low = 0, high = 100) => Math.max(low, Math.min(high, Math.round(value)));
const highConf = (items: { confidence?: string }[]) => items.filter((i) => i.confidence === "high").length;

export function compositeScore(fit: number, trust: number, price: number, returnRisk: number): number {
  return clamp(WEIGHTS.fit * fit + WEIGHTS.trust * trust + WEIGHTS.price * price + WEIGHTS.return * (100 - returnRisk));
}

export function decide(input: {
  fit: number; trust: number; priceFairness: number; returnRisk: number;
  warnings: Evidence[]; strengths: Evidence[]; alternatives: { confidence: string }[];
}) {
  const { fit, trust, priceFairness, returnRisk, warnings, strengths, alternatives } = input;
  const warningCount = highConf(warnings);
  const altCount = highConf(alternatives);
  const composite_score = compositeScore(fit, trust, priceFairness, returnRisk);
  const reasons: Reason[] = [];
  if (fit < FIT_AVOID) reasons.push({ icon: "bad", rule: "fit_below_avoid", text: `İhtiyaç uyumu çok düşük (${Math.trunc(fit)}/100, alma eşiği ${FIT_AVOID}).` });
  if (trust < TRUST_AVOID) reasons.push({ icon: "bad", rule: "trust_below_avoid", text: `Güven sinyali çok zayıf (${Math.trunc(trust)}/100). Yorumlar/satıcı geçmişi yetersiz.` });
  if (returnRisk > RETURN_RISK_AVOID_MIN) reasons.push({ icon: "bad", rule: "return_risk_high", text: `İade riski yüksek (%${Math.trunc(returnRisk)}). Kullanıcıların önemli bir kısmı pişman olmuş.` });
  if (warningCount >= HIGH_CONF_WARNING_AVOID_MIN) reasons.push({ icon: "bad", rule: "many_high_conf_warnings", text: `${warningCount} adet yüksek güvenilirlikli uyarı bulundu.` });
  if (altCount >= 1) reasons.push({ icon: "warn", rule: "better_alternative_found", text: `Bütçen dahilinde, ihtiyacına daha uygun ${altCount} alternatif bulundu.` });
  if (reasons.length > 0) return { level: "avoid" as const, label: "Alternatife Bak", composite_score, reasons };

  if (fit >= FIT_BUY && trust >= TRUST_BUY && returnRisk <= RETURN_RISK_BUY_MAX && warningCount === 0) {
    reasons.push(
      { icon: "ok", rule: "fit_strong", text: `İhtiyacınla yüksek uyum (${Math.trunc(fit)}/100, hedef ${FIT_BUY}+).` },
      { icon: "ok", rule: "trust_strong", text: `Güven sinyali güçlü (${Math.trunc(trust)}/100). Yorumlar tutarlı.` },
      { icon: "ok", rule: "return_risk_low", text: `İade riski düşük (%${Math.trunc(returnRisk)}).` },
    );
    if (strengths[0]?.strength) reasons.push({ icon: "ok", rule: "top_strength", text: strengths[0].strength });
    return { level: "buy" as const, label: "Alabilirsin", composite_score, reasons };
  }

  if (fit < FIT_BUY) reasons.push({ icon: "warn", rule: "fit_partial", text: `İhtiyacınla kısmen uyumlu (${Math.trunc(fit)}/100). Bazı must-have'lar eksik olabilir.` });
  if (trust < TRUST_BUY) reasons.push({ icon: "warn", rule: "trust_partial", text: `Güven sinyali orta seviye (${Math.trunc(trust)}/100). Yorumları kendin de incele.` });
  if (returnRisk > RETURN_RISK_BUY_MAX) reasons.push({ icon: "warn", rule: "return_risk_moderate", text: `İade riski orta (%${Math.trunc(returnRisk)}). Beden/uyum kritikse dikkat.` });
  if (warningCount === 1) reasons.push({ icon: "warn", rule: "single_high_conf_warning", text: warnings[0]?.warning ?? "Belirgin uyarı var" });
  if (reasons.length === 0) reasons.push({ icon: "warn", rule: "default_consider", text: "Skorlar orta seviyede. Karar senin — kanıtları aşağıda detaylı incele." });
  return { level: "consider" as const, label: "Dikkatli İlerle", composite_score, reasons };
}

/** Median comparison against market candidates; falls back to the advisor score with < 2 prices. */
export function priceFairness(currentPrice: number, candidates: number[], fallbackScore: number) {
  if (!currentPrice || candidates.length < 2) {
    return { score: clamp(fallbackScore), assessment: "bilinmiyor", median: null as number | null, ratio: null as number | null };
  }
  const sorted = [...candidates].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const ratio = median > 0 ? currentPrice / median : 1;
  let score: number;
  if (ratio <= 0.75) score = 90;
  else if (ratio <= 0.9) score = 80 - ((ratio - 0.75) / 0.15) * 10;
  else if (ratio <= 1.1) score = 70 - Math.abs(ratio - 1) * 150;
  else if (ratio <= 1.3) score = 45 - ((ratio - 1.1) / 0.2) * 20;
  else score = 20;
  const assessment = ratio <= 0.9 ? "ucuz" : ratio <= 1.1 ? "makul" : "pahalı";
  return { score: clamp(score), assessment, median: Math.round(median * 100) / 100, ratio: Math.round(ratio * 1000) / 1000 };
}

const CATEGORY_BASELINE: [string, number][] = [
  ["giyim", 32], ["ayakkabı", 35], ["moda", 30], ["aksesuar", 24], ["kozmetik", 22], ["elektronik", 12],
  ["telefon", 10], ["bilgisayar", 12], ["kulaklık", 14], ["beyaz eşya", 10], ["mobilya", 24], ["ev", 18],
  ["anne", 18], ["bebek", 18], ["kitap", 6], ["oyuncak", 16], ["spor", 20],
];
const NEGATIVE_TERMS = [
  "iade", "pişman", "beklediğim gibi değil", "kalitesiz", "bozuk", "arızalı", "çalışmadı", "dayanmadı",
  "küçük geldi", "büyük geldi", "uyumsuz", "sorunlu",
];

export function returnRisk(category: string, fit: number, trust: number, complaints: string[], warnings: Evidence[]) {
  const normalized = category.toLocaleLowerCase("tr-TR");
  let risk = CATEGORY_BASELINE.find(([key]) => normalized.includes(key))?.[1] ?? 18;
  const factors = [`Kategori baz riski: %${risk}`];
  const text = complaints.join(" ").toLocaleLowerCase("tr-TR");
  const hits = NEGATIVE_TERMS.filter((term) => text.includes(term)).length;
  if (hits) { const d = Math.min(24, hits * 6); risk += d; factors.push(`Yorumlarda iade/pişmanlık sinyali: +${d}`); }
  const fitGap = Math.max(0, 70 - fit);
  if (fitGap) { const d = Math.min(22, fitGap * 0.45); risk += d; factors.push(`İhtiyaç uyumu eksiği: +${Math.round(d)}`); }
  const trustGap = Math.max(0, 60 - trust);
  if (trustGap) { const d = Math.min(18, trustGap * 0.35); risk += d; factors.push(`Güven skoru eksiği: +${Math.round(d)}`); }
  const high = highConf(warnings);
  if (high) { const d = Math.min(18, high * 6); risk += d; factors.push(`Yüksek güvenilirlikli uyarı: +${d}`); }
  return { risk: clamp(risk), factors };
}
