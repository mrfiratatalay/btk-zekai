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
  return (
    <Tabs defaultValue="fit" className="space-y-4">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-sm md:grid-cols-4">
        <TabsTrigger value="fit" className="min-h-11 rounded-lg font-semibold data-[state=active]:bg-[#F5F3FF] data-[state=active]:text-[#5B2EFF]">
          Uygunluk
        </TabsTrigger>
        <TabsTrigger value="trust" className="min-h-11 rounded-lg font-semibold data-[state=active]:bg-[#F5F3FF] data-[state=active]:text-[#5B2EFF]">
          Güven
        </TabsTrigger>
        <TabsTrigger value="price" className="min-h-11 rounded-lg font-semibold data-[state=active]:bg-[#FFF4EC] data-[state=active]:text-[#FF6000]">
          Fiyat
        </TabsTrigger>
        <TabsTrigger value="return" className="min-h-11 rounded-lg font-semibold data-[state=active]:bg-[#FEF2F2] data-[state=active]:text-[#DC2626]">
          İade Riski
        </TabsTrigger>
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
