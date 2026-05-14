import Image from "next/image";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import {
  formatSellerPrice,
  getPriorityProducts,
} from "@/lib/mock-data/seller";
import { SellerActionList } from "@/components/seller/SellerActionList";
import { SellerDashboardSummary } from "@/components/seller/SellerDashboardSummary";
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
        <SellerDashboardSummary />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] xl:items-stretch">
          <Card className="flex h-full min-h-0 flex-col rounded-xl border-[#E5E7EB] bg-white shadow-sm">
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
            <CardContent className="flex flex-1 flex-col space-y-3">
              {priorityProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 sm:gap-4 sm:p-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] sm:size-16">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-extrabold leading-5 text-[#111827] sm:leading-snug">
                        {product.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm sm:mt-2 sm:gap-3">
                        <SellerRiskBadge score={product.aiRiskScore} />
                        <span className="flex items-center gap-1 font-bold text-[#DC2626]">
                          <TrendingDown className="size-4" />
                          {formatSellerPrice(product.lostProfitMonthly)} / ay
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
                        {product.mainIssue}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="h-9 w-full shrink-0 rounded-xl bg-[#FF6000] text-sm font-bold text-white hover:bg-[#E65700] sm:h-10 md:w-auto"
                  >
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
