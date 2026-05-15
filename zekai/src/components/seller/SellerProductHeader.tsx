import Image from "next/image";
import {
  AlertTriangle,
  BadgePercent,
  Boxes,
  PackageCheck,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/mock-data/seller";
import { Badge } from "@/components/ui/badge";
import { SellerRiskBadge } from "@/components/seller/SellerRiskBadge";

const statItems = [
  { key: "price", label: "Fiyat", icon: BadgePercent },
  { key: "stock", label: "Stok", icon: Boxes },
  { key: "sales", label: "30g satış", icon: ShoppingCart },
  { key: "return", label: "İade oranı", icon: PackageCheck },
] as const;

export function SellerProductHeader({
  product,
}: {
  product: SellerProductPerformance;
}) {
  const values = {
    price: formatSellerPrice(product.price),
    stock: `${product.stock} adet`,
    sales: `${product.sales30d} sipariş`,
    return: `%${product.returnRate}`,
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <div className="relative min-h-[260px] border-b border-[#E5E7EB] bg-[#F8FAFC] lg:border-b-0 lg:border-r">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-contain p-8"
            priority
          />
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-[#E5E7EB] bg-[#F8FAFC] text-[#374151]">
                  {product.category}
                </Badge>
                <SellerRiskBadge score={product.aiRiskScore} />
              </div>
              <h1 className="mt-3 max-w-4xl text-2xl font-extrabold tracking-tight text-[#111827] md:text-3xl">
                {product.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Son sinyal: {product.mainIssue}. {product.lastAction}.
              </p>
            </div>

            <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[#991B1B] xl:w-[320px]">
              <div className="flex items-center gap-2 text-sm font-extrabold">
                <AlertTriangle className="size-4" />
                Ana uyarı
              </div>
              <p className="mt-2 text-2xl font-extrabold">
                {formatSellerPrice(product.lostProfitMonthly)}
              </p>
              <p className="mt-1 text-sm leading-5">
                aylık yaklaşık kâr kaybı
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#6B7280]">
                    <Icon className="size-4 text-[#FF6000]" />
                    {item.label}
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-[#111827]">
                    {values[item.key]}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="mt-0.5 size-5 shrink-0 text-[#B45309]" />
              <p className="text-sm leading-6 text-[#78350F]">
                Yüksek iade oranı, mikrofon beklentisi, oyun gecikmesi
                belirsizliği ve fiyat algısı dönüşümü düşürüyor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
