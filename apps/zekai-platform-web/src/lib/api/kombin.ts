import type { KombinAnalyzeRequest, KombinAnalysisResult, KombinScores } from "@/types/kombin";
import { transport } from "./transport";

const ZEKAI_API_URL =
  process.env.NEXT_PUBLIC_ZEKAI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5002";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("zekai_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type KombinSseEvent = {
  type?: string;
  message?: string;
  author?: string;
  actions?: { state_delta?: Record<string, unknown> };
  content?: { parts?: Array<{ text?: string }> };
};

export type KombinStageEvent = {
  agent: string;
  status: "running" | "done";
  label: string;
};

export type KombinStreamCallbacks = {
  onLiveScores?: (scores: KombinScores) => void;
  onResult?: (result: KombinAnalysisResult) => void;
  onStage?: (stage: KombinStageEvent) => void;
  onAgentStep?: (author: string) => void;
  onError?: (err: string) => void;
};

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(normalized);
  } catch {
    return undefined;
  }
}

function buildLiveScores(delta: Record<string, unknown>): KombinScores | null {
  const partial = (delta.partial_scores ?? delta.live_scores) as Record<string, unknown> | undefined;
  if (!partial) return null;
  return {
    overall: Number(partial.overall ?? 0),
    needFit: Number(partial.need_fit ?? 0),
    partFit: Number(partial.part_fit ?? 0),
    budgetBalance: Number(partial.budget_balance ?? 0),
    risk: Number(partial.risk ?? 0),
  };
}

function buildStage(delta: Record<string, unknown>): KombinStageEvent | null {
  const raw = delta.kombin_stage as Record<string, unknown> | undefined;
  if (!raw) return null;
  const status = raw.status === "done" ? "done" : "running";
  return {
    agent: String(raw.agent ?? ""),
    status,
    label: String(raw.label ?? ""),
  };
}

export async function runKombinAnalyzeStream(
  req: KombinAnalyzeRequest,
  callbacks: KombinStreamCallbacks,
): Promise<void> {
  const response = await transport(`${ZEKAI_API_URL}/api/buyer/kombin-analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...getAuthHeaders(),
    },
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      goal: req.goal,
      budget: req.budget,
      use_cases: req.useCases,
      priorities: req.priorities,
      style: req.style,
      products: req.products.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        image_url: p.imageUrl ?? null,
      })),
    }),
  });

  if (!response.ok || !response.body) {
    callbacks.onError?.(`Kombin analiz başlatılamadı: ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  function processLines(lines: string[]) {
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const json = line.replace(/^data:\s*/, "").trim();
      if (!json) continue;

      let event: KombinSseEvent;
      try {
        event = JSON.parse(json) as KombinSseEvent;
      } catch {
        continue;
      }

      if (!event || typeof event !== "object") continue;

      if (event.type === "error") {
        callbacks.onError?.(event.message ?? "Kombin analizi olusturulamadi.");
        continue;
      }

      const author = event.author;
      if (author) callbacks.onAgentStep?.(author);

      const delta = event.actions?.state_delta;
      if (!delta) continue;

      const live = buildLiveScores(delta);
      if (live) callbacks.onLiveScores?.(live);

      const stage = buildStage(delta);
      if (stage) callbacks.onStage?.(stage);

      if (delta.kombin_result) {
        const raw = parseMaybeJson(delta.kombin_result);
        if (raw && typeof raw === "object") {
          callbacks.onResult?.(raw as KombinAnalysisResult);
        }
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // Stream kapandı — kalan buffer'ı da işle
      if (buffer.trim()) processLines([buffer]);
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    processLines(lines);
  }
}
