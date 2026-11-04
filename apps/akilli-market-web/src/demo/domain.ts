import { categoryById } from "./catalog";
import type { DemoBundle, DemoCartItem, DemoDb, DemoProduct } from "./db";
import { notFound, round2 } from "./http";

/**
 * Commerce rules ported from commerce-api so the demo answers like the real services:
 * rating comes from reviews, only published products are public, and a bundle discount
 * is shared between its two products in proportion to their prices.
 */
export function primaryImage(product: DemoProduct): string {
  return product.images[0] ?? "";
}

export function findProduct(db: DemoDb, id: string): DemoProduct {
  return db.products.find((p) => p.id === id) ?? notFound("Ürün bulunamadı.");
}

export function findPublicProduct(db: DemoDb, id: string): DemoProduct {
  const product = findProduct(db, id);
  if (!product.published) notFound("Ürün bulunamadı.");
  return product;
}

function ratingOf(db: DemoDb, productId: string) {
  const reviews = db.reviews.filter((r) => r.productId === productId);
  const rating = reviews.length ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  return { rating, reviewCount: reviews.length };
}

export function toListDto(db: DemoDb, p: DemoProduct) {
  return {
    id: p.id, title: p.title, brand: p.brand, sellerName: p.sellerName, category: categoryById(p.categoryId).name,
    price: p.price, originalPrice: p.originalPrice, ...ratingOf(db, p.id), stock: p.stock,
    primaryImage: primaryImage(p), shortDescription: p.shortDescription, cargoText: p.cargoText,
  };
}

export function toDetailDto(db: DemoDb, p: DemoProduct) {
  return {
    id: p.id, title: p.title, brand: p.brand, sellerName: p.sellerName, category: categoryById(p.categoryId).name,
    price: p.price, originalPrice: p.originalPrice, ...ratingOf(db, p.id), stock: p.stock, images: [...p.images],
    shortDescription: p.shortDescription, description: p.description, features: { ...p.features },
    badges: [...p.badges], cargoText: p.cargoText, updatedAt: p.updatedAt,
  };
}

export function toReviewDto(db: DemoDb, reviewId: number) {
  const r = db.reviews.find((x) => x.id === reviewId)!;
  const reply = db.replies.find((x) => x.reviewId === r.id);
  return {
    id: r.id, authorName: r.authorName, rating: r.rating, title: r.title, text: r.text,
    verifiedPurchase: r.verifiedPurchase, date: r.date, helpfulCount: r.helpfulCount,
    tags: [...r.tags], sellerReply: reply?.replyText ?? null,
  };
}

export function bundleProducts(db: DemoDb, bundle: DemoBundle): [DemoProduct, DemoProduct] {
  return [findProduct(db, bundle.primaryProductId), findProduct(db, bundle.complementaryProductId)];
}

export function bundlePricing(primary: DemoProduct, extra: DemoProduct, discountPercent: number) {
  const originalTotal = primary.price + extra.price;
  const discountAmount = round2((originalTotal * discountPercent) / 100);
  return { originalTotal, discountAmount, bundleTotal: originalTotal - discountAmount };
}

/** Each product carries its price share of the bundle discount, rounded to kuruş. */
export function unitDiscount(product: DemoProduct, originalTotal: number, totalDiscount: number): number {
  return originalTotal <= 0 ? 0 : round2(totalDiscount * (product.price / originalTotal));
}

export function bundleProductDto(p: DemoProduct) {
  return {
    id: p.id, title: p.title, brand: p.brand, category: categoryById(p.categoryId).name,
    price: p.price, stock: p.stock, image: primaryImage(p),
  };
}

export function isPublicBundleVisible(db: DemoDb, bundle: DemoBundle): boolean {
  const primary = db.products.find((p) => p.id === bundle.primaryProductId);
  const extra = db.products.find((p) => p.id === bundle.complementaryProductId);
  return bundle.status === 1 && !!primary && !!extra && primary.stock > 0 && extra.stock > 0 && primary.published && extra.published;
}

export function toPublicBundleDto(db: DemoDb, bundle: DemoBundle) {
  const [primary, extra] = bundleProducts(db, bundle);
  return {
    id: bundle.id, title: bundle.title, shortDescription: bundle.shortDescription, campaignText: bundle.campaignText,
    ctaLabel: bundle.ctaLabel, discountPercent: bundle.discountPercent,
    primaryProduct: bundleProductDto(primary), complementaryProduct: bundleProductDto(extra),
    ...bundlePricing(primary, extra, bundle.discountPercent),
  };
}

export function buildCartItem(db: DemoDb, product: DemoProduct, quantity: number, bundle?: DemoBundle, discount = 0): DemoCartItem {
  db.seq += 1;
  return {
    id: db.seq, productId: product.id, title: product.title, price: product.price - discount,
    originalPrice: product.price, discountAmount: discount, image: primaryImage(product),
    quantity: Math.min(quantity, product.stock), stock: product.stock,
    bundleId: bundle?.id ?? null, bundleTitle: bundle?.title ?? null,
  };
}

/** Same slug rule as SellerService.GenerateSlug, so new product URLs look like seeded ones. */
export function slugify(title: string): string {
  const map: Record<string, string> = { ş: "s", ğ: "g", ü: "u", ö: "o", ı: "i", ç: "c" };
  const slug = title.toLocaleLowerCase("tr-TR").replace(/[şğüöıç]/g, (ch) => map[ch]).replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug.slice(0, 60);
}
