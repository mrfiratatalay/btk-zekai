import { commerceFetch } from "./commerce-client";
import type { Product } from "@/types/product";
const apiFetch = commerceFetch;

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

export interface ProductReview {
  id: number;
  rating: number;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
  tags: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const getProducts = (params?: { category?: string; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<ProductListItem[]>(`/api/products${query}`);
};

export const getProduct = (id: string) =>
  apiFetch<ProductDetail>(`/api/products/${id}`);

export const getProductReviews = (id: string) =>
  apiFetch<ProductReview[]>(`/api/products/${id}/reviews`);

export const getCategories = () =>
  apiFetch<Category[]>("/api/categories");

export function mapProductDetailToProduct(product: ProductDetail): Product {
  const primaryImage = product.images[0] ?? "";
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
