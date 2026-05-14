import { notFound } from "next/navigation";
import { getSellerProductById } from "@/lib/mock-data/seller";
import { SellerImprovementAssistant } from "@/components/seller/SellerImprovementAssistant";
import { SellerProductHeader } from "@/components/seller/SellerProductHeader";
import { SellerProfitAnalysis } from "@/components/seller/SellerProfitAnalysis";
import { SellerReturnRootCause } from "@/components/seller/SellerReturnRootCause";
import { SellerShell } from "@/components/seller/SellerShell";
import { SyntheticCustomerPanel } from "@/components/seller/SyntheticCustomerPanel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default async function SellerProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getSellerProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <SellerShell
      title="Ürün Analiz Merkezi"
      description="Mevcut ürün verisiyle müşteri kaybı, kâr etkisi, iade kök nedeni ve iyileştirme aksiyonlarını takip edin."
    >
      <div className="space-y-6">
        <SellerProductHeader product={product} />

        <Tabs defaultValue="customers" className="space-y-5">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-sm">
            <TabsTrigger value="customers" className="rounded-lg px-4 py-2 font-bold">
              Sentetik Müşteri Paneli
            </TabsTrigger>
            <TabsTrigger value="profit" className="rounded-lg px-4 py-2 font-bold">
              Kâr & Fiyat Analizi
            </TabsTrigger>
            <TabsTrigger value="returns" className="rounded-lg px-4 py-2 font-bold">
              İade Kök Neden Analizi
            </TabsTrigger>
            <TabsTrigger value="assistant" className="rounded-lg px-4 py-2 font-bold">
              İyileştirme Asistanı
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <SyntheticCustomerPanel />
          </TabsContent>
          <TabsContent value="profit">
            <SellerProfitAnalysis product={product} />
          </TabsContent>
          <TabsContent value="returns">
            <SellerReturnRootCause />
          </TabsContent>
          <TabsContent value="assistant">
            <SellerImprovementAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </SellerShell>
  );
}
