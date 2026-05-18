"use client";

import type { BuyerAnalysis, RecommendationLevel } from "@/types/analysis";
import type { Product } from "@/types/product";

export type AdkAgentEvent = {
  author?: string;
  content?: { parts?: Array<{ text?: string }> };
  actions?: { state_delta?: Record<string, unknown> };
};

export type VerifiedReport = {
  verified_fit_score?: number;
  verified_trust_score?: number;
  verified_price_fairness_score?: number;
  verified_return_risk_percent?: number;
  final_recommendation?: "buy" | "consider" | "avoid";
  final_summary?: string;
  verified_warnings?: Array<{ warning?: string; evidence?: string; confidence?: string }>;
  verified_strengths?: Array<{ strength?: string; evidence?: string; confidence?: string }>;
  unverified_claims?: string[];
  user_dependent_claims?: string[];
  verification_quality?: string;
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

const authorToStepId: Record<string, string> = {
  need_understanding: "need-agent",
  product_reality: "product-agent",
  review_mining: "review-agent",
  visual_forensics: "visual-agent",
  price_market: "price-agent",
  return_risk: "return-agent",
  risk_synthesis: "synthesis-agent",
  verification: "verification-agent",
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

function recommendationLevel(value: VerifiedReport["final_recommendation"], risk: number): RecommendationLevel {
  if (value === "buy") return "safe";
  if (value === "avoid") return "risky";
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

export function extractVerifiedReport(event: AdkAgentEvent): VerifiedReport | undefined {
  const fromState = parseMaybeJson(event.actions?.state_delta?.final_rapor);
  if (fromState && typeof fromState === "object") return fromState as VerifiedReport;

  const text = event.content?.parts?.find((part) => part.text)?.text;
  const fromText = parseMaybeJson(text);
  if (fromText && typeof fromText === "object") return fromText as VerifiedReport;

  return undefined;
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

const ANALYZE_TIMEOUT_MS = 120_000;

function getAuthHeaders(): Record<string, string> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("zekai_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
        onEvent(JSON.parse(json) as AdkAgentEvent);
      } catch {
        buffer = `${json}\n${buffer}`;
      }
    }
  }
}

/** New native-Gemini 4-agent buyer analysis via zekai-api */
export async function runBuyerAgentStream({
  product,
  buyerNeed,
  onEvent,
}: {
  product: Product;
  buyerNeed: string;
  analysisId: string;
  onEvent: (event: AdkAgentEvent) => void;
}) {
  const response = await fetch(`${ZEKAI_API_URL}/api/buyer/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...getAuthHeaders(),
    },
    signal: AbortSignal.timeout(ANALYZE_TIMEOUT_MS),
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
  const fitScore = clampScore(report.verified_fit_score, base.scores.fitScore);
  const trustScore = clampScore(report.verified_trust_score, base.scores.trustScore);
  const priceScore = clampScore(report.verified_price_fairness_score, base.scores.priceScore);
  const returnRiskPercent = clampScore(
    report.verified_return_risk_percent,
    base.scores.returnRiskPercent,
  );
  const overallRiskPercent = clampScore(
    Math.round(100 - (fitScore + trustScore + priceScore) / 3 + returnRiskPercent * 0.35),
    base.overallRiskPercent,
  );
  const level = recommendationLevel(report.final_recommendation, overallRiskPercent);
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
          reason: item.evidence ?? "ADK dogrulama ajanindan geldi.",
        })),
        ...warnings.slice(0, 2).map((item, index) => ({
          label: item.warning ?? `Risk sinyali ${index + 1}`,
          score: Math.max(20, fitScore - 14 - index * 6),
          reason: item.evidence ?? "ADK dogrulama ajanindan geldi.",
        })),
      ].slice(0, 4),
    },
    trustAnalysis: {
      ...base.trustAnalysis,
      summary: report.final_summary ?? base.trustAnalysis.summary,
      signals: [
        {
          title: "ADK Dogrulama",
          value: report.verification_quality ?? "medium",
          description: report.final_summary ?? "Risk raporu kanit kalitesi acisindan dogrulandi.",
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
      summary: `ADK fiyat adaleti skoru ${priceScore}/100 olarak dogrulandi.`,
      marketComparison: [
        { label: "Bu satici", value: formatPrice(product.price) },
        ...(product.originalPrice ? [{ label: "Liste fiyati", value: formatPrice(product.originalPrice) }] : []),
        { label: "ADK fiyat skoru", value: `${priceScore}/100` },
      ],
    },
    finalAdvice:
      report.final_summary ??
      (level === "safe"
        ? "ADK analizine gore kontrollu sekilde degerlendirilebilir."
        : "ADK analizine gore kanitlari inceleyip alternatiflerle karsilastirmak daha mantikli."),
  };
}
