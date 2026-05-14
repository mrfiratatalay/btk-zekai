"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { BuyerAnalysis } from "@/types/analysis";
import { AnalysisHeader } from "@/components/buyer/AnalysisHeader";
import { BuyerAnalysisStepper } from "@/components/buyer/BuyerAnalysisStepper";
import { BuyerDecisionTabs } from "@/components/buyer/BuyerDecisionTabs";
import { FinalAdviceCard } from "@/components/buyer/FinalAdviceCard";
import { ScoreCards } from "@/components/buyer/ScoreCards";
import { Badge } from "@/components/ui/badge";

const cautionReasons = [
  "Mikrofon yorumlarında tekrar eden şikayetler var.",
  "Oyun için gecikme bilgisi net değil.",
  "Fiyat pazar medyanının üzerinde.",
  "İade sebepleri senin kullanım senaryonla çakışıyor.",
];

export function BuyerAnalysisExperience({
  analysis,
}: {
  analysis: BuyerAnalysis;
}) {
  const [reportVisible, setReportVisible] = useState(false);
  const showReport = useCallback(() => setReportVisible(true), []);

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <main className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm md:p-6">
          <Badge className="rounded-full bg-[#5B2EFF] text-white">
            Alıcı analizi
          </Badge>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] md:text-4xl">
                Karar raporun hazırlanıyor
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280] md:text-base">
                Ürün, yorumlar, fiyat ve iade sinyalleri senin kullanım
                senaryona göre inceleniyor.
              </p>
            </div>
            <p className="w-fit rounded-lg border border-[#E5E7EB] bg-[#F5F6F8] px-3 py-2 text-sm font-medium text-[#6B7280]">
              Analiz ID: {analysis.analysisId}
            </p>
          </div>
        </section>

        {!reportVisible ? (
          <BuyerAnalysisStepper
            agentSteps={analysis.agentSteps}
            userNeedText={analysis.userNeedText}
            onComplete={showReport}
          />
        ) : (
          <motion.section
            className="space-y-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <AnalysisHeader analysis={analysis} />
            <ScoreCards scores={analysis.scores} />
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold tracking-tight text-[#111827]">
                Neden dikkatli olmalısın?
              </h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {cautionReasons.map((reason, index) => (
                  <div
                    key={reason}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#FFF4EC] text-sm font-extrabold text-[#FF6000]">
                      {index + 1}
                    </span>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#111827]">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <BuyerDecisionTabs analysis={analysis} />
            <FinalAdviceCard analysis={analysis} />
          </motion.section>
        )}
      </main>
    </div>
  );
}
