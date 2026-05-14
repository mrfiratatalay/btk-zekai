import type { BuyerAnalysis } from "@/types/analysis";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ReturnRiskTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">İade riski</p>
            <p className="mt-1 text-4xl font-extrabold text-[#DC2626]">
              %{analysis.scores.returnRiskPercent}
            </p>
          </div>
          <Progress value={analysis.scores.returnRiskPercent} />
          <p className="text-sm leading-6 text-[#6B7280]">
            {analysis.returnRiskAnalysis.summary}
          </p>
          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-[#7F1D1D]">
            <div className="flex gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm leading-6">
                {analysis.returnRiskAnalysis.personalWarning}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <h3 className="font-bold text-[#111827]">Geçmiş iadelerden öğrendiklerimiz</h3>
          <div className="space-y-3">
            {analysis.returnRiskAnalysis.reasons.map((reason) => (
              <div key={reason.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#374151]">{reason.label}</span>
                  <span className="font-bold text-[#111827]">%{reason.percent}</span>
                </div>
                <Progress value={reason.percent} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
