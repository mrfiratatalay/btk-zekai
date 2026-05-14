import type { ArbiterCase } from "@/types/arbiter";
import { formatOrderPrice } from "@/lib/mock-data/orders";
import { Badge } from "@/components/ui/badge";

export function ArbiterDecisionHeader({ arbiterCase }: { arbiterCase: ArbiterCase }) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <Badge className="rounded-full bg-[#111827] text-white">
        AI Hakem Kararı
      </Badge>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] md:text-4xl">
            Satıcı %{arbiterCase.sellerRightPercent} haklı - Alıcı %
            {arbiterCase.buyerRightPercent} haklı
          </h1>
          <p className="mt-3 text-lg font-bold text-[#5B2EFF]">
            Önerilen çözüm: %{arbiterCase.resolution.recommendedRefundPercent} kısmi
            iade
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Kanıtlar iki tarafın da kısmen haklı olduğunu gösteriyor. En düşük
            operasyon maliyetli çözüm kısmi iadeyle dosyanın kapanması.
          </p>
        </div>
        <div className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
          <p className="text-sm font-bold text-[#4C1D95]">Kısmi iade tutarı</p>
          <p className="mt-2 text-4xl font-extrabold text-[#312E81]">
            {formatOrderPrice(arbiterCase.resolution.refundAmount)}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#4C1D95]">
            Sipariş tutarı {formatOrderPrice(arbiterCase.orderAmount)}.
          </p>
        </div>
      </div>
    </section>
  );
}
