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

export async function updateProduct(id: string, data: Partial<{ title: string; description: string; price: number; stock: number }>): Promise<void> {
  await apiFetch(`/api/seller/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
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
