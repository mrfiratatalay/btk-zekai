import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { BuyerAnalysis, TrustSignal } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const toneClasses: Record<TrustSignal["tone"], string> = {
  danger: "border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D]",
  warning: "border-[#FCD34D] bg-[#FFFBEB] text-[#78350F]",
  success: "border-[#BBF7D0] bg-[#F0FDF4] text-[#14532D]",
};

const toneIcons = {
  danger: ShieldAlert,
  warning: AlertTriangle,
  success: CheckCircle2,
};

export function TrustTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="space-y-4">
      <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[240px_1fr]">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Güven skoru</p>
            <p className="mt-1 text-4xl font-extrabold text-[#5B2EFF]">
              {analysis.scores.trustScore}/100
            </p>
            <Progress className="mt-4" value={analysis.scores.trustScore} />
          </div>
          <p className="text-sm leading-7 text-[#6B7280]">
            {analysis.trustAnalysis.summary}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {analysis.trustAnalysis.signals.map((signal) => {
          const Icon = toneIcons[signal.tone];

          return (
            <Card
              key={signal.title}
              className={cn("rounded-xl shadow-sm", toneClasses[signal.tone])}
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{signal.title}</h3>
                    <p className="text-sm font-bold">{signal.value}</p>
                  </div>
                  <Icon className="size-5 shrink-0" />
                </div>
                <p className="text-sm leading-6 opacity-80">
                  {signal.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
