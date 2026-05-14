"use client";

import { useCallback, useState } from "react";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { AnalysisLoadingView } from "@/components/buyer/AnalysisLoadingView";
import { AnalysisResultView } from "@/components/buyer/AnalysisResultView";

export function BuyerAnalysisExperience({
  analysis,
  product,
}: {
  analysis: BuyerAnalysis;
  product?: Product;
}) {
  const [status, setStatus] = useState<"running" | "completed">("running");
  const handleComplete = useCallback(() => setStatus("completed"), []);

  const liveFindings = [
    `${analysis.trustAnalysis.signals[0]?.value ?? "Yorumlar"} tarandı`,
    analysis.trustAnalysis.signals[1]?.description ?? "Görsel analiz tamamlandı",
    analysis.priceAnalysis.warning || "Fiyat geçmişi kontrol edildi",
    analysis.returnRiskAnalysis.personalWarning || "İade sinyalleri analiz edildi",
  ].filter(Boolean) as string[];

  if (status === "running") {
    return (
      <AnalysisLoadingView
        agentSteps={analysis.agentSteps}
        userNeedText={analysis.userNeedText}
        liveFindings={liveFindings}
        product={product}
        analysisId={analysis.analysisId}
        onComplete={handleComplete}
      />
    );
  }

  return <AnalysisResultView analysis={analysis} product={product} />;
}
