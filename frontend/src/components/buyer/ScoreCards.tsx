import { BadgeCheck, ShieldAlert, ShoppingBag, Undo2 } from "lucide-react";
import type { ScoreSummary } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";

const scoreItems = [
  {
    key: "fitScore",
    label: "Uygunluk",
    suffix: "/100",
    icon: BadgeCheck,
    iconClass: "text-[#2563EB]",
    bgClass: "bg-[#EFF6FF]",
  },
  {
    key: "trustScore",
    label: "Güven",
    suffix: "/100",
    icon: ShieldAlert,
    iconClass: "text-[#5B2EFF]",
    bgClass: "bg-[#F5F3FF]",
  },
  {
    key: "priceScore",
    label: "Fiyat",
    suffix: "/100",
    icon: ShoppingBag,
    iconClass: "text-[#FF6000]",
    bgClass: "bg-[#FFF4EC]",
  },
  {
    key: "returnRiskPercent",
    label: "İade Riski",
    suffix: "%",
    icon: Undo2,
    iconClass: "text-[#DC2626]",
    bgClass: "bg-[#FEF2F2]",
  },
] as const;

export function ScoreCards({ scores }: { scores: ScoreSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {scoreItems.map((item) => {
        const Icon = item.icon;
        const value = scores[item.key];

        return (
          <Card key={item.key} className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-medium text-[#6B7280]">{item.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-[#111827]">
                  {item.key === "returnRiskPercent"
                    ? `${value}${item.suffix}`
                    : `${value}${item.suffix}`}
                </p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${item.bgClass}`}>
                <Icon className={`size-6 ${item.iconClass}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
