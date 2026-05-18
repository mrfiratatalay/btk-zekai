export type StorePlatform =
  | "demo-store"
  | "trendyol"
  | "hepsiburada"
  | "shopify"
  | "woocommerce";

export type StoreConnectionStatus = "connected" | "coming-soon" | "not-connected";

export type StoreConnection = {
  id: string;
  platform: StorePlatform;
  storeName: string;
  status: StoreConnectionStatus;
  lastSyncAt?: string;
  productCount?: number;
};

export type SellerProductPerformance = {
  id: string;
  title: string;
  image: string;
  brand: string;
  category: string;
  categoryId: number;
  price: number;
  originalPrice: number | null;
  stock: number;
  cargoText: string;
  updatedAt: string;
  description: string;
  shortDescription: string;
  features: Record<string, string>;
};

export type SyntheticPersonaDecision = "buy" | "skip" | "undecided";

export type SyntheticPersonaFocusArea =
  | "image"
  | "title"
  | "price"
  | "rating"
  | "reviews"
  | "features"
  | "shipping"
  | "warranty"
  | "cta";

export type SyntheticPersona = {
  id: string;
  name: string;
  age: number;
  segment: string;
  decision: SyntheticPersonaDecision;
  reason: string;
  caresAbout: string;
  profile: string;
  lookedAt: string[];
  recommendation: string;
  monologue: string;
  city: string;
  focusArea: SyntheticPersonaFocusArea;
  focusLabel: string;
  bubbleText: string;
};
