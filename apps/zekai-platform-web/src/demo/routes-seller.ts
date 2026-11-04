import { categoryName, findProduct, primaryImage, toDetailDto } from "./commerce";
import { commit, type CommerceProduct, type CommerceSeller, type StoredDraft, type ZekaiDb } from "./db";
import { badRequest, body, currentUser, HttpError, newId, noContent, notFound, ok, type DemoRequest, type DemoResult } from "./http";

/** Store connection, products, drafts and saved AI outputs, as in zekai-api's SellerService. */
export function activeStore(req: DemoRequest): { userId: string; seller: CommerceSeller } {
  const user = currentUser(req);
  const conn = req.db.connections.find((c) => c.userId === user.id && c.status === "connected");
  const seller = conn && req.db.commerce.sellers.find((s) => s.id === conn.sellerId && s.apiKey === conn.apiKey);
  if (!seller) badRequest("Aktif mağaza bağlantısı bulunamadı. Ayarlar'dan Akıllı Market API anahtarınızı bağlayın.");
  return { userId: user.id, seller };
}

export function ownedProduct(db: ZekaiDb, seller: CommerceSeller, productId: string): CommerceProduct {
  const product = findProduct(db, productId);
  if (product.sellerId !== seller.id) notFound("Ürün bulunamadı.");
  return product;
}

/** Same partial update as commerce-api's UpdateProductContentAsync. */
export function applyProductUpdate(product: CommerceProduct, input: Record<string, unknown>) {
  for (const field of ["title", "shortDescription", "description", "brand", "cargoText"] as const) {
    if (typeof input[field] === "string") product[field] = input[field] as string;
  }
  if (input.features && typeof input.features === "object") product.features = input.features as Record<string, string>;
  if (typeof input.price === "number") product.price = input.price;
  if (typeof input.stock === "number") product.stock = input.stock;
  if (input.clearOriginalPrice) product.originalPrice = null;
  else if (typeof input.originalPrice === "number") product.originalPrice = input.originalPrice;
  if (typeof input.categoryId === "number") product.categoryId = input.categoryId;
  if (typeof input.primaryImageUrl === "string" && input.primaryImageUrl.trim()) product.images = [input.primaryImageUrl, ...product.images.slice(1)];
  product.updatedAt = new Date().toISOString();
}

function connectionRoutes(req: DemoRequest): DemoResult | null {
  const db = req.db;
  const user = currentUser(req);
  if (req.path === "/api/seller/connections" && req.method === "GET") {
    return ok(db.connections.filter((c) => c.userId === user.id).map((c) => {
      const seller = db.commerce.sellers.find((s) => s.id === c.sellerId);
      const connected = c.status === "connected" && !!c.apiKey;
      return {
        id: c.id, platform: c.platform, storeName: connected && seller ? seller.storeName : c.platform, status: connected ? "Connected" : "Disconnected",
        lastSyncAt: c.lastSyncAt, productCount: connected && seller ? db.commerce.products.filter((p) => p.sellerId === seller.id).length : 0, hasApiKey: !!c.apiKey,
      };
    }));
  }
  if (req.path === "/api/seller/connections" && req.method === "POST") {
    const { apiKey = "", platform = "akilli-market-demo" } = body<{ apiKey: string; platform: string }>(req);
    const seller = db.commerce.sellers.find((s) => s.apiKey === apiKey.trim());
    if (!seller) throw new HttpError(401, "API anahtarı geçersiz.");
    let conn = db.connections.find((c) => c.userId === user.id);
    if (!conn) {
      conn = { id: newId(), userId: user.id, platform, sellerId: seller.id, apiKey: seller.apiKey, status: "connected", lastSyncAt: null };
      db.connections.push(conn);
    }
    Object.assign(conn, { platform, sellerId: seller.id, apiKey: seller.apiKey, status: "connected", lastSyncAt: null });
    commit(db);
    const count = db.commerce.products.filter((p) => p.sellerId === seller.id).length;
    return ok({ id: conn.id, platform, storeName: seller.storeName, status: "Connected", lastSyncAt: null, productCount: count, hasApiKey: true });
  }
  if (req.path === "/api/seller/connections/sync" && req.method === "POST") {
    const conn = db.connections.find((c) => c.userId === user.id && c.status === "connected") ?? badRequest("Aktif mağaza bağlantısı bulunamadı.");
    conn.lastSyncAt = new Date().toISOString();
    commit(db);
    return ok({ message: "Senkronizasyon tamamlandı." });
  }
  const match = req.path.match(/^\/api\/seller\/connections\/([^/]+)$/);
  if (!match || req.method !== "DELETE") return null;
  const conn = db.connections.find((c) => c.userId === user.id && c.id === match[1]) ?? notFound("Bağlantı bulunamadı.");
  conn.status = "disconnected";
  conn.apiKey = "";
  commit(db);
  return noContent();
}

export function toDraftDto(d: StoredDraft) {
  return { id: d.id, commerceProductId: d.commerceProductId, label: d.label, ...d.data, source: d.source, aiModel: d.aiModel, createdAt: d.createdAt };
}

export function toSocialDraftDto(d: ZekaiDb["socialDrafts"][number]) {
  const { content, tone, purpose, platforms } = d.data as { content: unknown; tone: string; purpose: string; platforms: string[] };
  return { id: d.id, commerceProductId: d.commerceProductId, label: d.label, tone, purpose, platforms, content, isActive: d.isActive, source: d.source, aiModel: d.aiModel, createdAt: d.createdAt };
}

function draftRoutes(req: DemoRequest, userId: string, seller: CommerceSeller): DemoResult | null {
  const db = req.db;
  const newest = <T extends { createdAt: string }>(rows: T[]) => [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const product = req.path.match(/^\/api\/seller\/products\/([^/]+)\/(drafts|social-drafts|ai-artifacts)$/);
  if (product && req.method === "GET") {
    const id = decodeURIComponent(product[1]);
    if (product[2] === "drafts") return ok(newest(db.productDrafts.filter((d) => d.userId === userId && d.commerceProductId === id && d.status === "ready")).map(toDraftDto));
    if (product[2] === "social-drafts") return ok(newest(db.socialDrafts.filter((d) => d.userId === userId && d.commerceProductId === id && d.status === "ready")).map(toSocialDraftDto));
    return ok(newest(db.artifacts.filter((a) => a.userId === userId && a.commerceProductId === id && a.status === "ready")).map(toArtifactDto));
  }
  if (product && req.method === "POST" && product[2] === "social-drafts") {
    const input = body<{ label: string; tone: string; purpose: string; platforms: string[]; content: unknown; activate: boolean }>(req);
    const id = decodeURIComponent(product[1]);
    ownedProduct(db, seller, id);
    if (input.activate !== false) for (const d of db.socialDrafts) if (d.userId === userId && d.commerceProductId === id) d.isActive = false;
    const draft = {
      id: newId(), userId, commerceProductId: id, label: input.label || "Sosyal içerik", inputHash: "", status: "ready" as const, isActive: input.activate !== false,
      source: "manual", aiModel: null, createdAt: new Date().toISOString(),
      data: { tone: input.tone ?? "", purpose: input.purpose ?? "", platforms: input.platforms ?? [], content: input.content ?? {} },
    };
    db.socialDrafts.push(draft);
    commit(db);
    return ok(toSocialDraftDto(draft));
  }
  if (req.method === "GET" && req.path === "/api/seller/drafts") return ok(newest(db.productDrafts.filter((d) => d.userId === userId && d.status === "ready")).map(toDraftDto));
  if (req.method === "GET" && req.path === "/api/seller/social-drafts") return ok(newest(db.socialDrafts.filter((d) => d.userId === userId && d.status === "ready")).map(toSocialDraftDto));
  if (req.method === "GET" && req.path === "/api/seller/ai-artifacts") return ok(newest(db.artifacts.filter((a) => a.userId === userId && a.status === "ready")).map(toArtifactDto));
  const action = req.path.match(/^\/api\/seller\/(drafts|social-drafts|ai-artifacts)\/([^/]+?)(?:\/(restore|publish|activate))?$/);
  if (!action) return null;
  const [, kind, id, verb] = action;
  const table = kind === "drafts" ? db.productDrafts : kind === "social-drafts" ? db.socialDrafts : db.artifacts;
  const row = (table as { id: string; userId: string; status: string }[]).find((r) => r.id === id && r.userId === userId);
  const label = kind === "ai-artifacts" ? "AI çıktısı" : "Taslak";
  if (!row) notFound(`${label} bulunamadı.`);
  if (req.method === "DELETE" && !verb) { row.status = "archived"; commit(db); return ok({ message: `${label} arşivlendi.` }); }
  if (verb === "restore") { row.status = "ready"; commit(db); return ok({ message: `${label} geri yüklendi.` }); }
  if (verb === "activate" && kind === "social-drafts") {
    const target = row as ZekaiDb["socialDrafts"][number];
    for (const d of db.socialDrafts) if (d.userId === userId && d.commerceProductId === target.commerceProductId) d.isActive = d === target;
    commit(db);
    return ok({ message: "Aktif içerik güncellendi." });
  }
  if (verb === "publish" && kind === "drafts") {
    const draft = row as StoredDraft;
    const productRow = ownedProduct(db, seller, draft.commerceProductId);
    const images = (draft.data.images as { url: string }[] | undefined) ?? [];
    applyProductUpdate(productRow, { ...draft.data, clearOriginalPrice: draft.data.originalPrice === null, primaryImageUrl: images[0]?.url });
    productRow.published = true;
    commit(db);
    return ok({ message: "Taslak yayınlandı." });
  }
  return null;
}

export function toArtifactDto(a: ZekaiDb["artifacts"][number]) {
  return { id: a.id, commerceProductId: a.commerceProductId, artifactType: a.artifactType, label: a.label, payload: a.payload,
    aiModel: "demo-rule-engine", source: "demo", status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt, lastUsedAt: a.lastUsedAt };
}

function productRoutes(req: DemoRequest, seller: CommerceSeller): DemoResult | null {
  const db = req.db;
  if (req.path === "/api/seller/me" && req.method === "GET") {
    const { apiKey: _apiKey, ...profile } = seller;
    return ok(profile);
  }
  if (req.path === "/api/seller/products" && req.method === "GET") {
    return ok(db.commerce.products.filter((p) => p.sellerId === seller.id).map((p) => ({
      id: p.id, title: p.title, primaryImage: primaryImage(p), category: categoryName(p), price: p.price, stock: p.stock, isPublished: p.published, updatedAt: p.updatedAt,
    })));
  }
  const match = req.path.match(/^\/api\/seller\/products\/([^/]+)(?:\/(publish|publish-update|image))?$/);
  if (!match) return null;
  const product = ownedProduct(db, seller, decodeURIComponent(match[1]));
  if (!match[2] && req.method === "GET") return ok(toDetailDto(db, product));
  if ((!match[2] && req.method === "PUT") || (match[2] === "publish-update" && req.method === "POST")) {
    applyProductUpdate(product, body<Record<string, unknown>>(req));
    commit(db);
    return ok({ message: "Ürün güncellendi." });
  }
  if (match[2] === "publish" && req.method === "PUT") {
    product.published = Boolean(body<{ published: boolean }>(req).published);
    product.updatedAt = new Date().toISOString();
    commit(db);
    return ok({ message: product.published ? "Ürün yayınlandı." : "Ürün gizlendi." });
  }
  if (match[2] === "image" && req.method === "PUT") {
    const { imageBase64 = "", mimeType = "image/jpeg" } = body<{ imageBase64: string; mimeType: string }>(req);
    if (!imageBase64) badRequest("Görsel güncellenemedi.");
    const imageUrl = imageBase64.startsWith("data:") ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;
    product.images = [imageUrl, ...product.images.slice(1)];
    product.updatedAt = new Date().toISOString();
    commit(db);
    return ok({ imageUrl, message: "Görsel güncellendi." });
  }
  return null;
}

export function sellerRoutes(req: DemoRequest): DemoResult | null {
  if (!req.path.startsWith("/api/seller/")) return null;
  if (req.path.startsWith("/api/seller/connections")) return connectionRoutes(req);
  const { userId, seller } = activeStore(req);
  return draftRoutes(req, userId, seller) ?? productRoutes(req, seller);
}
