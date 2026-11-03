import raw from "./catalog.json";

/** Shapes of catalog.json, which is generated from the commerce-api DataSeeder. */
export interface CatalogReview {
  authorName: string;
  rating: number;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  daysAgo: number;
  helpfulCount: number;
  tags: string[];
}

export interface CatalogProduct {
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
  reviews: CatalogReview[];
}

export interface CatalogSeller {
  email: string;
  storeName: string;
  ownerName: string;
  trustScore: number;
  storeRating: number;
  totalReviewCount: number;
  fastShipping: boolean;
  returnDays: number;
  apiKey: string;
}

export interface CatalogBundle {
  primaryProductId: string;
  complementaryProductId: string;
  title: string;
  shortDescription: string;
  campaignText: string;
  discountPercent: number;
  recommendationReason: string;
  score: number;
}

export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
}

interface Catalog {
  categories: CatalogCategory[];
  sellers: CatalogSeller[];
  buyers: { email: string; fullName: string }[];
  products: CatalogProduct[];
  bundles: CatalogBundle[];
}

export const CATALOG = raw as unknown as Catalog;

export function categoryById(id: number): CatalogCategory {
  return CATALOG.categories.find((c) => c.id === id) ?? CATALOG.categories[0];
}
