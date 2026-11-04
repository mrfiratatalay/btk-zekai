import { CATALOG, categoryById } from "./catalog";
import type { CommerceBundle, CommerceProduct, ZekaiDb } from "./db";
import { badRequest, notFound, ok, type DemoRequest, type DemoResult } from "./http";

/**
 * The slice of commerce-api that ZekAI uses, with the same rules as the real service:
 * rating and review count come from reviews, and unpublished products are not public.
 */
export function primaryImage(product: CommerceProduct): string {
  return product.images[0] ?? "";
}

export function findProduct(db: ZekaiDb, id: string): CommerceProduct {
  return db.commerce.products.find((p) => p.id === id) ?? notFound("Ürün bulunamadı.");
}

export function reviewsOf(db: ZekaiDb, productId: string) {
  return db.commerce.reviews.filter((r) => r.productId === productId);
}

export function ratingOf(db: ZekaiDb, productId: string) {
  const reviews = reviewsOf(db, productId);
  const rating = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  return { rating, reviewCount: reviews.length };
}

export function categoryName(product: CommerceProduct): string {
  return categoryById(product.categoryId).name;
}

export function toDetailDto(db: ZekaiDb, p: CommerceProduct) {
  return {
    id: p.id, title: p.title, brand: p.brand, sellerName: p.sellerName, category: categoryName(p),
    price: p.price, originalPrice: p.originalPrice, ...ratingOf(db, p.id), stock: p.stock,
    primaryImage: primaryImage(p), images: [...p.images], shortDescription: p.shortDescription,
    description: p.description, features: { ...p.features }, badges: [...p.badges], cargoText: p.cargoText, updatedAt: p.updatedAt,
  };
}

export function toListDto(db: ZekaiDb, p: CommerceProduct) {
  return {
    id: p.id, title: p.title, brand: p.brand, sellerName: p.sellerName, category: categoryName(p),
    price: p.price, originalPrice: p.originalPrice, ...ratingOf(db, p.id), stock: p.stock,
    primaryImage: primaryImage(p), shortDescription: p.shortDescription, cargoText: p.cargoText,
  };
}

export function toReviewDto(r: ZekaiDb["commerce"]["reviews"][number]) {
  return {
    id: r.id, authorName: r.authorName, rating: r.rating, title: r.title, text: r.text,
    verifiedPurchase: r.verifiedPurchase, date: r.date, helpfulCount: r.helpfulCount, tags: [...r.tags], sellerReply: r.sellerReply,
  };
}

export function bundleProductDto(p: CommerceProduct) {
  return { id: p.id, title: p.title, brand: p.brand, category: categoryName(p), price: p.price, stock: p.stock, image: primaryImage(p) };
}

export function bundlePricing(primary: CommerceProduct, extra: CommerceProduct, discountPercent: number) {
  const originalTotal = primary.price + extra.price;
  const discountAmount = Math.round(originalTotal * discountPercent) / 100;
  return { originalTotal, discountAmount, bundleTotal: originalTotal - discountAmount };
}

export function toBundleDto(db: ZekaiDb, b: CommerceBundle) {
  const primary = findProduct(db, b.primaryProductId);
  const extra = findProduct(db, b.complementaryProductId);
  return {
    id: b.id, title: b.title, shortDescription: b.shortDescription, campaignText: b.campaignText, ctaLabel: b.ctaLabel,
    discountPercent: b.discountPercent, status: b.status, recommendationReason: b.recommendationReason, score: b.score,
    primaryProduct: bundleProductDto(primary), complementaryProduct: bundleProductDto(extra),
    ...bundlePricing(primary, extra, b.discountPercent), createdAt: b.createdAt, updatedAt: b.updatedAt, publishedAt: b.publishedAt,
  };
}

/** Routes the frontend calls on commerce-api directly (product pages and link lookup). */
export function commerceRoutes(req: DemoRequest): DemoResult | null {
  const db = req.db;
  if (req.method === "POST" && req.path === "/api/revalidate") return ok({ revalidated: true });
  if (req.method !== "GET") return null;
  if (req.path === "/api/categories") return ok(CATALOG.categories);
  if (req.path === "/api/products") {
    const search = req.query.get("search")?.toLocaleLowerCase("tr-TR");
    const category = req.query.get("category");
    return ok(db.commerce.products
      .filter((p) => p.published && (!category || categoryById(p.categoryId).slug === category))
      .filter((p) => !search || p.title.toLocaleLowerCase("tr-TR").includes(search))
      .map((p) => toListDto(db, p)));
  }
  if (req.path === "/api/products/from-url") {
    const match = (req.query.get("url") ?? "").match(/\/(?:product|urun|products)\/([^/?#]+)/i);
    if (!match) badRequest("url parametresi zorunludur.");
    const product = findProduct(db, decodeURIComponent(match[1]));
    if (!product.published) notFound("Ürün bulunamadı.");
    return ok(toDetailDto(db, product));
  }
  const match = req.path.match(/^\/api\/products\/([^/]+)(\/reviews)?$/);
  if (!match) return null;
  const product = findProduct(db, decodeURIComponent(match[1]));
  if (match[2]) return ok(reviewsOf(db, product.id).sort((a, b) => b.helpfulCount - a.helpfulCount).map(toReviewDto));
  if (!product.published) notFound("Ürün bulunamadı.");
  return ok(toDetailDto(db, product));
}
