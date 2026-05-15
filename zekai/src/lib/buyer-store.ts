/**
 * buyer-store.ts
 *
 * Zekai Alıcı Karar Merkezi için localStorage tabanlı veri katmanı.
 * Yalnızca client tarafında (useEffect içinde) çağrılmalıdır — SSR-safe.
 */

import type {
  SavedAnalysis,
  SavedAnalysisStatus,
  ShoppingProject,
  BuyerProfile,
} from "@/types/analysis";

const STORAGE_VERSION = "v1";

const KEYS = {
  savedAnalyses: `zekai-${STORAGE_VERSION}-saved-analyses`,
  projects: `zekai-${STORAGE_VERSION}-projects`,
  profile: `zekai-${STORAGE_VERSION}-buyer-profile`,
  compareQueue: `zekai-${STORAGE_VERSION}-compare-queue`,
} as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Güvenli localStorage yardımcıları
──────────────────────────────────────────────────────────────────────────────*/
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage dolu olabilir, sessizce geç */
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Buyer Profile
──────────────────────────────────────────────────────────────────────────────*/
const DEFAULT_PROFILE: BuyerProfile = { name: "", onboarded: false };

export function getBuyerProfile(): BuyerProfile {
  return safeGet<BuyerProfile>(KEYS.profile, DEFAULT_PROFILE);
}

export function saveBuyerProfile(profile: BuyerProfile): void {
  safeSet(KEYS.profile, profile);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Saved Analyses
──────────────────────────────────────────────────────────────────────────────*/
export function getSavedAnalyses(): SavedAnalysis[] {
  return safeGet<SavedAnalysis[]>(KEYS.savedAnalyses, []);
}

export function getSavedAnalysisById(id: string): SavedAnalysis | undefined {
  return getSavedAnalyses().find((a) => a.id === id);
}

export function saveAnalysis(analysis: SavedAnalysis): void {
  const existing = getSavedAnalyses();
  const idx = existing.findIndex((a) => a.id === analysis.id);
  if (idx >= 0) {
    existing[idx] = analysis;
  } else {
    existing.unshift(analysis); // en yeni başa
  }
  safeSet(KEYS.savedAnalyses, existing);
}

export function updateAnalysisStatus(
  id: string,
  status: SavedAnalysisStatus
): void {
  const analyses = getSavedAnalyses();
  const idx = analyses.findIndex((a) => a.id === id);
  if (idx >= 0) {
    analyses[idx] = { ...analyses[idx], status };
    safeSet(KEYS.savedAnalyses, analyses);
  }
}

export function updateAnalysisNote(id: string, note: string): void {
  const analyses = getSavedAnalyses();
  const idx = analyses.findIndex((a) => a.id === id);
  if (idx >= 0) {
    analyses[idx] = { ...analyses[idx], userNote: note };
    safeSet(KEYS.savedAnalyses, analyses);
  }
}

export function deleteAnalysis(id: string): void {
  const analyses = getSavedAnalyses().filter((a) => a.id !== id);
  safeSet(KEYS.savedAnalyses, analyses);
  // karşılaştırma kuyruğundan da çıkar
  removeFromCompareQueue(id);
  // projedeki referansı da temizle
  const projects = getProjects();
  const updated = projects.map((p) => ({
    ...p,
    savedAnalysisIds: p.savedAnalysisIds.filter((sid) => sid !== id),
  }));
  safeSet(KEYS.projects, updated);
}

export function isAnalysisSaved(id: string): boolean {
  return getSavedAnalyses().some((a) => a.id === id);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shopping Projects (Karar Odaları)
──────────────────────────────────────────────────────────────────────────────*/
export function getProjects(): ShoppingProject[] {
  return safeGet<ShoppingProject[]>(KEYS.projects, []);
}

export function getProjectById(id: string): ShoppingProject | undefined {
  return getProjects().find((p) => p.id === id);
}

export function createProject(
  data: Omit<ShoppingProject, "id" | "createdAt" | "savedAnalysisIds">
): ShoppingProject {
  const project: ShoppingProject = {
    ...data,
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    savedAnalysisIds: [],
  };
  const existing = getProjects();
  safeSet(KEYS.projects, [project, ...existing]);
  return project;
}

export function updateProject(
  id: string,
  data: Partial<Omit<ShoppingProject, "id" | "createdAt">>
): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx >= 0) {
    projects[idx] = { ...projects[idx], ...data };
    safeSet(KEYS.projects, projects);
  }
}

export function deleteProject(id: string): void {
  // ilişkili analizlerdeki projectId referansını temizle
  const analyses = getSavedAnalyses().map((a) =>
    a.projectId === id ? { ...a, projectId: undefined } : a
  );
  safeSet(KEYS.savedAnalyses, analyses);
  safeSet(
    KEYS.projects,
    getProjects().filter((p) => p.id !== id)
  );
}

export function addAnalysisToProject(
  projectId: string,
  analysisId: string
): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  if (!projects[idx].savedAnalysisIds.includes(analysisId)) {
    projects[idx] = {
      ...projects[idx],
      savedAnalysisIds: [...projects[idx].savedAnalysisIds, analysisId],
    };
    safeSet(KEYS.projects, projects);
  }
  // analizin projectId'sini de güncelle
  updateAnalysisNote; // no-op, just referencing the util
  const analyses = getSavedAnalyses();
  const aIdx = analyses.findIndex((a) => a.id === analysisId);
  if (aIdx >= 0) {
    analyses[aIdx] = { ...analyses[aIdx], projectId };
    safeSet(KEYS.savedAnalyses, analyses);
  }
}

export function removeAnalysisFromProject(
  projectId: string,
  analysisId: string
): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx < 0) return;
  projects[idx] = {
    ...projects[idx],
    savedAnalysisIds: projects[idx].savedAnalysisIds.filter(
      (id) => id !== analysisId
    ),
  };
  safeSet(KEYS.projects, projects);
  // analizin projectId'sini temizle
  const analyses = getSavedAnalyses();
  const aIdx = analyses.findIndex((a) => a.id === analysisId);
  if (aIdx >= 0) {
    analyses[aIdx] = { ...analyses[aIdx], projectId: undefined };
    safeSet(KEYS.savedAnalyses, analyses);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Compare Queue (Karşılaştırma Kuyruğu — maks 3 ürün)
──────────────────────────────────────────────────────────────────────────────*/
export function getCompareQueue(): string[] {
  return safeGet<string[]>(KEYS.compareQueue, []);
}

export function addToCompareQueue(analysisId: string): boolean {
  const queue = getCompareQueue();
  if (queue.includes(analysisId)) return true;
  if (queue.length >= 3) return false; // doldu
  safeSet(KEYS.compareQueue, [...queue, analysisId]);
  return true;
}

export function removeFromCompareQueue(analysisId: string): void {
  safeSet(
    KEYS.compareQueue,
    getCompareQueue().filter((id) => id !== analysisId)
  );
}

export function clearCompareQueue(): void {
  safeSet(KEYS.compareQueue, []);
}

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
