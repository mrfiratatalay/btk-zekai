"use client";

import type {
  AlternativeProduct,
  BuyerAnalysis,
  RecommendationLevel,
  Verdict,
} from "@/types/analysis";
import type { Product } from "@/types/product";
import { transport } from "@/lib/api/transport";

export type AdkAgentEvent = {
  type?: string;
  message?: string;
  author?: string;
  content?: { parts?: Array<{ text?: string }> };
  actions?: { state_delta?: Record<string, unknown> };
};

export type VerifiedReport = {
  fit_score?: number;
  trust_score?: number;
  price_fairness_score?: number;
  return_risk_percent?: number;
  verified_fit_score?: number;
  verified_trust_score?: number;
  verified_price_fairness_score?: number;
  verified_return_risk_percent?: number;
  final_summary?: string;
  verified_warnings?: Array<{ warning?: string; evidence?: string; confidence?: string }>;
  verified_strengths?: Array<{ strength?: string; evidence?: string; confidence?: string }>;
  unverified_claims?: string[];
  user_dependent_claims?: string[];
  verification_quality?: string;
  /** Backend decision engine output — kararı her zaman bu belirler */
  verdict?: Verdict;
  /** Alternative Finder ajanının bulguları */
  alternatives?: AlternativeProduct[];
  used_search?: boolean;
  cached?: boolean;
};

const ZEKAI_API_URL =
  process.env.NEXT_PUBLIC_ZEKAI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5002";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

// Eşleşme: backend SSE author → frontend step ID
// Backend gerçekte 6 event gönderir — hayalet mapping yok
const authorToStepId: Record<string, string> = {
  buyer_advisor: "advisor-agent",
  market_check:  "market-agent",
  decision:      "decision-agent",
};

export function stepIdFromAuthor(author?: string) {
  return author ? authorToStepId[author] : undefined;
}

function parseMaybeJson(value: unknown) {
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

function clampScore(value: unknown, fallback: number) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function recommendationLevelFromVerdict(verdict: Verdict | undefined, risk: number): RecommendationLevel {
  if (verdict?.level === "buy") return "safe";
  if (verdict?.level === "avoid") return "risky";
  if (verdict?.level === "consider") return "caution";
  // verdict yoksa risk skorundan türet (yasaklı durumlar için fallback)
  if (risk >= 66) return "risky";
  if (risk >= 45) return "caution";
  return "safe";
}

function trustTone(score: number): "warning" | "danger" | "success" {
  if (score >= 70) return "success";
  if (score >= 45) return "warning";
  return "danger";
}

function fallbackReasons(report: VerifiedReport) {
  const warnings = report.verified_warnings?.filter((item) => item.warning) ?? [];
  if (warnings.length) {
    return warnings.slice(0, 4).map((item) => ({
      label: item.warning ?? "Dogrulanmis risk",
      percent: null,
    }));
  }
  return [];
}

/**
 * Bir objenin GERÇEKTEN final doğrulama raporu olup olmadığını doğrular.
 * Ara agent çıktıları (need_profile, price_analysis vb.) bu alanları içermez.
 */
function looksLikeVerifiedReport(o: unknown): o is VerifiedReport {
  if (!o || typeof o !== "object") return false;
  const r = o as Record<string, unknown>;
  return (
    "verdict" in r ||
    "fit_score" in r ||
    "trust_score" in r ||
    "verified_fit_score" in r ||
    "verified_trust_score" in r ||
    "verified_warnings" in r ||
    "final_summary" in r
  );
}

/**
 * SADECE backend'in final_rapor state_delta'sından raporu çıkarır.
 * Önceki sürüm herhangi bir event'in text'ini JSON parse ediyordu —
 * bu, ilk agent'ın (need_profile) çıktısını "final rapor" sanıp
 * ekranı erkenden rapora geçiriyor, kalan agent API çağrılarını boşa harcatıyordu.
 */
export function extractVerifiedReport(event: AdkAgentEvent): VerifiedReport | undefined {
  const fromState = parseMaybeJson(event.actions?.state_delta?.final_rapor);
  return looksLikeVerifiedReport(fromState) ? fromState : undefined;
}

export function buildAgentMessage(product: Product, buyerNeed: string) {
  return [
    "ANALYSIS_INPUT:",
    JSON.stringify(
      {
        buyer_need: buyerNeed,
        product: {
          id: product.id,
          title: product.title,
          brand: product.brand,
          sellerName: product.sellerName,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice ?? null,
          discountPercent: product.discountPercent ?? null,
          rating: product.rating,
          reviewCount: product.reviewCount,
          shortDescription: product.shortDescription,
          description: product.description,
          features: product.features,
          badges: product.badges,
          stock: product.stock,
          cargoText: product.cargoText,
          thumbnails: product.thumbnails,
        },
        reviews: {
          total: product.reviewCount,
          rating: product.rating,
          note: "Ham yorum metni yok; yalnizca puan ve yorum hacmi var.",
        },
        price_data: {
          current_price_tl: product.price,
          original_price_tl: product.originalPrice ?? product.price,
          discount_percent: product.discountPercent ?? 0,
          note: "Pazar medyan fiyati mevcut degil; ajan genel kategori bilgisiyle degerlendirme yapar.",
        },
        return_data: {
          note: "Kategori bazli iade sebepleri ajan tarafinda urun ve ihtiyac baglamindan tahmin edilir.",
        },
      },
      null,
      2,
    ),
  ].join("\n");
}

// Backend: need(25s) → parallel price/review/alt(25s) → synthesis(25s) ≈ 75s worst case.
// Frontend bunu erken kesmemeli — yoksa ücretli analiz çöpe gider.
const ANALYZE_TIMEOUT_MS = 180_000;

function getAuthHeaders(): Record<string, string> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("zekai_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

async function streamSseEvents(
  response: Response,
  onEvent: (event: AdkAgentEvent) => void,
): Promise<void> {
  if (!response.body) throw new Error("No response body");

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
        if (parsed && typeof parsed === "object" && parsed.type === "mock_notice") continue;
        if (parsed && typeof parsed === "object" && parsed.type === "error") {
          const error = new Error(parsed.message ?? "AI analizi tamamlanamadı.");
          error.name = "SseError";
          throw error;
        }
        onEvent(parsed as AdkAgentEvent);
      } catch (error) {
        if (error instanceof Error && error.name === "SseError") {
          throw error;
        }
        buffer = `${json}\n${buffer}`;
      }
    }
  }
}

/** Native Gemini buyer analysis via zekai-api */
export async function runBuyerAgentStream({
  product,
  buyerNeed,
  signal,
  onEvent,
}: {
  product: Product;
  buyerNeed: string;
  analysisId: string;
  signal?: AbortSignal;
  onEvent: (event: AdkAgentEvent) => void;
}) {
  const timeoutSignal = AbortSignal.timeout(ANALYZE_TIMEOUT_MS);
  const combinedSignal = signal ? combineAbortSignals([signal, timeoutSignal]) : timeoutSignal;
  const response = await transport(`${ZEKAI_API_URL}/api/buyer/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...getAuthHeaders(),
    },
    signal: combinedSignal,
    body: JSON.stringify({
      productId: product.id,
      buyerNeed,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Buyer analyze stream failed: ${response.status}`);
  }

  await streamSseEvents(response, onEvent);
}

export function applyVerifiedReport(
  base: BuyerAnalysis,
  product: Product,
  report: VerifiedReport,
): BuyerAnalysis {
  const fitScore = clampScore(report.verified_fit_score ?? report.fit_score, base.scores.fitScore);
  const trustScore = clampScore(report.verified_trust_score ?? report.trust_score, base.scores.trustScore);
  const priceScore = clampScore(report.verified_price_fairness_score ?? report.price_fairness_score, base.scores.priceScore);
  const returnRiskPercent = clampScore(
    report.verified_return_risk_percent ?? report.return_risk_percent,
    base.scores.returnRiskPercent,
  );
  const overallRiskPercent = clampScore(
    Math.round(100 - (fitScore + trustScore + priceScore) / 3 + returnRiskPercent * 0.35),
    base.overallRiskPercent,
  );
  const level = recommendationLevelFromVerdict(report.verdict, overallRiskPercent);
  const warnings = report.verified_warnings?.filter((item) => item.warning) ?? [];
  const strengths = report.verified_strengths?.filter((item) => item.strength) ?? [];
  return {
    ...base,
    overallRiskPercent,
    recommendationLevel: level,
    recommendationText: report.final_summary ?? base.recommendationText,
    scores: {
      fitScore,
      trustScore,
      priceScore,
      returnRiskPercent,
    },
    fitAnalysis: {
      ...base.fitAnalysis,
      summary: report.final_summary ?? base.fitAnalysis.summary,
      subScores: [
        {
          label: "Ihtiyac Uyumu",
          score: fitScore,
          reason: report.final_summary ?? base.fitAnalysis.subScores[0]?.reason ?? "",
        },
        ...strengths.slice(0, 2).map((item, index) => ({
          label: item.strength ?? `Guclu sinyal ${index + 1}`,
          score: Math.max(45, fitScore - index * 6),
          reason: item.evidence ?? "ZekAI analizinden geldi.",
        })),
        ...warnings.slice(0, 2).map((item, index) => ({
          label: item.warning ?? `Risk sinyali ${index + 1}`,
          score: Math.max(20, fitScore - 14 - index * 6),
          reason: item.evidence ?? "ZekAI analizinden geldi.",
        })),
      ].slice(0, 4),
    },
    trustAnalysis: {
      ...base.trustAnalysis,
      summary: report.final_summary ?? base.trustAnalysis.summary,
      signals: [
        {
          title: "ZekAI Analizi",
          value: report.verification_quality ?? "medium",
          description: report.final_summary ?? "Karar raporu kanit kalitesi acisindan dogrulandi.",
          tone: trustTone(trustScore),
        },
        {
          title: "Guclu Sinyaller",
          value: `${strengths.length} kanit`,
          description: strengths.map((item) => item.strength).join(" ") || "Guclu sinyal sinirli.",
          tone: strengths.length ? "success" : "warning",
        },
        {
          title: "Risk Sinyalleri",
          value: `${warnings.length} uyari`,
          description: warnings.map((item) => item.warning).join(" ") || "Belirgin uyari sinirli.",
          tone: warnings.length ? "warning" : "success",
        },
        {
          title: "Dogrulanamayanlar",
          value: `${report.unverified_claims?.length ?? 0} iddia`,
          description: report.unverified_claims?.join(" ") || "Dogrulanamayan kritik iddia yok.",
          tone: report.unverified_claims?.length ? "warning" : "success",
        },
      ],
    },
    priceAnalysis: {
      ...base.priceAnalysis,
      summary: `Fiyat uygunlugu ${priceScore}/100 olarak degerlendirildi.`,
      marketComparison: [
        { label: "Bu satici", value: formatPrice(product.price) },
        ...(product.originalPrice ? [{ label: "Liste fiyati", value: formatPrice(product.originalPrice) }] : []),
        { label: "Fiyat skoru", value: `${priceScore}/100` },
      ],
    },
    finalAdvice:
      report.final_summary ??
      (level === "safe"
        ? "ZekAI analizine gore kontrollu sekilde degerlendirilebilir."
        : "ZekAI analizine gore kanitlari inceleyip alternatiflerle karsilastirmak daha mantikli."),
    verdict: report.verdict,
    alternatives: report.alternatives ?? [],
  };
}
