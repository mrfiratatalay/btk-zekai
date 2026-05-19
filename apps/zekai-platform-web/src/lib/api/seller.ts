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
  id: string;
  platform: string;
  storeName: string;
  status: string;
  lastSyncAt: string | null;
  productCount: number;
  hasApiKey: boolean;
}

export const getSellerProfile = () => apiFetch<SellerProfile>("/api/seller/me");

export const getStoreConnections = () =>
  apiFetch<StoreConnection[]>("/api/seller/connections");

export const connectStore = (storeApiKey: string, storeName: string, platform = "DemoStore") =>
  apiFetch<StoreConnection>("/api/seller/connections", {
    method: "POST",
    // Backend DTO: StoreConnectRequest(Platform, ApiKey, StoreName) — apiKey olmalı, storeApiKey değil
    body: JSON.stringify({ apiKey: storeApiKey, storeName, platform }),
  });

export const disconnectStore = (connectionId: string) =>
  apiFetch<void>(`/api/seller/connections/${connectionId}`, { method: "DELETE" });

export const getSellerProducts = (refresh = false) => {
  const query = refresh ? `?_=${Date.now()}` : "";
  return apiFetch<SellerProduct[]>(`/api/seller/products${query}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
};

export const getSellerProduct = (id: string) =>
  apiFetch<SellerProduct>(`/api/seller/products/${id}`);

export type SocialPlatform = "instagram" | "tiktok" | "twitter";
export type SocialTone = "profesyonel" | "samimi" | "mizahi";
export type SocialPurpose = "satis" | "guven" | "tanitim";

export interface SocialInstagramContent {
  caption: string;
  hashtags: string[];
  cta: string;
  overlayText: string;
}

export interface SocialTiktokScene {
  title: string;
  description: string;
}

export interface SocialTiktokContent {
  hook: string;
  scenes: SocialTiktokScene[];
  caption: string;
  hashtags: string[];
}

export interface SocialTwitterContent {
  post: string;
  hashtags: string[];
  cta: string;
}

export interface SocialMediaContent {
  tone: string;
  purpose: string;
  platforms: SocialPlatform[];
  instagram: SocialInstagramContent | null;
  tiktok: SocialTiktokContent | null;
  twitter: SocialTwitterContent | null;
  generatedAt: string;
  draftId?: string;
  artifactId?: string;
  _cached?: boolean;
  _mock?: boolean;
}

export interface GenerateSocialContentPayload {
  tone: SocialTone;
  purpose: SocialPurpose;
  platforms: SocialPlatform[];
}

export const generateSocialContent = (productId: string, payload: GenerateSocialContentPayload) =>
  apiFetch<SocialMediaContent>(`/api/seller/products/${productId}/social-content`, {
    method: "POST",
    body: JSON.stringify(payload),
    suppressMockMode: true,
  });

export interface BundleProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export interface ProductBundle {
  id: string;
  title: string;
  shortDescription: string;
  campaignText: string;
  ctaLabel: string;
  discountPercent: number;
  status: "Draft" | "Published" | "Archived";
  recommendationReason: string;
  score: number;
  primaryProduct: BundleProduct;
  complementaryProduct: BundleProduct;
  originalTotal: number;
  discountAmount: number;
  bundleTotal: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface BundleRecommendation {
  primaryProduct: BundleProduct;
  complementaryProduct: BundleProduct;
  suggestedTitle: string;
  suggestedShortDescription: string;
  suggestedCampaignText: string;
  suggestedCtaLabel: string;
  suggestedDiscountPercent: number;
  recommendationReason: string;
  score: number;
  originalTotal: number;
  discountAmount: number;
  bundleTotal: number;
}

export interface MissingBundleOpportunity {
  title: string;
  message: string;
  suggestedProductIdeas: string[];
}

export interface BundleRecommendationResponse {
  recommendations: BundleRecommendation[];
  missingOpportunity: MissingBundleOpportunity | null;
  artifactId?: string;
  _mock?: boolean;
  _cached?: boolean;
}

export interface CreateProductBundlePayload {
  complementaryProductId: string;
  title: string;
  shortDescription: string;
  campaignText: string;
  ctaLabel: string;
  discountPercent: number;
  recommendationReason: string;
  score: number;
  publish: boolean;
}

export interface UpdateProductBundlePayload {
  title?: string;
  shortDescription?: string;
  campaignText?: string;
  ctaLabel?: string;
  discountPercent?: number;
}

export const getSellerProductBundles = (productId: string) =>
  apiFetch<ProductBundle[]>(`/api/seller/products/${productId}/bundles`).then(data => data ?? []);

export const generateBundleRecommendations = (productId: string, options?: { force?: boolean }) =>
  apiFetch<BundleRecommendationResponse>(`/api/seller/products/${productId}/bundle-recommendations`, {
    method: "POST",
    body: JSON.stringify({ force: options?.force ?? false }),
  });

export const createProductBundle = (productId: string, data: CreateProductBundlePayload) =>
  apiFetch<ProductBundle>(`/api/seller/products/${productId}/bundles`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProductBundle = (productId: string, bundleId: string, data: UpdateProductBundlePayload) =>
  apiFetch<ProductBundle>(`/api/seller/products/${productId}/bundles/${bundleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const publishProductBundle = (productId: string, bundleId: string, published = true) =>
  apiFetch<ProductBundle>(`/api/seller/products/${productId}/bundles/${bundleId}/publish`, {
    method: "POST",
    body: JSON.stringify({ published }),
  });

export const archiveProductBundle = (productId: string, bundleId: string) =>
  apiFetch<void>(`/api/seller/products/${productId}/bundles/${bundleId}/archive`, {
    method: "POST",
    body: JSON.stringify({}),
  });

export interface AiGeneratedContent {
  title: string;
  shortDescription: string;
  description: string;
  features: string[];
  whatIImproved: string;
  draftId?: string;
  artifactId?: string;
  _cached?: boolean;
  _mock?: boolean;
}

/** AI features (string[]) → Record<string,string> (indexed bullets) */
export function aiFeaturesToRecord(features: string[]): Record<string, string> {
  return Object.fromEntries(features.map((f, i) => [String(i), f]));
}

export interface SimulationInsight {
  buyCount: number;
  skipCount: number;
  undecidedCount: number;
  skipperReasons: string[];
  undecidedConcerns: string[];
  recommendations: string[];
}

export const generateAiContent = (productId: string, simulationInsight?: SimulationInsight) =>
  apiFetch<AiGeneratedContent>(`/api/seller/products/${productId}/ai-content`, {
    method: "POST",
    body: simulationInsight ? JSON.stringify({ simulationInsight }) : undefined,
  });

export interface SimulatedPersona {
  id: string;
  name: string;
  age: number;
  city: string;
  segment: string;
  profile: string;
  caresAbout: string;
  decision: "buy" | "skip" | "undecided";
  reason: string;
  lookedAt: string[];
  recommendation: string;
  monologue: string;
  focusArea?: string;
  focusLabel?: string;
  bubbleText?: string;
}

export interface SimulationResult {
  personas: SimulatedPersona[];
  artifactId?: string;
  _cached?: boolean;
  _mock?: boolean;
}

export const simulateProduct = (productId: string) =>
  apiFetch<SimulationResult>(`/api/seller/products/${productId}/simulate`, {
    method: "POST",
  });

export type SimulationStreamEvent =
  | { type: "step"; message: string }
  | { type: "persona"; persona: SimulatedPersona }
  | { type: "done"; artifactId?: string; _cached?: boolean }
  | { type: "error"; message: string };

import { useMockStore } from "@/lib/store/mock-store";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("zekai_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const ZEKAI_API_URL =
  process.env.NEXT_PUBLIC_ZEKAI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5002";

export async function streamSimulateProduct(
  productId: string,
  onEvent: (event: SimulationStreamEvent) => void,
): Promise<void> {
  const response = await fetch(
    `${ZEKAI_API_URL}/api/seller/products/${productId}/simulate-stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...getAuthHeaders(),
      },
      signal: AbortSignal.timeout(180_000),
    },
  );

  if (!response.ok || !response.body) {
    throw new Error(`Simulation stream failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const json = line.replace(/^data:\s*/, "").trim();
      if (!json) continue;
      try {
        const parsed = JSON.parse(json);
        if (parsed && typeof parsed === "object" && parsed.type === "mock_notice") {
          useMockStore.getState().triggerMockMode();
          continue;
        }
        onEvent(parsed as SimulationStreamEvent);
      } catch {
        // skip malformed
      }
    }
  }
}

export interface GeneratedProductImage {
  imageBase64: string;
  mimeType: string;
  description: string;
  artifactId?: string;
  _cached?: boolean;
  _mock?: boolean;
}

export interface GeneratedProductImageItem {
  type: "studio" | "unboxing" | "lifestyle";
  label: string;
  imageBase64: string;
  mimeType: string;
  artifactId?: string;
  _cached?: boolean;
}

export interface GeneratedProductImagesResponse {
  images: GeneratedProductImageItem[];
  artifactId?: string;
  _cached?: boolean;
  _mock?: boolean;
}

export type ProductImageStyle = "studio" | "unboxing" | "lifestyle";

export const IMAGE_STYLE_LABELS: Record<ProductImageStyle, string> = {
  studio: "Stüdyo",
  unboxing: "Kutu Açma",
  lifestyle: "Kullanım",
};

// On-demand tek görsel — istenen stil için üretir (aynı ürün+stil backend'de cache'lenir)
export const generateProductImage = async (
  productId: string,
  style: ProductImageStyle = "studio",
): Promise<GeneratedProductImageItem> => {
  const res = await apiFetch<GeneratedProductImage>(
    `/api/seller/products/${productId}/ai-image`,
    { method: "POST", body: JSON.stringify({ style }) },
  );
  return {
    type: style,
    label: IMAGE_STYLE_LABELS[style],
    imageBase64: res.imageBase64,
    mimeType: res.mimeType,
    artifactId: res.artifactId,
    _cached: res._cached,
  };
};

export const generateProductImages = (productId: string) =>
  apiFetch<GeneratedProductImagesResponse>(`/api/seller/products/${productId}/ai-images`, {
    method: "POST",
  });

export const applyProductImage = (productId: string, imageBase64: string, mimeType: string) =>
  apiFetch<{ imageUrl: string; message: string }>(`/api/seller/products/${productId}/image`, {
    method: "PUT",
    body: JSON.stringify({ imageBase64, mimeType }),
  });

export const publishProduct = (productId: string, published = true) =>
  apiFetch<{ message: string }>(`/api/seller/products/${productId}/publish`, {
    method: "PUT",
    body: JSON.stringify({ published }),
  });

export const updateProductContent = async (
  id: string,
  data: {
    title?: string;
    shortDescription?: string;
    description?: string;
    features?: Record<string, string>;
    price?: number;
    stock?: number;
    brand?: string;
    originalPrice?: number | null;
    clearOriginalPrice?: boolean;
    cargoText?: string;
    categoryId?: number;
  },
  options: { publish: boolean } = { publish: false },
): Promise<{ message: string }> => {
  const result = await apiFetch<{ message: string }>(`/api/seller/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (options.publish) {
    // IsPublished = true → Akıllı Market'e yayınla
    await publishProduct(id, true);

    // Next.js cache temizle
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

// ── Ürün Taslakları (AI çıktısı DB'de saklanır → ücretsiz tekrar yayın) ──────

export interface DraftImage {
  type: string;
  label: string;
  url: string;
}

export interface ProductDraft {
  id: string;
  commerceProductId: string;
  label: string;
  title: string;
  shortDescription: string;
  description: string;
  features: Record<string, string>;
  price: number;
  originalPrice: number | null;
  stock: number;
  brand: string;
  cargoText: string;
  categoryId: number;
  images: DraftImage[];
  source?: string;
  aiModel?: string | null;
  createdAt: string;
}

export const getProductDrafts = (productId: string) =>
  apiFetch<ProductDraft[]>(`/api/seller/products/${productId}/drafts`);

export const getAllDrafts = () => apiFetch<ProductDraft[]>(`/api/seller/drafts`);

export const deleteDraft = (draftId: string) =>
  apiFetch<{ message: string }>(`/api/seller/drafts/${draftId}`, { method: "DELETE" });

export const publishDraft = async (
  draftId: string,
  commerceProductId: string,
): Promise<{ message: string }> => {
  const result = await apiFetch<{ message: string }>(
    `/api/seller/drafts/${draftId}/publish`,
    { method: "POST" },
  );
  // Akıllı Market Next.js cache temizle
  const commerceWebUrl = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";
  try {
    await fetch(
      `${commerceWebUrl}/api/revalidate?secret=zekai-revalidate-2024&productId=${encodeURIComponent(commerceProductId)}`,
      { method: "POST" },
    );
  } catch {
    // Revalidation başarısız olsa da yayın tamamdır
  }
  return result;
};

// ── Sosyal Medya Taslakları (markete gitmez; DB'de varyasyon saklama) ────────

export interface SocialDraft {
  id: string;
  commerceProductId: string;
  label: string;
  tone: string;
  purpose: string;
  platforms: string[];
  content: SocialMediaContent;
  isActive: boolean;
  source?: string;
  aiModel?: string | null;
  createdAt: string;
}

export const getProductSocialDrafts = (productId: string) =>
  apiFetch<SocialDraft[]>(`/api/seller/products/${productId}/social-drafts`);

export const getAllSocialDrafts = () =>
  apiFetch<SocialDraft[]>(`/api/seller/social-drafts`);

export const deleteSocialDraft = (draftId: string) =>
  apiFetch<{ message: string }>(`/api/seller/social-drafts/${draftId}`, { method: "DELETE" });

export const activateSocialDraft = (draftId: string) =>
  apiFetch<{ message: string }>(`/api/seller/social-drafts/${draftId}/activate`, { method: "POST" });

export type SellerAiArtifactType = "simulation" | "bundle_recommendation" | "image_generation";

export interface SellerAiArtifact {
  id: string;
  commerceProductId: string;
  artifactType: SellerAiArtifactType;
  label: string;
  payload: unknown;
  aiModel: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

export const getAllAiArtifacts = () =>
  apiFetch<SellerAiArtifact[]>("/api/seller/ai-artifacts");

export const getProductAiArtifacts = (productId: string) =>
  apiFetch<SellerAiArtifact[]>(`/api/seller/products/${productId}/ai-artifacts`);

export const deleteAiArtifact = (artifactId: string) =>
  apiFetch<{ message: string }>(`/api/seller/ai-artifacts/${artifactId}`, { method: "DELETE" });

