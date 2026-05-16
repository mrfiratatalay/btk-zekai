import type { BuyerAnalysis } from "@/types/analysis";
import { FitTab } from "@/components/platform/FitTab";
import { PriceTab } from "@/components/platform/PriceTab";
import { TrustTab } from "@/components/platform/TrustTab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function getScoreColor(score: number) {
  if (score >= 70) return "text-[#16A34A]";
  if (score >= 45) return "text-[#D97706]";
  return "text-[#DC2626]";
}

export function BuyerDecisionTabs({ analysis }: { analysis: BuyerAnalysis }) {
  const tabs = [
    {
      value: "fit",
      label: "Uygunluk",
      metric: `${analysis.scores.fitScore}/100`,
      scoreColor: getScoreColor(analysis.scores.fitScore),
    },
    {
      value: "trust",
      label: "Güven",
      metric: `${analysis.scores.trustScore}/100`,
      scoreColor: getScoreColor(analysis.scores.trustScore),
    },
    {
      value: "price",
      label: "Fiyat",
      metric: `${analysis.scores.priceScore}/100`,
      scoreColor: getScoreColor(analysis.scores.priceScore),
    },
  ];

  return (
    <Tabs defaultValue="fit" className="space-y-5">
      <TabsList className="inline-flex h-auto w-full max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-muted/40 p-1 shadow-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex h-12 min-w-[130px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 text-xs font-semibold text-[#64748B] data-[state=active]:bg-[#EEF2FF] data-[state=active]:text-[#4F46E5] data-[state=active]:shadow-sm"
          >
            <span className="text-[11px] font-bold uppercase tracking-wide">
              {tab.label}
            </span>
            <span className={`text-base font-extrabold ${tab.scoreColor} data-[state=active]:text-[#4F46E5]`}>
              {tab.metric}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="fit">
        <FitTab analysis={analysis} />
      </TabsContent>
      <TabsContent value="trust">
        <TrustTab analysis={analysis} />
      </TabsContent>
      <TabsContent value="price">
        <PriceTab analysis={analysis} />
      </TabsContent>
    </Tabs>
  );
}
