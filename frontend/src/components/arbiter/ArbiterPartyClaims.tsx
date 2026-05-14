import Image from "next/image";
import type { ArbiterCase } from "@/types/arbiter";
import { formatOrderPrice } from "@/lib/mock-data/orders";

export function ArbiterPartyClaims({ arbiterCase }: { arbiterCase: ArbiterCase }) {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#111827]">Uyuşmazlık özeti</h2>
      <div className="mt-5 flex gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
          <Image
            src={arbiterCase.productImage}
            alt={arbiterCase.productTitle}
            fill
            sizes="96px"
            className="object-contain p-3"
          />
        </div>
        <div>
          <h3 className="font-extrabold text-[#111827]">
            {arbiterCase.productTitle}
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Sipariş tutarı: {formatOrderPrice(arbiterCase.orderAmount)}
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Teslim: {arbiterCase.deliveryDate} · İade: {arbiterCase.returnOpenedAt}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-[#F8FAFC] p-4">
          <p className="font-extrabold text-[#111827]">Alıcı iddiası</p>
          <p className="mt-2 text-sm leading-6 text-[#374151]">
            {arbiterCase.buyerClaim}
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] p-4">
          <p className="font-extrabold text-[#111827]">Satıcı iddiası</p>
          <p className="mt-2 text-sm leading-6 text-[#374151]">
            {arbiterCase.sellerClaim}
          </p>
        </div>
      </div>
    </section>
  );
}
