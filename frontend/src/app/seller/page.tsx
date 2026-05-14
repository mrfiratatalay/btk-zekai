import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import {
  formatSellerPrice,
  getPriorityProducts,
} from "@/lib/mock-data/seller";
import { SellerActionList } from "@/components/seller/SellerActionList";
import { SellerKpiCards } from "@/components/seller/SellerKpiCards";
import { SellerPriorityAlert } from "@/components/seller/SellerPriorityAlert";
import { SellerRiskBadge } from "@/components/seller/SellerRiskBadge";
import { SellerShell } from "@/components/seller/SellerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerPage() {
  const priorityProducts = getPriorityProducts(3);

  return (
    <SellerShell
      title="Satıcı Dashboard"
      description="Mağazanızdaki satış, iade ve AI risk sinyallerini tek ekrandan takip edin."
    >
      <div className="space-y-6">
        <SellerKpiCards />
        <SellerPriorityAlert />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-extrabold">
                  Öncelikli Ürünler
                </CardTitle>
                <p className="mt-1 text-sm text-[#6B7280]">
                  En yüksek risk ve kâr kaybı sinyallerine göre sıralandı.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl bg-white font-bold">
                <Link href="/seller/products">
                  Tüm ürünler
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 font-extrabold leading-5 text-[#111827]">
                        {product.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <SellerRiskBadge score={product.aiRiskScore} />
                        <span className="flex items-center gap-1 font-bold text-[#DC2626]">
                          <TrendingDown className="size-4" />
                          {formatSellerPrice(product.lostProfitMonthly)} / ay
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="h-10 rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700]">
                    <Link href={`/seller/product/${product.id}`}>Analizi Aç</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <SellerActionList />
        </section>
      </div>
    </SellerShell>
  );
}
