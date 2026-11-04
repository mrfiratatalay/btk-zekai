import { primaryImage, reviewsOf, toBundleDto } from "./commerce";
import { commit, nextSeq, type CommerceProduct, type ZekaiDb } from "./db";
import { generateContent, generateCustomerVoice, generateSocial, type SimulationInsight } from "./engine-seller";
import { recommendBundles, simulatePersonas } from "./engine-simulation";
import { badRequest, body, newId, notFound, ok, stream, type DemoRequest, type DemoResult, type SseStep } from "./http";
import { composeImage, STYLE_LABELS, type ImageStyle } from "./images";
import { activeStore, ownedProduct } from "./routes-seller";
import { hashString } from "./text";

/**
 * Seller AI endpoints. Like zekai-api, every output is stored with a hash of its input:
 * asking again for the same product state returns the saved result marked `_cached`.
 */
const signature = (db: ZekaiDb, p: CommerceProduct) =>
  hashString(JSON.stringify([p.title, p.price, p.originalPrice, p.stock, p.description, p.features, p.images, reviewsOf(db, p.id).length]));

function saveArtifact(db: ZekaiDb, userId: string, p: CommerceProduct, type: "simulation" | "bundle_recommendation" | "image_generation", label: string, inputHash: string, payload: unknown) {
  const now = new Date().toISOString();
  const artifact = { id: newId(), userId, commerceProductId: p.id, artifactType: type, label, inputHash, payload, status: "ready" as const, createdAt: now, updatedAt: now, lastUsedAt: now };
  db.artifacts.push(artifact);
  return artifact;
}

function contentRoute(req: DemoRequest, userId: string, p: CommerceProduct): DemoResult {
  const insight = body<{ simulationInsight: SimulationInsight }>(req).simulationInsight ?? null;
  const inputHash = hashString(`content|${signature(req.db, p)}|${JSON.stringify(insight)}`);
  const cached = req.db.productDrafts.find((d) => d.userId === userId && d.commerceProductId === p.id && d.inputHash === inputHash && d.status === "ready");
  if (cached) {
    return ok({ title: cached.data.title, shortDescription: cached.data.shortDescription, description: cached.data.description,
      features: Object.values(cached.data.features as Record<string, string>), whatIImproved: "Kayıtlı AI taslağı tekrar kullanıldı.", _mock: false, _cached: true, draftId: cached.id });
  }
  const content = generateContent(req.db, p, insight);
  const draft = {
    id: newId(), userId, commerceProductId: p.id, label: `AI taslağı · ${new Date().toLocaleDateString("tr-TR")}`, inputHash, status: "ready" as const,
    source: "demo-rule-engine", aiModel: "demo-rule-engine", createdAt: new Date().toISOString(),
    data: { title: content.title, shortDescription: content.shortDescription, description: content.description,
      features: Object.fromEntries(content.features.map((f, i) => [String(i), f])), price: p.price, originalPrice: p.originalPrice,
      stock: p.stock, brand: p.brand, cargoText: p.cargoText, categoryId: p.categoryId, images: [] },
  };
  req.db.productDrafts.push(draft);
  commit(req.db);
  return ok({ ...content, _mock: false, _cached: false, draftId: draft.id });
}

function socialRoute(req: DemoRequest, userId: string, p: CommerceProduct): DemoResult {
  const { tone = "profesyonel", purpose = "satis", platforms = [], note = "" } = body<{ tone: string; purpose: string; platforms: string[]; note: string }>(req);
  if (platforms.length === 0) badRequest("En az bir platform seç.");
  const inputHash = hashString(`social|${signature(req.db, p)}|${tone}|${purpose}|${[...platforms].sort()}|${note}`);
  const cached = req.db.socialDrafts.find((d) => d.userId === userId && d.commerceProductId === p.id && d.inputHash === inputHash && d.status === "ready");
  if (cached) return ok({ ...(cached.data.content as object), draftId: cached.id, _cached: true, _mock: false });
  const content = generateSocial(p, tone, purpose, platforms, note);
  for (const d of req.db.socialDrafts) if (d.userId === userId && d.commerceProductId === p.id) d.isActive = false;
  const draft = {
    id: newId(), userId, commerceProductId: p.id, label: `${tone[0].toLocaleUpperCase("tr-TR")}${tone.slice(1)} · ${purpose}`, inputHash, status: "ready" as const,
    isActive: true, source: "demo-rule-engine", aiModel: "demo-rule-engine", createdAt: new Date().toISOString(), data: { tone, purpose, platforms, content },
  };
  req.db.socialDrafts.push(draft);
  commit(req.db);
  return ok({ ...content, draftId: draft.id, _cached: false, _mock: false });
}

function simulationRoute(req: DemoRequest, userId: string, p: CommerceProduct, streaming: boolean): DemoResult {
  const inputHash = hashString(`simulation|${signature(req.db, p)}`);
  const cached = req.db.artifacts.find((a) => a.userId === userId && a.commerceProductId === p.id && a.artifactType === "simulation" && a.inputHash === inputHash && a.status === "ready");
  const personas = cached ? (cached.payload as { personas: unknown[] }).personas : simulatePersonas(req.db, p);
  const artifact = cached ?? saveArtifact(req.db, userId, p, "simulation", "Müşteri simülasyonu", inputHash, { personas });
  artifact.lastUsedAt = new Date().toISOString();
  commit(req.db);
  if (!streaming) return ok({ personas, artifactId: artifact.id, _cached: !!cached, _mock: false });
  const steps: SseStep[] = cached
    ? [{ delay: 250, data: { type: "step", message: "Kayıtlı müşteri simülasyonu kullanılıyor." } }, ...personas.map((persona) => ({ delay: 180, data: { type: "persona", persona } }))]
    : [
      { delay: 400, data: { type: "step", message: "Ürün sayfası, fiyat ve yorumlar hazırlanıyor..." } },
      { delay: 700, data: { type: "step", message: "5 müşteri profili sayfayı inceliyor..." } },
      ...personas.map((persona) => ({ delay: 1100, data: { type: "persona", persona } })),
    ];
  return stream([...steps, { delay: 300, data: { type: "done", artifactId: artifact.id, _cached: !!cached } }]);
}

async function imageRoute(req: DemoRequest, userId: string, p: CommerceProduct, all: boolean): Promise<DemoResult> {
  const styles: ImageStyle[] = all ? ["studio", "unboxing", "lifestyle"] : [((body<{ style: ImageStyle }>(req).style ?? "studio") as ImageStyle)];
  const images = await Promise.all(styles.map(async (style) => ({ type: style, label: STYLE_LABELS[style], ...(await composeImage(primaryImage(p), p.title, style)) })));
  const artifact = saveArtifact(req.db, userId, p, "image_generation", all ? "Ürün görselleri" : `${STYLE_LABELS[styles[0]]} görseli`, "", { styles });
  commit(req.db);
  const description = "Demo: görsel, ürünün kendi fotoğrafından tarayıcıda oluşturuldu. Gerçek sistemde Gemini Image yeni bir çekim üretir.";
  if (all) return ok({ images: images.map((i) => ({ ...i, artifactId: artifact.id })), artifactId: artifact.id, _cached: false, _mock: false });
  return ok({ imageBase64: images[0].imageBase64, mimeType: images[0].mimeType, description, artifactId: artifact.id, _cached: false, _mock: false });
}

function bundleRoutes(req: DemoRequest, userId: string, sellerId: string, p: CommerceProduct, rest: string): DemoResult | null {
  const db = req.db;
  if (rest === "bundles" && req.method === "GET") {
    return ok(db.commerce.bundles.filter((b) => b.primaryProductId === p.id && b.sellerId === sellerId && b.status !== "Archived").map((b) => toBundleDto(db, b)));
  }
  if (rest === "bundle-recommendations" && req.method === "POST") {
    const force = Boolean(body<{ force: boolean }>(req).force);
    const candidates = db.commerce.products.filter((c) => c.sellerId === sellerId && c.id !== p.id).map((c) => `${c.id}:${c.price}:${c.stock}:${c.published}`).join("|");
    const inputHash = hashString(`bundle|${signature(db, p)}|${candidates}`);
    const cached = force ? undefined : db.artifacts.find((a) => a.userId === userId && a.commerceProductId === p.id && a.artifactType === "bundle_recommendation" && a.inputHash === inputHash && a.status === "ready");
    if (cached) return ok({ ...(cached.payload as object), artifactId: cached.id, _cached: true, _mock: false });
    const result = recommendBundles(db, sellerId, p);
    const artifact = saveArtifact(db, userId, p, "bundle_recommendation", "Paket önerileri", inputHash, result);
    commit(db);
    return ok({ ...result, artifactId: artifact.id, _cached: false, _mock: false });
  }
  if (rest === "bundles" && req.method === "POST") {
    const input = body<{ complementaryProductId: string; title: string; shortDescription: string; campaignText: string; ctaLabel: string; discountPercent: number; recommendationReason: string; score: number; publish: boolean }>(req);
    const extra = db.commerce.products.find((c) => c.id === input.complementaryProductId && c.sellerId === sellerId) ?? notFound("Tamamlayıcı ürün bulunamadı.");
    const discount = Number(input.discountPercent ?? 5);
    if (discount < 0 || discount > 50) badRequest("İndirim yüzdesi 0 ile 50 arasında olmalıdır.");
    if (db.commerce.bundles.some((b) => b.sellerId === sellerId && b.primaryProductId === p.id && b.complementaryProductId === extra.id && b.status !== "Archived")) {
      badRequest("Bu ürün çifti için zaten aktif bir paket var.");
    }
    if (input.publish && (p.stock <= 0 || extra.stock <= 0)) badRequest("Stokta olmayan ürünler yayına alınamaz.");
    const now = new Date().toISOString();
    const bundle = {
      id: newId(), sellerId, primaryProductId: p.id, complementaryProductId: extra.id, title: input.title ?? "", shortDescription: input.shortDescription ?? "",
      campaignText: input.campaignText ?? "", ctaLabel: input.ctaLabel || "Paketi Sepete Ekle", discountPercent: discount,
      status: (input.publish ? "Published" : "Draft") as "Published" | "Draft", recommendationReason: input.recommendationReason ?? "", score: input.score ?? 0,
      createdAt: now, updatedAt: now, publishedAt: input.publish ? now : null,
    };
    db.commerce.bundles.push(bundle);
    commit(db);
    return ok(toBundleDto(db, bundle));
  }
  const match = rest.match(/^bundles\/([^/]+?)(?:\/(publish|archive))?$/);
  if (!match) return null;
  const bundle = db.commerce.bundles.find((b) => b.id === match[1] && b.sellerId === sellerId && b.primaryProductId === p.id) ?? notFound("Paket bulunamadı.");
  const input = body<Record<string, unknown>>(req);
  if (!match[2] && req.method === "PUT") {
    if (typeof input.discountPercent === "number" && (input.discountPercent < 0 || input.discountPercent > 50)) badRequest("İndirim yüzdesi 0 ile 50 arasında olmalıdır.");
    for (const f of ["title", "shortDescription", "campaignText", "ctaLabel"] as const) if (typeof input[f] === "string") bundle[f] = input[f] as string;
    if (typeof input.discountPercent === "number") bundle.discountPercent = input.discountPercent;
  } else if (match[2] === "publish" && req.method === "POST") {
    bundle.status = input.published === false ? "Draft" : "Published";
    bundle.publishedAt = bundle.status === "Published" ? new Date().toISOString() : null;
  } else if (match[2] === "archive" && req.method === "POST") {
    bundle.status = "Archived";
  } else return null;
  bundle.updatedAt = new Date().toISOString();
  commit(db);
  return ok(match[2] === "archive" ? { message: "Paket arşivlendi." } : toBundleDto(db, bundle));
}

function voiceData(db: ZekaiDb, userId: string, productId: string) {
  return {
    reviews: reviewsOf(db, productId).map((r) => ({ id: r.id, authorName: r.authorName, rating: r.rating, title: r.title, text: r.text, verifiedPurchase: r.verifiedPurchase, date: r.date, tags: r.tags })),
    replyDrafts: db.replyDrafts.filter((d) => d.userId === userId && d.productId === productId).map(({ userId: _u, productId: _p, ...d }) => d),
    faqDrafts: db.faqDrafts.filter((d) => d.userId === userId && d.productId === productId).map(({ userId: _u, productId: _p, ...d }) => d),
  };
}

function voiceDraftRoutes(req: DemoRequest, userId: string): DemoResult | null {
  const match = req.path.match(/^\/api\/seller\/customer-voice\/(reply-drafts|faq-drafts)\/(\d+)(\/publish)?$/);
  if (!match) return null;
  const db = req.db;
  const table = match[1] === "reply-drafts" ? db.replyDrafts : db.faqDrafts;
  const draft = table.find((d) => d.id === Number(match[2]) && d.userId === userId) ?? notFound("Taslak bulunamadı.");
  const input = body<Record<string, unknown>>(req);
  if (!match[3] && req.method === "PUT") {
    if (match[1] === "reply-drafts") draft.suggestedReply = String(input.suggestedReply ?? draft.suggestedReply);
    else Object.assign(draft, { question: input.question ?? draft.question, answer: input.answer ?? draft.answer });
  } else if (match[3] && req.method === "POST") {
    if (match[1] === "reply-drafts") {
      const review = db.commerce.reviews.find((r) => r.id === draft.reviewId) ?? notFound("Yorum bulunamadı.");
      review.sellerReply = String(draft.suggestedReply);
    } else {
      db.commerce.faqs.push({ id: nextSeq(db), productId: String(draft.productId), question: String(draft.question), answer: String(draft.answer),
        categoryTag: String(draft.categoryTag), sortOrder: Number(input.sortOrder ?? 0), createdAt: new Date().toISOString() });
    }
    Object.assign(draft, { status: "published", publishedAt: new Date().toISOString() });
  } else return null;
  commit(db);
  const { userId: _u, productId: _p, ...dto } = draft;
  return ok(dto);
}

export async function sellerAiRoutes(req: DemoRequest): Promise<DemoResult | null> {
  if (!req.path.startsWith("/api/seller/") || req.path.startsWith("/api/seller/connections")) return null;
  const { userId, seller } = activeStore(req);
  const voice = voiceDraftRoutes(req, userId);
  if (voice) return voice;
  const match = req.path.match(/^\/api\/seller\/products\/([^/]+)\/(.+)$/);
  if (!match) return null;
  const p = ownedProduct(req.db, seller, decodeURIComponent(match[1]));
  const rest = match[2];
  if (req.method === "POST" && rest === "ai-content") return contentRoute(req, userId, p);
  if (req.method === "POST" && rest === "social-content") return socialRoute(req, userId, p);
  if (req.method === "POST" && (rest === "simulate" || rest === "simulate-stream")) return simulationRoute(req, userId, p, rest === "simulate-stream");
  if (req.method === "POST" && (rest === "ai-image" || rest === "ai-images")) return imageRoute(req, userId, p, rest === "ai-images");
  if (rest === "customer-voice" && req.method === "GET") return ok(voiceData(req.db, userId, p.id));
  if (rest === "customer-voice/generate" && req.method === "POST") {
    req.db.replyDrafts = req.db.replyDrafts.filter((d) => !(d.userId === userId && d.productId === p.id && d.status !== "published"));
    req.db.faqDrafts = req.db.faqDrafts.filter((d) => !(d.userId === userId && d.productId === p.id && d.status !== "published"));
    const { replyDrafts, faqDrafts } = generateCustomerVoice(req.db, p, () => nextSeq(req.db));
    const published = new Set(req.db.replyDrafts.filter((d) => d.productId === p.id).map((d) => d.reviewId));
    req.db.replyDrafts.push(...replyDrafts.filter((d) => !published.has(d.reviewId)).map((d) => ({ ...d, userId, productId: p.id })));
    req.db.faqDrafts.push(...faqDrafts.map((d) => ({ ...d, userId, productId: p.id })));
    commit(req.db);
    return ok(voiceData(req.db, userId, p.id));
  }
  return bundleRoutes(req, userId, seller.id, p, rest);
}

