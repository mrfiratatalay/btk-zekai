import { apiFetch } from "./client";

export interface SavedAnalysisApi {
  id: string;
  externalId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: string;
  sellerName: string;
  userNeedText: string;
  overallRiskPercent: number;
  recommendationLevel: "safe" | "caution" | "risky";
  scoresJson: string;
  status: string;
  userNote: string | null;
  savedAt: string;
}

export interface SavedKombinApi {
  id: string;
  externalId: string;
  title: string;
  goalText: string;
  budget: number | null;
  productsJson: string;
  resultJson: string;
  createdAt: string;
}

export interface ShoppingProjectApi {
  id: string;        // DB Guid (internal)
  externalId: string; // project-{ts}-{rand} string — API route'larında kullanılır
  title: string;
  goal: string;
  budget: number | null;
  createdAt: string;
  analysisIds: string[]; // backend "analysisIds" olarak gönderir
}

// ── Saved Analyses ───────────────────────────────────────────────────────────

export const getSavedAnalysesFromApi = () =>
  apiFetch<SavedAnalysisApi[]>("/api/buyer/analyses");

export const saveAnalysisToApi = (data: {
  externalId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: string;
  sellerName: string;
  userNeedText: string;
  overallRiskPercent: number;
  recommendationLevel: string;
  scoresJson: string;
}) =>
  apiFetch<SavedAnalysisApi>("/api/buyer/analyses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAnalysisInApi = (id: string, data: { status?: string; userNote?: string }) =>
  apiFetch<SavedAnalysisApi>(`/api/buyer/analyses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAnalysisFromApi = (id: string) =>
  apiFetch<void>(`/api/buyer/analyses/${id}`, { method: "DELETE" });

// Shopping Projects

export const getProjectsFromApi = () =>
  apiFetch<ShoppingProjectApi[]>("/api/buyer/projects");

export const createProjectInApi = (data: {
  externalId?: string;
  title: string;
  goal: string;
  budget?: number;
  savedAnalysisIds?: string[];
}) =>
  apiFetch<ShoppingProjectApi>("/api/buyer/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProjectInApi = (
  id: string,
  data: { title?: string; goal?: string; budget?: number; savedAnalysisIds?: string[] },
) =>
  apiFetch<ShoppingProjectApi>(`/api/buyer/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteProjectFromApi = (id: string) =>
  apiFetch<void>(`/api/buyer/projects/${id}`, { method: "DELETE" });

export const addAnalysisToProjectInApi = (projectId: string, analysisId: string) =>
  apiFetch<ShoppingProjectApi>(
    `/api/buyer/projects/${projectId}/analyses/${encodeURIComponent(analysisId)}`,
    { method: "POST" },
  );

export const removeAnalysisFromProjectInApi = (projectId: string, analysisExternalId: string) =>
  apiFetch<ShoppingProjectApi>(
    `/api/buyer/projects/${projectId}/analyses/${encodeURIComponent(analysisExternalId)}`,
    { method: "DELETE" },
  );

// ── Buyer Profile ─────────────────────────────────────────────────────────────

export const getKombinsFromApi = () =>
  apiFetch<SavedKombinApi[]>("/api/buyer/kombins");

export const saveKombinToApi = (data: {
  externalId?: string;
  title: string;
  goalText: string;
  budget?: number;
  productsJson: string;
  resultJson: string;
}) =>
  apiFetch<SavedKombinApi>("/api/buyer/kombins", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteKombinFromApi = (id: string) =>
  apiFetch<void>(`/api/buyer/kombins/${encodeURIComponent(id)}`, { method: "DELETE" });

export interface BuyerProfileApi {
  profileName: string | null;
  onboarded: boolean;
}

export const getBuyerProfileFromApi = () =>
  apiFetch<BuyerProfileApi>("/api/buyer/profile");

export const updateBuyerProfileInApi = (data: { profileName?: string; onboarded?: boolean }) =>
  apiFetch<BuyerProfileApi>("/api/buyer/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
