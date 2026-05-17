/**
 * buyer-store.ts
 *
 * Zekai Alıcı Karar Merkezi için saf API-backed Zustand store'ları.
 * localStorage kullanılmaz — canonical kaynak daima backend DB'dir.
 * Compare kuyruğu tek istisna: oturum state'i, persist istemiyoruz.
 */

import { create } from "zustand";
import type {
  SavedAnalysis,
  SavedAnalysisStatus,
  ShoppingProject,
  BuyerProfile,
} from "@/types/analysis";
import {
  getSavedAnalysesFromApi,
  saveAnalysisToApi,
  updateAnalysisInApi,
  deleteAnalysisFromApi,
  getProjectsFromApi,
  createProjectInApi,
  updateProjectInApi,
  deleteProjectFromApi,
  addAnalysisToProjectInApi,
  removeAnalysisFromProjectInApi,
  getBuyerProfileFromApi,
  updateBuyerProfileInApi,
  type SavedAnalysisApi,
  type ShoppingProjectApi,
} from "@/lib/api/buyer";

/* ─────────────────────────────────────────────────────────────────────────────
   API → Frontend tip dönüşümleri
──────────────────────────────────────────────────────────────────────────────*/
function mapAnalysis(a: SavedAnalysisApi): SavedAnalysis {
  let scores = { fitScore: 0, trustScore: 0, priceScore: 0, returnRiskPercent: 0 };
  try { scores = JSON.parse(a.scoresJson); } catch { /* fallback */ }
  return {
    id: a.externalId,
    productId: a.productId,
    productTitle: a.productTitle,
    productImage: a.productImage,
    productPrice: typeof a.productPrice === "number"
      ? String(a.productPrice)
      : a.productPrice,
    sellerName: a.sellerName,
    userNeedText: a.userNeedText,
    overallRiskPercent: a.overallRiskPercent,
    recommendationLevel: a.recommendationLevel,
    scores,
    savedAt: a.savedAt,
    status: (a.status as SavedAnalysisStatus) ?? "thinking",
    userNote: a.userNote ?? undefined,
  };
}

function mapProject(p: ShoppingProjectApi): ShoppingProject {
  return {
    id: p.id,
    title: p.title,
    goal: p.goal ?? "",
    budget: p.budget ?? undefined,
    createdAt: p.createdAt,
    savedAnalysisIds: p.savedAnalysisIds ?? [],
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Saved Analyses Store
──────────────────────────────────────────────────────────────────────────────*/
interface AnalysesState {
  analyses: SavedAnalysis[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  saveAnalysis: (data: Parameters<typeof saveAnalysisToApi>[0]) => Promise<SavedAnalysis>;
  updateStatus: (externalId: string, status: SavedAnalysisStatus) => Promise<void>;
  updateNote: (externalId: string, note: string) => Promise<void>;
  deleteAnalysis: (externalId: string) => Promise<void>;
  isSaved: (externalId: string) => boolean;
  getById: (externalId: string) => SavedAnalysis | undefined;
}

export const useAnalysesStore = create<AnalysesState>()((set, get) => ({
  analyses: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await getSavedAnalysesFromApi();
      set({ analyses: data.map(mapAnalysis), loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  saveAnalysis: async (data) => {
    const saved = await saveAnalysisToApi(data);
    const mapped = mapAnalysis(saved);
    set((s) => {
      const exists = s.analyses.findIndex((a) => a.id === mapped.id);
      if (exists >= 0) {
        const next = [...s.analyses];
        next[exists] = mapped;
        return { analyses: next };
      }
      return { analyses: [mapped, ...s.analyses] };
    });
    return mapped;
  },

  updateStatus: async (externalId, status) => {
    set((s) => ({
      analyses: s.analyses.map((a) =>
        a.id === externalId ? { ...a, status } : a
      ),
    }));
    const api = await getSavedAnalysesFromApi();
    const found = api.find((a) => a.externalId === externalId);
    if (found) await updateAnalysisInApi(found.id, { status });
  },

  updateNote: async (externalId, userNote) => {
    set((s) => ({
      analyses: s.analyses.map((a) =>
        a.id === externalId ? { ...a, userNote } : a
      ),
    }));
    const api = await getSavedAnalysesFromApi();
    const found = api.find((a) => a.externalId === externalId);
    if (found) await updateAnalysisInApi(found.id, { userNote });
  },

  deleteAnalysis: async (externalId) => {
    const api = await getSavedAnalysesFromApi();
    const found = api.find((a) => a.externalId === externalId);
    set((s) => ({ analyses: s.analyses.filter((a) => a.id !== externalId) }));
    useCompareStore.getState().remove(externalId);
    if (found) await deleteAnalysisFromApi(found.id);
  },

  isSaved: (externalId) => get().analyses.some((a) => a.id === externalId),
  getById: (externalId) => get().analyses.find((a) => a.id === externalId),
}));

/* ─────────────────────────────────────────────────────────────────────────────
   Shopping Projects Store
──────────────────────────────────────────────────────────────────────────────*/
interface ProjectsState {
  projects: ShoppingProject[];
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  createProject: (data: Omit<ShoppingProject, "id" | "createdAt" | "savedAnalysisIds">) => Promise<ShoppingProject>;
  updateProject: (id: string, data: Partial<Omit<ShoppingProject, "id" | "createdAt">>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addAnalysis: (projectId: string, analysisExternalId: string) => Promise<void>;
  removeAnalysis: (projectId: string, analysisExternalId: string) => Promise<void>;
  getById: (id: string) => ShoppingProject | undefined;
}

export const useProjectsStore = create<ProjectsState>()((set, get) => ({
  projects: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await getProjectsFromApi();
      set({ projects: data.map(mapProject), loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    const created = await createProjectInApi({
      title: data.title,
      goal: data.goal,
      budget: data.budget,
    });
    const mapped = mapProject(created);
    set((s) => ({ projects: [mapped, ...s.projects] }));
    return mapped;
  },

  updateProject: async (id, data) => {
    await updateProjectInApi(id, data);
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
  },

  deleteProject: async (id) => {
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    await deleteProjectFromApi(id);
  },

  addAnalysis: async (projectId, analysisExternalId) => {
    await addAnalysisToProjectInApi(projectId, analysisExternalId);
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId && !p.savedAnalysisIds.includes(analysisExternalId)
          ? { ...p, savedAnalysisIds: [...p.savedAnalysisIds, analysisExternalId] }
          : p
      ),
    }));
  },

  removeAnalysis: async (projectId, analysisExternalId) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...p, savedAnalysisIds: p.savedAnalysisIds.filter((id) => id !== analysisExternalId) }
          : p
      ),
    }));
    await removeAnalysisFromProjectInApi(projectId, analysisExternalId);
  },

  getById: (id) => get().projects.find((p) => p.id === id),
}));

/* ─────────────────────────────────────────────────────────────────────────────
   Buyer Profile Store
──────────────────────────────────────────────────────────────────────────────*/
interface ProfileState {
  profile: BuyerProfile;
  loaded: boolean;
  load: () => Promise<void>;
  save: (data: Partial<BuyerProfile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: { name: "", onboarded: false },
  loaded: false,

  load: async () => {
    const data = await getBuyerProfileFromApi();
    set({ profile: { name: data.profileName ?? "", onboarded: data.onboarded }, loaded: true });
  },

  save: async (data) => {
    set((s) => ({ profile: { ...s.profile, ...data } }));
    await updateBuyerProfileInApi({
      profileName: data.name,
      onboarded: data.onboarded,
    });
  },
}));

/* ─────────────────────────────────────────────────────────────────────────────
   Compare Queue Store — in-memory, persist yok (oturum state'i)
──────────────────────────────────────────────────────────────────────────────*/
interface CompareState {
  ids: string[];
  add: (externalId: string) => boolean;
  remove: (externalId: string) => void;
  clear: () => void;
  has: (externalId: string) => boolean;
}

export const useCompareStore = create<CompareState>()((set, get) => ({
  ids: [],
  add: (externalId) => {
    const ids = get().ids;
    if (ids.includes(externalId)) return true;
    if (ids.length >= 3) return false;
    set({ ids: [...ids, externalId] });
    return true;
  },
  remove: (externalId) => set((s) => ({ ids: s.ids.filter((id) => id !== externalId) })),
  clear: () => set({ ids: [] }),
  has: (externalId) => get().ids.includes(externalId),
}));

/* ─────────────────────────────────────────────────────────────────────────────
   Status etiketleri (Türkçe)
──────────────────────────────────────────────────────────────────────────────*/
export const STATUS_LABELS: Record<SavedAnalysisStatus, string> = {
  thinking: "Düşünüyorum",
  comparing: "Karşılaştırıyorum",
  waiting: "Fiyat Bekleniyor",
  bought: "Satın Aldım",
  passed: "Vazgeçtim",
};

export const STATUS_OPTIONS: { value: SavedAnalysisStatus; label: string }[] =
  Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value: value as SavedAnalysisStatus,
    label,
  }));

/* ─────────────────────────────────────────────────────────────────────────────
   Geriye dönük uyumluluk — eski buyer-store fonksiyon adları
   (yalnızca kullanılan yerlerde kademeli güncelleme için geçici)
──────────────────────────────────────────────────────────────────────────────*/
export function getSavedAnalyses(): SavedAnalysis[] {
  return useAnalysesStore.getState().analyses;
}

export function getSavedAnalysisById(id: string): SavedAnalysis | undefined {
  return useAnalysesStore.getState().getById(id);
}

export function getCompareQueue(): string[] {
  return useCompareStore.getState().ids;
}

export function addToCompareQueue(id: string): boolean {
  return useCompareStore.getState().add(id);
}

export function removeFromCompareQueue(id: string): void {
  useCompareStore.getState().remove(id);
}

export function clearCompareQueue(): void {
  useCompareStore.getState().clear();
}

export function isAnalysisSaved(id: string): boolean {
  return useAnalysesStore.getState().isSaved(id);
}

export function getBuyerProfile(): BuyerProfile {
  return useProfileStore.getState().profile;
}

export function saveBuyerProfile(data: Partial<BuyerProfile>): void {
  useProfileStore.getState().save(data).catch(() => {});
}

export function getProjects(): ShoppingProject[] {
  return useProjectsStore.getState().projects;
}

export function saveAnalysis(analysis: SavedAnalysis): void {
  useAnalysesStore
    .getState()
    .saveAnalysis({
      externalId: analysis.id,
      productId: analysis.productId,
      productTitle: analysis.productTitle,
      productImage: analysis.productImage,
      productPrice: analysis.productPrice,
      sellerName: analysis.sellerName,
      userNeedText: analysis.userNeedText,
      overallRiskPercent: analysis.overallRiskPercent,
      recommendationLevel: analysis.recommendationLevel,
      scoresJson: JSON.stringify(analysis.scores),
    })
    .catch(() => {});
}

export function updateAnalysisStatus(id: string, status: SavedAnalysisStatus): void {
  useAnalysesStore.getState().updateStatus(id, status).catch(() => {});
}

export function updateAnalysisNote(id: string, note: string): void {
  useAnalysesStore.getState().updateNote(id, note).catch(() => {});
}

export function deleteAnalysis(id: string): void {
  useAnalysesStore.getState().deleteAnalysis(id).catch(() => {});
}

export function createProject(
  data: Omit<ShoppingProject, "id" | "createdAt" | "savedAnalysisIds">
): ShoppingProject {
  const optimistic: ShoppingProject = {
    ...data,
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    savedAnalysisIds: [],
  };
  // Zustand store'a ekliyoruz, API çağrısı fire-and-forget
  useProjectsStore.setState((s) => ({ projects: [optimistic, ...s.projects] }));
  useProjectsStore
    .getState()
    .createProject(data)
    .then((created) => {
      // Optimistic ID'yi gerçek ID ile değiştir
      useProjectsStore.setState((s) => ({
        projects: s.projects.map((p) =>
          p.id === optimistic.id ? created : p
        ),
      }));
    })
    .catch(() => {});
  return optimistic;
}

export function deleteProject(id: string): void {
  useProjectsStore.getState().deleteProject(id).catch(() => {});
}

export function addAnalysisToProject(projectId: string, analysisExternalId: string): void {
  useProjectsStore.getState().addAnalysis(projectId, analysisExternalId).catch(() => {});
}

export function removeAnalysisFromProject(projectId: string, analysisExternalId: string): void {
  useProjectsStore.getState().removeAnalysis(projectId, analysisExternalId).catch(() => {});
}
