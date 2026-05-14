import { Quote } from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function FitTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Uygunluk skoru</p>
            <p className="mt-1 text-4xl font-extrabold text-[#2563EB]">
              {analysis.scores.fitScore}/100
            </p>
          </div>
          <Progress value={analysis.scores.fitScore} />
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-4">
            <Quote className="mb-2 size-4 text-[#6B7280]" />
            <p className="text-sm leading-6 text-[#6B7280]">
              {analysis.userNeedText}
            </p>
          </div>
          <p className="text-sm leading-6 text-[#6B7280]">
            {analysis.fitAnalysis.summary}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {analysis.fitAnalysis.subScores.map((item) => (
          <Card key={item.label} className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-[#111827]">{item.label}</h3>
                <span className="text-lg font-extrabold text-[#111827]">
                  {item.score}/100
                </span>
              </div>
              <Progress value={item.score} />
              <p className="text-sm leading-6 text-[#6B7280]">{item.reason}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="rounded-xl border-[#BFDBFE] bg-[#EFF6FF] shadow-sm">
          <CardContent className="space-y-3 p-4">
            <h3 className="font-bold text-[#1E3A8A]">
              Aynı ürün, farklı kullanım senaryoları
            </h3>
            <div className="grid gap-2">
              {analysis.fitAnalysis.scenarioComparisons.map((item) => (
                <div
                  key={item.scenario}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span className="text-[#374151]">{item.scenario}</span>
                  <span className="font-bold text-[#2563EB]">{item.score}/100</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
