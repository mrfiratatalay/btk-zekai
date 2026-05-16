import type { Product, ProductPricePoint, ProductReview } from "@/types/product";

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

async function apiFetch<T>(path: string, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 30 } });
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

export const getProduct = (id: string) => apiFetch<ProductDetail>(`/api/products/${id}`);

export const getProductReviews = (id: string) =>
  apiFetch<ProductReview[]>(`/api/products/${id}/reviews`, []);

export const getProductPriceHistory = (id: string) =>
  apiFetch<ProductPricePoint[]>(`/api/products/${id}/price-history`, []);

export function mapProductDetailToProduct(product: ProductDetail): Product {
  const primaryImage = product.images[0] ?? product.primaryImage ?? "";
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
    thumbnails: product.images.length > 0 ? product.images : [primaryImage],
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
    image: product.primaryImage,
    thumbnails: [product.primaryImage],
    shortDescription: product.shortDescription,
    description: product.shortDescription,
    features: {},
    badges: [],
    stock: product.stock,
    cargoText: product.cargoText,
  };
}
