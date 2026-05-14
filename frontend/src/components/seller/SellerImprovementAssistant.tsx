import { sellerImprovements } from "@/lib/mock-data/seller";
import { SellerImprovementCard } from "@/components/seller/SellerImprovementCard";

export function SellerImprovementAssistant() {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
        <h2 className="text-xl font-extrabold text-[#312E81]">
          Bu ürün için 7 iyileştirme önerisi hazır
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4C1D95]">
          Öneriler iade kök nedeni, sentetik müşteri itirazı ve kâr etkisine göre
          önceliklendirildi.
        </p>
      </section>

      <section className="space-y-4">
        {sellerImprovements.map((improvement) => (
          <SellerImprovementCard key={improvement.id} improvement={improvement} />
        ))}
      </section>
    </div>
  );
}
