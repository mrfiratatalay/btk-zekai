"use client";

import { useState } from "react";
import type { AgentStep } from "@/types/analysis";
import { AnalysisLoadingView } from "@/components/buyer/AnalysisLoadingView";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function DebugAgentFlow({
  analysisId,
  steps,
}: {
  analysisId: string;
  steps: AgentStep[];
}) {
  const [completed, setCompleted] = useState(false);

  return (
    <main className="min-h-screen bg-[#F5F6F8] px-4 py-6">
      <div className="mx-auto max-w-[1240px] space-y-6">
        <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <Badge className="rounded-full bg-[#111827] text-white">
                Debug — Agent görünürlüğü
              </Badge>
              <h1 className="mt-3 text-2xl font-extrabold text-[#111827]">
                Agentic akış görselleştirme
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Alıcı karar raporunu hazırlayan ajanların teknik akış ekranı.
              </p>
            </div>
            <p className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#6B7280]">
              {analysisId}
            </p>
          </CardContent>
        </Card>

        <AnalysisLoadingView
          agentSteps={steps}
          userNeedText="Debug modu — kullanıcı senaryosu yok."
          liveFindings={[
            "Yorumlar tarandı",
            "Ürün görselleri karşılaştırıldı",
            "Fiyat geçmişi incelendi",
            "İade kümesi eşleştirildi",
          ]}
          analysisId={analysisId}
          onComplete={() => setCompleted(true)}
        />

        {completed && (
          <Card className="rounded-xl border-[#BBF7D0] bg-[#F0FDF4]">
            <CardContent className="p-4 text-sm font-bold text-[#166534]">
              Teknik akış tamamlandı.
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
