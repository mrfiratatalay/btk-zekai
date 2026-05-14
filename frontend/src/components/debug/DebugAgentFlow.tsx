"use client";

import { useState } from "react";
import type { AgentStep } from "@/types/analysis";
import { AgentFlowDemo } from "@/components/buyer/AgentFlowDemo";
import { Badge } from "@/components/ui/badge";

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
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <Badge className="rounded-full bg-[#111827] text-white">
            Debug agent görünürlüğü
          </Badge>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
                Agentic akış görselleştirme
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
                Alıcı karar raporunu hazırlayan ajanların sıralı çalışma akışı
                teknik demo ekranında gösterilir.
              </p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#111827]">
              {analysisId}
            </div>
          </div>
        </section>

        <AgentFlowDemo steps={steps} onComplete={() => setCompleted(true)} />

        {completed ? (
          <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm font-bold text-[#166534]">
            Teknik akış tamamlandı. Kullanıcıya görünen ana rapor ekranı React
            Flow kullanmaz.
          </div>
        ) : null}
      </div>
    </main>
  );
}
