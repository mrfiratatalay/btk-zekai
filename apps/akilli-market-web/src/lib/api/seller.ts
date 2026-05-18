import { apiFetch } from "./client";

export interface SellerProfile {
  id: string;
  storeName: string;
  ownerName: string;
  trustScore: number;
  storeRating: number;
  totalReviewCount: number;
  fastShipping: boolean;
  returnDays: number;
}

export interface SellerProduct {
  id: string;
  title: string;
  primaryImage: string;
  category: string;
  price: number;
  stock: number;
  sales30d: number;
  returnRate: number;
  conversionRate: number;
  healthScore: number;
  lostProfitMonthly: number;
  improvableRevenueMonthly: number;
  status: string;
  mainIssue: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  title: string;
  brand: string;
  categoryId: number;
  price: number;
  originalPrice?: number;
  shortDescription: string;
  description: string;
  cargoText: string;
  stock: number;
  primaryImageUrl?: string;
  features?: Record<string, string>;
}

export async function getSellerProfile(): Promise<SellerProfile> {
  return apiFetch("/api/seller/me");
}

export async function getSellerProducts(): Promise<SellerProduct[]> {
  return apiFetch("/api/seller/products");
}

export async function getSellerProduct(id: string): Promise<SellerProduct> {
  return apiFetch(`/api/seller/products/${id}`);
}

export async function createProduct(data: CreateProductPayload): Promise<SellerProduct> {
  return apiFetch("/api/seller/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface UpdateProductPayload {
  title?: string;
  shortDescription?: string;
  description?: string;
  features?: Record<string, string>;
  price?: number;
  originalPrice?: number | null;
  clearOriginalPrice?: boolean;
  stock?: number;
  brand?: string;
  cargoText?: string;
  categoryId?: number;
  primaryImageUrl?: string;
}

export async function updateProduct(id: string, data: UpdateProductPayload): Promise<void> {
  await apiFetch(`/api/seller/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateProductImage(id: string, imageBase64: string, mimeType: string): Promise<{ imageUrl: string }> {
  return apiFetch(`/api/seller/products/${id}/image`, {
    method: "PUT",
    body: JSON.stringify({ imageBase64, mimeType }),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/api/seller/products/${id}`, { method: "DELETE" });
}

export async function getApiKey(): Promise<string> {
  const res = await apiFetch<{ apiKey: string }>("/api/seller/apikey");
  return res.apiKey;
}

export async function regenerateApiKey(): Promise<string> {
  const res = await apiFetch<{ apiKey: string }>("/api/seller/apikey/regenerate", { method: "POST" });
  return res.apiKey;
}
