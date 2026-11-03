import { CATALOG } from "./catalog";

/**
 * The demo database: a JSON snapshot that mirrors the commerce-api tables and lives in
 * localStorage, so every change survives a refresh until the visitor resets the demo.
 */
export interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  role: "Buyer" | "Seller";
  /** Seed accounts accept the documented demo password; registered ones store a salted hash. */
  passwordHash: string | null;
  createdAt: string;
}

export interface DemoSeller {
  id: string;
  userId: string;
  storeName: string;
  ownerName: string;
  trustScore: number;
  storeRating: number;
  totalReviewCount: number;
  fastShipping: boolean;
  returnDays: number;
  apiKey: string;
}

export interface DemoProduct {
  id: string;
  title: string;
  brand: string;
  sellerName: string;
  categoryId: number;
  price: number;
  originalPrice: number | null;
  stock: number;
  shortDescription: string;
  description: string;
  features: Record<string, string>;
  badges: string[];
  cargoText: string;
  images: string[];
  sellerId: string | null;
  published: boolean;
  updatedAt: string;
}

export interface DemoReview {
  id: number;
  productId: string;
  userId: string | null;
  authorName: string;
  rating: number;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
  tags: string[];
}

/** 0 = Draft, 1 = Published, 2 = Archived, as in the ProductBundleStatus enum. */
export interface DemoBundle {
  id: string;
  sellerId: string;
  primaryProductId: string;
  complementaryProductId: string;
  title: string;
  shortDescription: string;
  campaignText: string;
  ctaLabel: string;
  discountPercent: number;
  status: 0 | 1 | 2;
  recommendationReason: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoCartItem {
  id: number;
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  discountAmount: number;
  image: string;
  quantity: number;
  stock: number;
  bundleId: string | null;
  bundleTitle: string | null;
}

export interface DemoOrderItem {
  productId: string;
  title: string;
  sellerName: string;
  bundleId: string | null;
  bundleTitle: string | null;
  originalUnitPrice: number;
  discountAmount: number;
  price: number;
  quantity: number;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  status: "Pending" | "Delivered" | "Completed";
  deliveryAddress: string;
  paymentMethod: string;
  orderedAt: string;
  deliveredAt: string | null;
  items: DemoOrderItem[];
}

export interface DemoDb {
  version: number;
  seq: number;
  users: DemoUser[];
  sellers: DemoSeller[];
  products: DemoProduct[];
  reviews: DemoReview[];
  replies: { id: number; reviewId: number; replyText: string; createdAt: string }[];
  faqs: { id: number; productId: string; question: string; answer: string; categoryTag: string; sortOrder: number; createdAt: string }[];
  bundles: DemoBundle[];
  carts: Record<string, { id: string; items: DemoCartItem[] }>;
  favorites: { userId: string; productId: string; addedAt: string }[];
  orders: DemoOrder[];
}

const STORAGE_KEY = "akilli-market.demo.v1";
const VERSION = 1;
export const BUYER_EMAIL = "burak@ornekstore.com";
export const SELLER_EMAIL = "mehmet@ornekstore.com";

let cache: DemoDb | null = null;

export function daysAgo(days: number, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nextSeq(db: DemoDb): number {
  db.seq += 1;
  return db.seq;
}

function seedUsersAndSellers(db: DemoDb) {
  CATALOG.sellers.forEach((s, index) => {
    const userId = `00000000-0000-4000-8000-0000000000${String(index + 10)}`;
    db.users.push({ id: userId, email: s.email, fullName: s.ownerName, role: "Seller", passwordHash: null, createdAt: daysAgo(120) });
    db.sellers.push({ ...s, id: `00000000-0000-4000-9000-0000000000${String(index + 10)}`, userId });
  });
  CATALOG.buyers.forEach((b, index) => {
    db.users.push({
      id: `00000000-0000-4000-8000-00000000000${index + 1}`,
      email: b.email, fullName: b.fullName, role: "Buyer", passwordHash: null, createdAt: daysAgo(90),
    });
  });
}

function seedCatalog(db: DemoDb) {
  for (const p of CATALOG.products) {
    const seller = db.sellers.find((s) => s.storeName === p.sellerName) ?? null;
    const { reviews, ...product } = p;
    db.products.push({ ...product, sellerId: seller?.id ?? null, published: true, updatedAt: daysAgo(6) });
    for (const r of reviews) {
      const { daysAgo: age, ...review } = r;
      db.reviews.push({ ...review, id: nextSeq(db), productId: p.id, userId: null, date: daysAgo(age, 10 + (db.seq % 9)) });
    }
  }
  const mehmet = db.sellers.find((s) => s.storeName === "Mehmet Elektronik")!;
  for (const b of CATALOG.bundles) {
    db.bundles.push({ ...b, id: newId(), sellerId: mehmet.id, ctaLabel: "Paketi Sepete Ekle", status: 1, createdAt: daysAgo(9), updatedAt: daysAgo(9) });
  }
}

/** Burak starts with real history: one delivered order, one on its way and two favourites. */
function seedBuyerHistory(db: DemoDb) {
  const burak = db.users.find((u) => u.email === BUYER_EMAIL)!;
  const product = (id: string) => db.products.find((p) => p.id === id)!;
  const grinder = product("kahve-degirmeni-burr");
  db.orders.push({
    id: newId(), orderNumber: `ZK-${Math.floor(Date.parse(daysAgo(18)) / 1000)}`, buyerId: burak.id,
    subtotal: grinder.price, discountTotal: 0, total: grinder.price, status: "Delivered",
    deliveryAddress: "Atatürk Mah. Çiçek Sok. No: 12 D: 5, Kadıköy / İstanbul", paymentMethod: "Kredi Kartı",
    orderedAt: daysAgo(18, 20), deliveredAt: daysAgo(15, 14),
    items: [{ productId: grinder.id, title: grinder.title, sellerName: grinder.sellerName, bundleId: null, bundleTitle: null, originalUnitPrice: grinder.price, discountAmount: 0, price: grinder.price, quantity: 1 }],
  });
  const bundle = db.bundles[0];
  const [primary, extra] = [product(bundle.primaryProductId), product(bundle.complementaryProductId)];
  const original = primary.price + extra.price;
  const discount = Math.round(original * bundle.discountPercent) / 100;
  const share = (price: number) => Math.round(discount * (price / original) * 100) / 100;
  db.orders.push({
    id: newId(), orderNumber: `ZK-${Math.floor(Date.parse(daysAgo(2)) / 1000)}`, buyerId: burak.id,
    subtotal: original, discountTotal: share(primary.price) + share(extra.price), total: original - share(primary.price) - share(extra.price),
    status: "Pending", deliveryAddress: "Atatürk Mah. Çiçek Sok. No: 12 D: 5, Kadıköy / İstanbul", paymentMethod: "Kredi Kartı",
    orderedAt: daysAgo(2, 11), deliveredAt: null,
    items: [primary, extra].map((p) => ({
      productId: p.id, title: p.title, sellerName: p.sellerName, bundleId: bundle.id, bundleTitle: bundle.title,
      originalUnitPrice: p.price, discountAmount: share(p.price), price: p.price - share(p.price), quantity: 1,
    })),
  });
  db.favorites.push(
    { userId: burak.id, productId: "akilli-saat-fit-neo", addedAt: daysAgo(4) },
    { userId: burak.id, productId: "hava-temizleyici-mini", addedAt: daysAgo(1) },
  );
}

export function initialDb(): DemoDb {
  const db: DemoDb = {
    version: VERSION, seq: 0, users: [], sellers: [], products: [], reviews: [], replies: [], faqs: [],
    bundles: [], carts: {}, favorites: [], orders: [],
  };
  seedUsersAndSellers(db);
  seedCatalog(db);
  seedBuyerHistory(db);
  return db;
}

function readStorage(): DemoDb | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoDb;
    return parsed.version === VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function getDb(): DemoDb {
  if (!cache) cache = readStorage() ?? initialDb();
  return cache;
}

export function commit(db: DemoDb) {
  cache = db;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage can be full or blocked (private mode); the demo keeps working in memory.
  }
}

/** Clears demo data and the session, so the next page load starts from the seed again. */
export function resetDemoData() {
  cache = null;
  try {
    for (const key of [STORAGE_KEY, "market_token", "market_refresh_token", "market_user"]) {
      globalThis.localStorage?.removeItem(key);
    }
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
