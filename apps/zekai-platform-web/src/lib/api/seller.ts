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
  status: "Urgent" | "Watch" | "Healthy";
  mainIssue: string;
  updatedAt: string;
}

export interface KpiDto {
  label: string;
  value: string;
  note: string;
  tone: "neutral" | "warning" | "danger" | "success";
}


export interface StoreConnection {
  platform: string;
  storeName: string;
  status: string;
  lastSyncAt: string | null;
  productCount: number;
}

export const getSellerProfile = () => apiFetch<SellerProfile>("/api/seller/me");

export const getSellerStore = () => apiFetch<StoreConnection>("/api/seller/store");

export const connectStore = (platform: string, apiKey: string) =>
  apiFetch<StoreConnection>("/api/seller/store/connect", {
    method: "POST",
    body: JSON.stringify({ platform, apiKey }),
  });

export const syncStore = () =>
  apiFetch<{ message: string }>("/api/seller/store/sync", { method: "POST" });

export const getSellerProducts = () => apiFetch<SellerProduct[]>("/api/seller/products");

export const getSellerProduct = (id: string) =>
  apiFetch<SellerProduct>(`/api/seller/products/${id}`);

export const updateProductContent = (
  id: string,
  data: { title?: string; description?: string; price?: number; stock?: number },
) =>
  apiFetch<{ message: string }>(`/api/seller/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const getSellerKpis = () => apiFetch<KpiDto[]>("/api/seller/analytics/kpis");

