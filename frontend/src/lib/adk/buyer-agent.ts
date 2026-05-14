"use client";

import type { BuyerAnalysis, RecommendationLevel } from "@/types/analysis";
import type { Product } from "@/types/product";
import { formatPrice, products } from "@/lib/mock-data/products";

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

const ADK_API_URL = process.env.NEXT_PUBLIC_ADK_API_URL ?? "http://localhost:8000";

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
  try {
    return JSON.parse(value);
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
    return warnings.slice(0, 4).map((item, index) => ({
      label: item.warning ?? "Dogrulanmis risk",
      percent: Math.max(10, 38 - index * 8),
    }));
  }

  return [
    { label: "Urun beklentisiyle uyumsuzluk", percent: 30 },
    { label: "Fiyat veya indirim belirsizligi", percent: 24 },
    { label: "Yorum ve gorsel kanit yetersizligi", percent: 18 },
  ];
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
  const marketMedian = Math.round(product.price * 0.86);
  const fairLow = Math.round(marketMedian * 0.92);
  const fairHigh = Math.round(marketMedian * 1.08);

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
          image: product.image,
          thumbnails: product.thumbnails,
        },
        reviews: {
          total: product.reviewCount,
          rating: product.rating,
          sample_reviews: [],
          note: "Bu prototipte ham yorum metinleri yerine urun puani ve yorum hacmi gonderiliyor.",
        },
        visual_data: {
          image: product.image,
          thumbnails: product.thumbnails,
          customer_photos: [],
        },
        price_data: {
          current_price_tl: product.price,
          original_price_tl: product.originalPrice ?? product.price,
          discount_percent: product.discountPercent ?? 0,
          market_median_price_tl: marketMedian,
          fair_price_range: { min: fairLow, max: fairHigh },
          alternative_sellers: products
            .filter((item) => item.id !== product.id && item.category === product.category)
            .slice(0, 3)
            .map((item) => ({ name: item.sellerName, price_tl: item.price })),
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

export async function runBuyerAgentStream({
  product,
  buyerNeed,
  analysisId,
  onEvent,
}: {
  product: Product;
  buyerNeed: string;
  analysisId: string;
  onEvent: (event: AdkAgentEvent) => void;
}) {
  const response = await fetch(`${ADK_API_URL}/run_sse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      app_name: "buyer_agent",
      user_id: "zekai-demo-user",
      session_id: analysisId,
      new_message: {
        role: "user",
        parts: [{ text: buildAgentMessage(product, buyerNeed) }],
      },
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`ADK stream failed: ${response.status}`);
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
        onEvent(JSON.parse(json) as AdkAgentEvent);
      } catch {
        buffer = `${json}\n${buffer}`;
      }
    }
  }
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
  const medianPrice = Math.round(product.price * 0.86);

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
        { label: "Pazar medyani", value: formatPrice(medianPrice) },
        { label: "ADK fiyat skoru", value: `${priceScore}/100` },
      ],
    },
    returnRiskAnalysis: {
      ...base.returnRiskAnalysis,
      summary: `ADK dogrulama sonrasi iade/pismanlik riski %${returnRiskPercent}.`,
      reasons: fallbackReasons(report),
      personalWarning:
        warnings[0]?.warning ??
        report.user_dependent_claims?.[0] ??
        base.returnRiskAnalysis.personalWarning,
    },
    finalAdvice:
      report.final_summary ??
      (level === "safe"
        ? "ADK analizine gore kontrollu sekilde degerlendirilebilir."
        : "ADK analizine gore kanitlari inceleyip alternatiflerle karsilastirmak daha mantikli."),
  };
}
