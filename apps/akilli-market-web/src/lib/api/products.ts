import type { Product, ProductReview } from "@/types/product";

export const API_BASE =
  process.env.NEXT_PUBLIC_COMMERCE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001";

export interface ProductListItem {
  id: string;
  title: string;
  brand: string;
  sellerName: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  primaryImage: string;
  shortDescription: string;
  cargoText: string;
}

export interface ProductDetail extends ProductListItem {
  images: string[];
  description: string;
  features: Record<string, string>;
  badges: string[];
  updatedAt: string;
}

export interface PublicBundleProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export interface PublicProductBundle {
  id: string;
  title: string;
  shortDescription: string;
  campaignText: string;
  ctaLabel: string;
  discountPercent: number;
  primaryProduct: PublicBundleProduct;
  complementaryProduct: PublicBundleProduct;
  originalTotal: number;
  discountAmount: number;
  bundleTotal: number;
}

async function apiFetch<T>(path: string, fallback?: T, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, init ?? { next: { revalidate: 30 } });
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  } catch {
    if (fallback !== undefined) return fallback;
    throw new Error("API bağlantısı kurulamadı.");
  }
}

function resolveImage(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export const getProducts = (params?: { category?: string; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<ProductListItem[]>(`/api/products${query}`, []);
};

export const getProduct = (id: string) =>
  apiFetch<ProductDetail>(`/api/products/${id}`, undefined, { cache: "no-store" });

export const getProductReviews = (id: string) =>
  apiFetch<ProductReview[]>(`/api/products/${id}/reviews`, []);

export async function postProductReview(
  productId: string,
  data: { rating: number; title: string; text: string; tags?: string[] },
): Promise<ProductReview> {
  const token = typeof window !== "undefined" ? localStorage.getItem("market_token") : null;
  if (!token) throw new Error("Yorum yapmak için giriş yapmalısınız.");
  const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (res.status === 409) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Bu ürün için zaten yorum yaptınız.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Yorum gönderilemedi.");
  }
  return res.json();
}

export const getProductBundles = (id: string) =>
  apiFetch<PublicProductBundle[]>(`/api/products/${id}/bundles`, [], { cache: "no-store" });

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const getCategories = () => apiFetch<Category[]>("/api/categories", []);

export function mapProductDetailToProduct(product: ProductDetail): Product {
  const primaryImage = resolveImage(product.images[0] ?? product.primaryImage);
  return {
    id: product.id,
    title: product.title,
    brand: product.brand,
    sellerName: product.sellerName,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    discountPercent: product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: primaryImage,
    thumbnails: (product.images.length > 0 ? product.images : [product.primaryImage]).map(resolveImage),
    shortDescription: product.shortDescription,
    description: product.description,
    features: product.features,
    badges: product.badges,
    stock: product.stock,
    cargoText: product.cargoText,
  };
}

export function mapProductListItemToProduct(product: ProductListItem): Product {
  return {
    id: product.id,
    title: product.title,
    brand: product.brand,
    sellerName: product.sellerName,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    discountPercent: product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : undefined,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: resolveImage(product.primaryImage),
    thumbnails: [resolveImage(product.primaryImage)],
    shortDescription: product.shortDescription,
    description: product.shortDescription,
    features: {},
    badges: [],
    stock: product.stock,
    cargoText: product.cargoText,
  };
}
