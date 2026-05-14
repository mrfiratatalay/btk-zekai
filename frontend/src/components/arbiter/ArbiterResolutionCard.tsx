import type { ArbiterCase } from "@/types/arbiter";
import { formatOrderPrice } from "@/lib/mock-data/orders";

export function ArbiterResolutionCard({ arbiterCase }: { arbiterCase: ArbiterCase }) {
  return (
    <section className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#166534]">Önerilen çözüm</h2>
      <p className="mt-2 text-3xl font-extrabold text-[#14532D]">
        %{arbiterCase.resolution.recommendedRefundPercent} kısmi iade
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          {
            label: "Alıcıya iade",
            value: formatOrderPrice(arbiterCase.resolution.refundAmount),
          },
          {
            label: "Satıcıda kalan",
            value: formatOrderPrice(arbiterCase.resolution.sellerKeepsAmount),
          },
          { label: "Ürün durumu", value: "Alıcıda kalır" },
          { label: "Kargo maliyeti", value: "Oluşmaz" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-white p-4">
            <p className="text-sm font-bold text-[#166534]">{item.label}</p>
            <p className="mt-2 text-xl font-extrabold text-[#111827]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-[#166534]">
        {arbiterCase.resolution.operationalImpact} Süreç bugün kapanabilir.
      </p>
    </section>
  );
}
