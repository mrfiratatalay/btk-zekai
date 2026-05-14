import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/mock-data/seller";
import { Progress } from "@/components/ui/progress";

export function SellerProfitAnalysis({
  product,
}: {
  product: SellerProductPerformance;
}) {
  const revenue = product.sales30d * product.price;
  const unitCost = 610;
  const shipping = 62;
  const commission = 132;
  const returnCost = 94;
  const estimatedNetProfit = 1316;
  const expectedProfit = 9400;
  const marketMedian = 720;
  const priceGap = Math.round(((product.price - marketMedian) / marketMedian) * 100);

  const metrics = [
    { label: "Satış", value: `${product.sales30d} adet` },
    { label: "Satış geliri", value: formatSellerPrice(revenue) },
    { label: "Ürün başı maliyet", value: formatSellerPrice(unitCost) },
    { label: "Kargo", value: formatSellerPrice(shipping) },
    { label: "Komisyon", value: formatSellerPrice(commission) },
    { label: "İade maliyeti", value: formatSellerPrice(returnCost) },
    { label: "Tahmini aylık net kâr", value: formatSellerPrice(estimatedNetProfit) },
    { label: "Beklenen kâr", value: formatSellerPrice(expectedProfit) },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-bold text-[#6B7280]">{metric.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-[#111827]">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#111827]">Pazar konumu</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            Bu satıcı fiyatı pazar medyanının %{priceGap} üzerinde. Premium fiyat
            savunulmazsa dönüşüm düşer.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold">
                <span>Bu satıcı</span>
                <span>{formatSellerPrice(product.price)}</span>
              </div>
              <Progress value={100} className="mt-2 h-2 bg-[#FFF4EC]" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold">
                <span>Pazar medyanı</span>
                <span>{formatSellerPrice(marketMedian)}</span>
              </div>
              <Progress value={71} className="mt-2 h-2 bg-[#E0F2FE]" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
            <h3 className="font-extrabold text-[#312E81]">Premiuma oyna</h3>
            <p className="mt-2 text-sm leading-6 text-[#4C1D95]">
              Açıklama, fotoğraf, garanti ve teknik bilgi güçlendirilirse yüksek
              fiyat daha savunulabilir hale gelir.
            </p>
          </div>
          <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-5">
            <h3 className="font-extrabold text-[#9A3412]">Pazara in</h3>
            <p className="mt-2 text-sm leading-6 text-[#9A3412]">
              Fiyatı medyana yaklaştırmak dönüşümü artırabilir; bu strateji iade
              maliyetiyle birlikte ölçülmeli.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
