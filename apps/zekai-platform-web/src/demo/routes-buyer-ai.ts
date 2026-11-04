import { findProduct, primaryImage, ratingOf, categoryName } from "./commerce";
import { commit } from "./db";
import { analyzeKombin, compareVerdict, initialScores, type KombinInput } from "./engine-kombin";
import { badRequest, body, currentUser, daysAgo, notFound, ok, stream, type DemoRequest, type DemoResult, type SseStep } from "./http";
import { analysisCacheKey, runAnalysis } from "./seed";
import { hashString } from "./text";

/** SSE helpers that produce the same event shapes as the AI service and zekai-api. */
const event = (author: string, text: string, stateKey?: string, stateValue?: unknown) => ({
  author,
  ...(text ? { content: { parts: [{ text }] } } : {}),
  ...(stateKey ? { actions: { state_delta: { [stateKey]: stateValue } } } : {}),
});

function analyze(req: DemoRequest): DemoResult {
  const user = currentUser(req);
  const { productId = "", buyerNeed = "" } = body<{ productId: string; buyerNeed: string }>(req);
  if (!productId.trim() || !buyerNeed.trim()) badRequest("productId ve buyerNeed zorunludur.");
  findProduct(req.db, productId);
  const key = analysisCacheKey(req.db, user.id, productId, buyerNeed);
  const now = new Date().toISOString();
  const cached = req.db.analysisCache.find((c) => c.key === key && c.expiresAt > now);
  if (cached) {
    return stream([
      { delay: 250, data: event("cache", "Önceki tamamlanmış analiz bulundu.") },
      { delay: 250, data: event("buyer_advisor", "Cache sonucu kullanılıyor.", "advisor_raporu", { cached: true }) },
      { delay: 350, data: event("decision", JSON.stringify(cached.result), "final_rapor", { ...(cached.result as object), cached: true }) },
    ]);
  }
  const { advisor, market, report } = runAnalysis(req.db, productId, buyerNeed);
  req.db.analysisCache = req.db.analysisCache.filter((c) => c.key !== key);
  req.db.analysisCache.push({ key, userId: user.id, result: report, expiresAt: daysAgo(-7) });
  commit(req.db);
  const steps: SseStep[] = [
    { delay: 350, data: event("buyer_advisor", "Ürün ve ihtiyaç birlikte değerlendiriliyor...") },
    { delay: 1700, data: event("buyer_advisor", JSON.stringify(advisor), "advisor_raporu", advisor) },
  ];
  if (market) {
    steps.push(
      { delay: 300, data: event("market_check", "Fiyat ve alternatifler için kısa piyasa kontrolü yapılıyor...") },
      { delay: 1500, data: event("market_check", JSON.stringify(market), "piyasa_kontrolu", market) },
    );
  }
  steps.push(
    { delay: 300, data: event("decision", "Karar raporu hazırlanıyor...") },
    { delay: 800, data: event("decision", JSON.stringify(report), "final_rapor", report) },
  );
  return stream(steps);
}

function stage(agent: string, status: "running" | "done", label: string) {
  return event(agent, "", "kombin_stage", { agent, status, label });
}

function kombin(req: DemoRequest): DemoResult {
  currentUser(req);
  const raw = body<KombinInput>(req);
  const input: KombinInput = {
    goal: raw.goal ?? "", budget: Number(raw.budget) || 0, use_cases: raw.use_cases ?? [], priorities: raw.priorities ?? [],
    style: raw.style ?? [], products: (raw.products ?? []).map((p) => ({ id: p.id, title: p.title, category: p.category, price: Number(p.price) || 0 })),
  };
  if (input.products.length < 2) badRequest("Kombin analizi için en az iki ürün seç.");
  const key = `kombin:${hashString(JSON.stringify(input))}`;
  const cached = req.db.analysisCache.find((c) => c.key === key);
  const { live, result } = analyzeKombin(req.db, input);
  if (cached) {
    return stream([
      { delay: 250, data: stage("cache", "done", "Aynı kombin daha önce analiz edilmiş; kayıtlı sonuç kullanılıyor.") },
      { delay: 200, data: event("decision_engine", "", "partial_scores", live) },
      { delay: 250, data: event("decision_engine", "", "kombin_result", { ...result, cached: true }) },
    ]);
  }
  req.db.analysisCache.push({ key, userId: "", result, expiresAt: daysAgo(-1) });
  commit(req.db);
  return stream([
    { delay: 300, data: stage("kombin_planner", "running", "Ürünler ve bütçe hazırlanıyor...") },
    { delay: 500, data: event("kombin_planner", "", "partial_scores", initialScores(input)) },
    { delay: 300, data: stage("kombin_planner", "done", "Ürün listesi ve bütçe hazırlandı.") },
    { delay: 300, data: stage("fit_advisor", "running", "Kombinin ihtiyaca ve tarza uyumu değerlendiriliyor...") },
    { delay: 1800, data: stage("fit_advisor", "done", "Kombin uyumu değerlendirildi.") },
    { delay: 300, data: stage("decision_engine", "running", "Bütçe, risk ve satın alma sırası hesaplanıyor...") },
    { delay: 700, data: event("decision_engine", "", "partial_scores", live) },
    { delay: 300, data: stage("decision_engine", "done", "Kombin raporu hazır.") },
    { delay: 300, data: event("decision_engine", "", "kombin_result", result) },
  ]);
}

function compare(req: DemoRequest): DemoResult {
  currentUser(req);
  const input = body<{ comparisonNeed: string; analyses: Parameters<typeof compareVerdict>[2] }>(req);
  if (!input.analyses || input.analyses.length < 2) badRequest("Karşılaştırma için en az iki analiz gerekli.");
  const verdict = compareVerdict(req.db, input.comparisonNeed ?? "", input.analyses);
  return stream([
    { delay: 400, data: event("compare_engine", "Ürünler karşılaştırılıyor...") },
    { delay: 1400, data: event("compare_engine", JSON.stringify(verdict), "compare_verdict", verdict) },
  ]);
}

export function buyerAiRoutes(req: DemoRequest): DemoResult | null {
  if (req.method !== "POST") return null;
  if (req.path === "/api/buyer/analyze") return analyze(req);
  if (req.path === "/api/buyer/kombin-analyze") return kombin(req);
  if (req.path === "/api/buyer/compare-verdict") return compare(req);
  if (req.path === "/api/buyer/product-preview") {
    currentUser(req);
    const match = String(body<{ productUrl: string }>(req).productUrl ?? "").match(/\/(?:product|urun|products)\/([^/?#]+)/i);
    if (!match) notFound("Ürün bulunamadı.");
    const p = findProduct(req.db, decodeURIComponent(match[1]));
    return ok({ id: p.id, title: p.title, brand: p.brand, sellerName: p.sellerName, category: categoryName(p), price: p.price,
      originalPrice: p.originalPrice, ...ratingOf(req.db, p.id), image: primaryImage(p), shortDescription: p.shortDescription });
  }
  return null;
}
