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
  isPublished: boolean;
  updatedAt: string;
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

export const updateProductContent = async (
  id: string,
  data: {
    title?: string;
    shortDescription?: string;
    description?: string;
    features?: string[];
    price?: number;
    stock?: number;
  },
  options: { publish: boolean } = { publish: false },
): Promise<{ message: string }> => {
  const result = await apiFetch<{ message: string }>(`/api/seller/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  // Sadece "Yayınla" seçildiğinde Akıllı Market cache'ini temizle
  if (options.publish) {
    const commerceWebUrl = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";
    try {
      await fetch(
        `${commerceWebUrl}/api/revalidate?secret=zekai-revalidate-2024&productId=${encodeURIComponent(id)}`,
        { method: "POST" },
      );
    } catch {
      // Revalidation başarısız olsa da kayıt tamamdır
    }
  }

  return result;
};


