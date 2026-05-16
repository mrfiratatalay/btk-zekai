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

export interface ShoppingProjectApi {
  id: string;
  title: string;
  goal: string;
  budget: number | null;
  createdAt: string;
  savedAnalysisIds: string[];
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
  apiFetch<ShoppingProjectApi>(`/api/buyer/projects/${projectId}/analyses/${analysisId}`, {
    method: "POST",
  });

export const removeAnalysisFromProjectInApi = (projectId: string, analysisId: string) =>
  apiFetch<ShoppingProjectApi>(`/api/buyer/projects/${projectId}/analyses/${analysisId}`, {
    method: "DELETE",
  });
