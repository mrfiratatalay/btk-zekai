"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { AnalysisLoadingView } from "@/components/buyer/AnalysisLoadingView";
import { AnalysisResultView } from "@/components/buyer/AnalysisResultView";
import {
  applyVerifiedReport,
  extractVerifiedReport,
  runBuyerAgentStream,
  stepIdFromAuthor,
} from "@/lib/adk/buyer-agent";

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
  const [status, setStatus] = useState<"running" | "completed">("running");
  const [liveAnalysis, setLiveAnalysis] = useState(analysis);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(() => new Set());
  const [useLiveAgent, setUseLiveAgent] = useState(Boolean(product));
  const startedRef = useRef(false);
  const handleComplete = useCallback(() => setStatus("completed"), []);

  useEffect(() => {
    if (!product || startedRef.current) return;

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

        const report = extractVerifiedReport(event);
        if (report) {
          setCompletedStepIds((current) => new Set([...current, "verification-agent", "report-agent"]));
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
          setUseLiveAgent(false);
        }
      })
      .catch((error) => {
        console.warn("ADK stream unavailable, falling back to demo analysis.", error);
        if (!cancelled) {
          setUseLiveAgent(false);
        }
      });

    return () => {
      cancelled = true;
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

  const liveFindings = [
    `${liveAnalysis.trustAnalysis.signals[0]?.value ?? "Yorumlar"} tarandi`,
    liveAnalysis.trustAnalysis.signals[1]?.description ?? "Gorsel analiz tamamlandi",
    liveAnalysis.priceAnalysis.warning || "Fiyat gecmisi kontrol edildi",
    liveAnalysis.returnRiskAnalysis.personalWarning || "Iade sinyalleri analiz edildi",
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
