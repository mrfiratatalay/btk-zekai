import { CATALOG } from "./catalog";
import { findProduct, primaryImage } from "./commerce";
import type { DemoUser, ZekaiDb } from "./db";
import { advise, finalReport, marketCheck } from "./engine-buyer";
import { analyzeKombin } from "./engine-kombin";
import { generateContent, generateSocial } from "./engine-seller";
import { daysAgo, newId } from "./http";
import { formatTl, hashString, normalizeNeed } from "./text";

export const DB_VERSION = 1;
export const STORE_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "https://akilli-markett.vercel.app";
export const SELLER_API_KEY = "am_live_demo_mehmet_elektronik_2024";

export function analysisCacheKey(db: ZekaiDb, userId: string, productId: string, need: string): string {
  const p = findProduct(db, productId);
  const reviews = db.commerce.reviews.filter((r) => r.productId === productId);
  const fingerprint = hashString(`${p.id}|${p.price}|${p.originalPrice}|${reviews.length}|${p.stock}|${p.title}|${p.description}`);
  return hashString(`${userId}|${p.id}|${normalizeNeed(need)}|${fingerprint}`);
}

/** Runs the demo analysis and returns the same fields the frontend saves after a real one. */
export function runAnalysis(db: ZekaiDb, productId: string, need: string) {
  const product = findProduct(db, productId);
  const advisor = advise(db, product, need);
  const market = advisor.needs_market_check ? marketCheck(db, product, need, advisor, STORE_URL) : null;
  return { advisor, market, report: finalReport(db, product, advisor, market) };
}

function savedAnalysis(db: ZekaiDb, user: DemoUser, productId: string, need: string, status: string, age: number, note: string | null) {
  const { report } = runAnalysis(db, productId, need);
  const p = findProduct(db, productId);
  const s = { fitScore: report.fit_score, trustScore: report.trust_score, priceScore: report.price_fairness_score, returnRiskPercent: report.return_risk_percent };
  const overall = Math.min(100, Math.max(0, Math.round(100 - (s.fitScore + s.trustScore + s.priceScore) / 3 + s.returnRiskPercent * 0.35)));
  const level = report.verdict.level === "buy" ? "safe" : report.verdict.level === "avoid" ? "risky" : "caution";
  const externalId = `${productId}--${encodeURIComponent(need).slice(0, 500)}`;
  db.analysisCache.push({ key: analysisCacheKey(db, user.id, productId, need), userId: user.id, result: report, expiresAt: daysAgo(-7) });
  db.analyses.push({
    id: newId(), userId: user.id, externalId, productId, productTitle: p.title, productImage: primaryImage(p), productPrice: formatTl(p.price),
    sellerName: p.sellerName, userNeedText: need, overallRiskPercent: overall, recommendationLevel: level,
    scoresJson: JSON.stringify(s), status, userNote: note, savedAt: daysAgo(age, 21),
  });
  return externalId;
}

function seedCommerce(db: ZekaiDb) {
  db.commerce.sellers = CATALOG.sellers.map((s, i) => ({ ...s, id: `00000000-0000-4000-9000-0000000000${i + 10}` }));
  for (const p of CATALOG.products) {
    const { reviews, ...product } = p;
    const seller = db.commerce.sellers.find((s) => s.storeName === p.sellerName);
    db.commerce.products.push({ ...product, sellerId: seller?.id ?? null, published: true, updatedAt: daysAgo(6) });
    for (const { daysAgo: age, ...r } of reviews) {
      db.seq += 1;
      db.commerce.reviews.push({ ...r, id: db.seq, productId: p.id, date: daysAgo(age, 10 + (db.seq % 9)), sellerReply: null });
    }
  }
  const mehmet = db.commerce.sellers[0];
  db.commerce.bundles = CATALOG.bundles.map((b) => ({
    ...b, id: newId(), sellerId: mehmet.id, ctaLabel: "Paketi Sepete Ekle", status: "Published" as const,
    createdAt: daysAgo(9), updatedAt: daysAgo(9), publishedAt: daysAgo(9),
  }));
}

function seedSeller(db: ZekaiDb, seller: DemoUser) {
  db.connections.push({ id: newId(), userId: seller.id, platform: "akilli-market-demo", sellerId: db.commerce.sellers[0].id, apiKey: SELLER_API_KEY, status: "connected", lastSyncAt: daysAgo(1, 9) });
  const product = findProduct(db, "bluetooth-kulaklik-pro-x1");
  const content = generateContent(db, product);
  db.productDrafts.push({
    id: newId(), userId: seller.id, commerceProductId: product.id, label: "AI taslağı · ilk sürüm", inputHash: "seed", status: "ready",
    source: "demo-rule-engine", aiModel: "demo-rule-engine", createdAt: daysAgo(2, 15),
    data: {
      title: content.title, shortDescription: content.shortDescription, description: content.description,
      features: Object.fromEntries(content.features.map((f, i) => [String(i), f])), price: product.price, originalPrice: product.originalPrice,
      stock: product.stock, brand: product.brand, cargoText: product.cargoText, categoryId: product.categoryId, images: [],
    },
  });
  db.socialDrafts.push({
    id: newId(), userId: seller.id, commerceProductId: product.id, label: "Samimi · satış", inputHash: "seed", status: "ready", isActive: true,
    source: "demo-rule-engine", aiModel: "demo-rule-engine", createdAt: daysAgo(1, 18),
    data: { tone: "samimi", purpose: "satis", platforms: ["instagram", "tiktok"], content: generateSocial(product, "samimi", "satis", ["instagram", "tiktok"]) },
  });
}

/** Burak has already used ZekAI for a week: four saved analyses, a decision room and a kombin. */
function seedBuyer(db: ZekaiDb, buyer: DemoUser) {
  const headphoneNeed = "Günlük müzik dinleyeceğim ama haftada birkaç kez online toplantıya da gireceğim. Bütçem 1.300 TL.";
  const headphones = savedAnalysis(db, buyer, "bluetooth-kulaklik-pro-x1", headphoneNeed, "comparing", 5, "Mikrofon yorumları beni düşündürüyor.");
  savedAnalysis(db, buyer, "kulaklik-jbl-tune770", headphoneNeed, "comparing", 5, null);
  savedAnalysis(db, buyer, "akilli-saat-fit-neo", "Koşu ve uyku takibi için uygun fiyatlı, pili uzun giden bir akıllı saat arıyorum.", "thinking", 3, null);
  const chair = savedAnalysis(db, buyer, "ergonomik-calisma-sandalyesi", "Evden çalışıyorum, günde 8 saat oturuyorum; bel desteği ve konfor en önemli kriterim.", "waiting", 2, "Fiyatı düşerse alacağım.");
  db.projects.push({
    id: newId(), userId: buyer.id, externalId: `project-${Date.parse(daysAgo(4))}-ev0fis`, title: "Ev ofisi kurulumu",
    goal: "Uzun saatler rahat çalışabileceğim sessiz bir çalışma köşesi", budget: 15000, createdAt: daysAgo(4, 20), analysisIds: [headphones, chair],
  });
  const products = ["spor-ayakkabi-runflex", "akilli-saat-fit-neo", "telefon-kilifi-magsafe"].map((id) => findProduct(db, id));
  const input = {
    goal: "Haftada üç gün sabah koşusuna başlıyorum", budget: 3500, use_cases: ["Koşu", "Günlük kullanım"], priorities: ["Konfor", "Pil ömrü"], style: ["Sportif"],
    products: products.map((p) => ({ id: p.id, title: p.title, category: CATALOG.categories.find((c) => c.id === p.categoryId)?.name ?? "", price: p.price })),
  };
  db.kombins.push({
    id: newId(), userId: buyer.id, externalId: `kombin-${Date.parse(daysAgo(1))}-kosu`, title: "Sabah koşusu kombini", goalText: input.goal, budget: input.budget,
    productsJson: JSON.stringify(products.map((p) => ({ id: p.id, title: p.title, category: input.products.find((x) => x.id === p.id)!.category, price: p.price, image: primaryImage(p) }))),
    resultJson: JSON.stringify(analyzeKombin(db, input).result), createdAt: daysAgo(1, 8),
  });
}

export function seedDb(): ZekaiDb {
  const db: ZekaiDb = {
    version: DB_VERSION, seq: 0, users: [], commerce: { sellers: [], products: [], reviews: [], bundles: [], faqs: [] },
    connections: [], analyses: [], projects: [], kombins: [], analysisCache: [], productDrafts: [], socialDrafts: [],
    artifacts: [], replyDrafts: [], faqDrafts: [],
  };
  const seller: DemoUser = { id: "00000000-0000-4000-a000-000000000001", email: "seller@zekai.com", fullName: "Mehmet Kaya", role: "Seller", passwordHash: null, profileName: null, onboarded: true };
  const buyer: DemoUser = { id: "00000000-0000-4000-a000-000000000002", email: "buyer@zekai.com", fullName: "Burak Yılmaz", role: "Buyer", passwordHash: null, profileName: "Burak", onboarded: true };
  db.users.push(seller, buyer);
  seedCommerce(db);
  seedSeller(db, seller);
  seedBuyer(db, buyer);
  return db;
}
