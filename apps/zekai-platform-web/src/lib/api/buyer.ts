import { apiFetch, API_BASE } from "./client";
import { transport } from "./transport";

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

// ── Compare Verdict ───────────────────────────────────────────────────────────

export interface CompareProductVerdictApi {
  product_id: string;
  one_line_reason: string;
  relative_fit: "best" | "ok" | "skip";
}

export interface CompareVerdictResultApi {
  winner_id: string;
  headline: string;
  winner_reason: string;
  caution?: string;
  product_verdicts: CompareProductVerdictApi[];
}

export interface CompareVerdictPayload {
  comparisonNeed: string;
  analyses: Array<{
    productId: string;
    productTitle: string;
    productCategory: string;
    productPrice: number;
    userNeedText: string;
    fitScore: number;
    trustScore: number;
    priceScore: number;
    returnRiskPercent: number;
  }>;
}

type SseEvent = {
  type?: string;
  message?: string;
  author?: string;
  actions?: { state_delta?: Record<string, unknown> };
};

function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  const abort = () => controller.abort(signals.find((s) => s.aborted)?.reason);
  for (const signal of signals) {
    if (signal.aborted) {
      abort();
      break;
    }
    signal.addEventListener("abort", abort, { once: true });
  }
  return controller.signal;
}

export async function streamCompareVerdict(
  payload: CompareVerdictPayload,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("zekai_token");
  const timeoutSignal = AbortSignal.timeout(60_000);
  const combinedSignal = signal
    ? combineAbortSignals([signal, timeoutSignal])
    : timeoutSignal;

  const response = await transport(`${API_BASE}/api/buyer/compare-verdict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: combinedSignal,
    body: JSON.stringify({
      comparisonNeed: payload.comparisonNeed,
      analyses: payload.analyses.map((a) => ({
        productId: a.productId,
        productTitle: a.productTitle,
        productCategory: a.productCategory,
        productPrice: a.productPrice,
        userNeedText: a.userNeedText,
        fitScore: a.fitScore,
        trustScore: a.trustScore,
        priceScore: a.priceScore,
        returnRiskPercent: a.returnRiskPercent,
      })),
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Karşılaştırma isteği başarısız: ${response.status}`);
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
        const parsed = JSON.parse(json) as SseEvent;
        if (parsed?.type === "error") {
          const err = new Error(parsed.message ?? "Karşılaştırma tamamlanamadı.");
          err.name = "SseError";
          throw err;
        }
        onEvent(parsed);
      } catch (error) {
        if (error instanceof Error && error.name === "SseError") throw error;
      }
    }
  }
}
