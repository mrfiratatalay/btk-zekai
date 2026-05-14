import type { BuyerAnalysis } from "@/types/analysis";
import { FitTab } from "@/components/buyer/FitTab";
import { PriceTab } from "@/components/buyer/PriceTab";
import { ReturnRiskTab } from "@/components/buyer/ReturnRiskTab";
import { TrustTab } from "@/components/buyer/TrustTab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function BuyerDecisionTabs({ analysis }: { analysis: BuyerAnalysis }) {
  const tabs = [
    { value: "fit", label: "Uygunluk", metric: `${analysis.scores.fitScore}/100`, activeClass: "data-[state=active]:bg-[#EFF6FF] data-[state=active]:text-[#1D4ED8]" },
    { value: "trust", label: "Güven", metric: `${analysis.scores.trustScore}/100`, activeClass: "data-[state=active]:bg-[#F5F3FF] data-[state=active]:text-[#5B2EFF]" },
    { value: "price", label: "Fiyat", metric: `${analysis.scores.priceScore}/100`, activeClass: "data-[state=active]:bg-[#FFF4EC] data-[state=active]:text-[#EA580C]" },
    { value: "return", label: "İade Riski", metric: `%${analysis.scores.returnRiskPercent}`, activeClass: "data-[state=active]:bg-[#FEF2F2] data-[state=active]:text-[#DC2626]" },
  ];

  return (
    <Tabs defaultValue="fit" className="space-y-5">
      <TabsList className="inline-flex h-auto max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`h-11 min-w-[132px] rounded-lg px-3 text-sm font-bold text-[#64748B] data-[state=active]:shadow-sm ${tab.activeClass}`}
          >
            <span>{tab.label}</span>
            <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-extrabold">
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
      <TabsContent value="return">
        <ReturnRiskTab analysis={analysis} />
      </TabsContent>
    </Tabs>
  );
}
