import { DB_VERSION, seedDb } from "./seed";

/**
 * The demo database: zekai_db tables plus the slice of akilli_market_db that ZekAI reads
 * through commerce-api. It lives in localStorage, so changes survive a refresh until the
 * visitor resets the demo. On the server (first render) it is an in-memory seed.
 */
export interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  role: "Buyer" | "Seller";
  passwordHash: string | null;
  profileName: string | null;
  onboarded: boolean;
}

export interface CommerceProduct {
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

export interface CommerceReview {
  id: number;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
  tags: string[];
  sellerReply: string | null;
}

export interface CommerceBundle {
  id: string;
  sellerId: string;
  primaryProductId: string;
  complementaryProductId: string;
  title: string;
  shortDescription: string;
  campaignText: string;
  ctaLabel: string;
  discountPercent: number;
  status: "Draft" | "Published" | "Archived";
  recommendationReason: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CommerceSeller {
  id: string;
  storeName: string;
  ownerName: string;
  trustScore: number;
  storeRating: number;
  totalReviewCount: number;
  fastShipping: boolean;
  returnDays: number;
  apiKey: string;
}

export interface StoredDraft {
  id: string;
  userId: string;
  commerceProductId: string;
  label: string;
  inputHash: string;
  status: "ready" | "archived";
  source: string;
  aiModel: string | null;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface Artifact {
  id: string;
  userId: string;
  commerceProductId: string;
  artifactType: "simulation" | "bundle_recommendation" | "image_generation";
  label: string;
  inputHash: string;
  payload: unknown;
  status: "ready" | "archived";
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export interface ZekaiDb {
  version: number;
  seq: number;
  users: DemoUser[];
  commerce: {
    sellers: CommerceSeller[];
    products: CommerceProduct[];
    reviews: CommerceReview[];
    bundles: CommerceBundle[];
    faqs: { id: number; productId: string; question: string; answer: string; categoryTag: string; sortOrder: number; createdAt: string }[];
  };
  connections: { id: string; userId: string; platform: string; sellerId: string; apiKey: string; status: "connected" | "disconnected"; lastSyncAt: string | null }[];
  analyses: Record<string, unknown>[];
  projects: { id: string; userId: string; externalId: string; title: string; goal: string | null; budget: number | null; createdAt: string; analysisIds: string[] }[];
  kombins: Record<string, unknown>[];
  analysisCache: { key: string; userId: string; result: unknown; expiresAt: string }[];
  productDrafts: StoredDraft[];
  socialDrafts: (StoredDraft & { isActive: boolean })[];
  artifacts: Artifact[];
  replyDrafts: Record<string, unknown>[];
  faqDrafts: Record<string, unknown>[];
}

const STORAGE_KEY = "zekai.demo.v1";
let cache: ZekaiDb | null = null;

export function nextSeq(db: ZekaiDb): number {
  db.seq += 1;
  return db.seq;
}

function readStorage(): ZekaiDb | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ZekaiDb;
    return parsed.version === DB_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function getDb(): ZekaiDb {
  if (!cache) cache = readStorage() ?? seedDb();
  return cache;
}

export function commit(db: ZekaiDb) {
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
    const storage = globalThis.localStorage;
    // Screens also keep finished analyses and the last simulation under their own keys.
    const screenKeys = Object.keys(storage ?? {}).filter((key) => key.startsWith("zekai:") || key.startsWith("zekai_sim_last_"));
    for (const key of [STORAGE_KEY, "zekai_token", "zekai_refresh_token", "zekai_user", ...screenKeys]) {
      storage?.removeItem(key);
    }
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
