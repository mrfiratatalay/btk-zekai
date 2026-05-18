"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { AnalysisLoadingView } from "@/components/platform/AnalysisLoadingView";
import { AnalysisResultView } from "@/components/platform/AnalysisResultView";
import { getSavedAnalyses } from "@/lib/buyer-store";
import {
  applyVerifiedReport,
  extractVerifiedReport,
  runBuyerAgentStream,
  stepIdFromAuthor,
} from "@/lib/adk/buyer-agent";

const LIVE_AGENT_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADK_AGENT !== "false";

function getCacheKey(analysis: BuyerAnalysis, product?: Product) {
  if (!product) return undefined;
  return `zekai:buyer-analysis:v2:${product.id}:${analysis.userNeedText}`;
}

export function BuyerAnalysisExperience({
  analysis,
  product,
}: {
  analysis: BuyerAnalysis;
  product?: Product;
}) {
  const [status, setStatus] = useState<"running" | "completed">(() => {
    if (typeof window !== "undefined") {
      const isSaved = getSavedAnalyses().some((a) => a.id === analysis.analysisId);
      if (isSaved) return "completed";
    }
    return "running";
  });
  const [liveAnalysis, setLiveAnalysis] = useState(analysis);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(() => new Set());
  const [useLiveAgent, setUseLiveAgent] = useState(Boolean(product) && LIVE_AGENT_ENABLED);
  // SSE stream'den gelen gerçek zamanlı bulgu metinleri (JSON değil, insan-okunabilir)
  const [streamFindings, setStreamFindings] = useState<string[]>([]);
  const startedRef = useRef(false);
  const handleComplete = useCallback(() => setStatus("completed"), []);

  useEffect(() => {
    if (!product || startedRef.current || !LIVE_AGENT_ENABLED) return;

    startedRef.current = true;
    let cancelled = false;
    const cacheKey = getCacheKey(analysis, product);

    if (cacheKey) {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setLiveAnalysis(JSON.parse(cached) as BuyerAnalysis);
          setCompletedStepIds(new Set(analysis.agentSteps.map((step) => step.id)));
          setStatus("completed");
          return;
        } catch {
          window.localStorage.removeItem(cacheKey);
        }
      }
    }

    // 90s: 5 Gemini ajanı + Google Search grounding 30-60s alabilir;
    // 10s çok kısa — gerçek analiz bitmeden demo moda düşüyordu
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setUseLiveAgent(false);
      }
    }, 90_000);

    runBuyerAgentStream({
      product,
      buyerNeed: analysis.userNeedText,
      analysisId: analysis.analysisId,
      onEvent(event) {
        if (cancelled) return;

        const stepId = stepIdFromAuthor(event.author);
        if (stepId) {
          setCompletedStepIds((current) => new Set([...current, stepId]));
        }

        // Ajan başlangıç mesajlarını (plain text) canlı feed'e ekle
        const rawText = event.content?.parts?.find((p) => p.text)?.text;
        if (rawText && !rawText.trimStart().startsWith("{") && rawText.trim().length > 8) {
          setStreamFindings((prev) =>
            prev.includes(rawText) ? prev : [...prev, rawText]
          );
        }

        const report = extractVerifiedReport(event);
        if (report) {
          setCompletedStepIds((current) => new Set([...current, "verification-agent"]));
          const nextAnalysis = applyVerifiedReport(analysis, product, report);
          setLiveAnalysis(nextAnalysis);
          if (cacheKey) {
            window.localStorage.setItem(cacheKey, JSON.stringify(nextAnalysis));
          }
          setStatus("completed");
        }
      },
    })
      .then(() => {
        if (!cancelled) {
          window.clearTimeout(fallbackTimer);
          setUseLiveAgent(false);
        }
      })
      .catch((error) => {
        console.warn("ADK stream unavailable, falling back to demo analysis.", error);
        if (!cancelled) {
          window.clearTimeout(fallbackTimer);
          setUseLiveAgent(false);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [analysis, product]);

  const completedOverride = useMemo(() => {
    if (!useLiveAgent) return undefined;

    let count = 0;
    for (const step of analysis.agentSteps) {
      if (completedStepIds.has(step.id)) {
        count += 1;
      }
    }

    return count;
  }, [analysis.agentSteps, completedStepIds, useLiveAgent]);

  // Canlı feed: SSE'den gelen gerçek metinleri öncelikli göster;
  // stream henüz başlamadıysa temel analiz verilerini fallback olarak kullan
  const liveFindings: string[] = streamFindings.length > 0
    ? streamFindings
    : [
        liveAnalysis.trustAnalysis.signals[1]?.description ?? null,
        liveAnalysis.priceAnalysis.warning || null,
      ].filter(Boolean) as string[];

  if (status === "running") {
    return (
      <AnalysisLoadingView
        agentSteps={liveAnalysis.agentSteps}
        userNeedText={liveAnalysis.userNeedText}
        liveFindings={liveFindings}
        product={product}
        analysisId={liveAnalysis.analysisId}
        onComplete={handleComplete}
        completedOverride={completedOverride}
        disableTimer={useLiveAgent}
      />
    );
  }

  return <AnalysisResultView analysis={liveAnalysis} product={product} />;
}
