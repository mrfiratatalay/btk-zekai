"use client";

import { useState } from "react";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/mock-data/seller";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const marketMedian = 720;
const unitCost = 610;
const shipping = 62;
const commissionRate = 0.08;

type Scenario = "current" | "returnDrop" | "priceDown";

const scenarios: { id: Scenario; label: string; description: string }[] = [
  {
    id: "current",
    label: "Mevcut Durum",
    description: "İade %23, fiyat 1015 TL",
  },
  {
    id: "returnDrop",
    label: "İade %12'ye düşerse",
    description: "Açıklama iyileştirmesi ile hedef",
  },
  {
    id: "priceDown",
    label: "Fiyat 850 TL'ye inerse",
    description: "Pazara uyum stratejisi",
  },
];

function calcProfit(
  sales30d: number,
  price: number,
  returnRatePct: number
) {
  const revenue = sales30d * price;
  const cogs = sales30d * unitCost;
  const shippingCost = sales30d * shipping;
  const commission = revenue * commissionRate;
  const returnCount = (sales30d * returnRatePct) / 100;
  const returnCost = returnCount * (shipping + 80 + 25 + price * commissionRate);
  const net = revenue - cogs - shippingCost - commission - returnCost;
  return { revenue, cogs, shippingCost, commission, returnCost, net: Math.round(net) };
}

export function SellerProfitAnalysis({
  product,
}: {
  product: SellerProductPerformance;
}) {
  const [activeScenario, setActiveScenario] = useState<Scenario>("current");

  const currentCalc = calcProfit(product.sales30d, product.price, product.returnRate);
  const returnDropCalc = calcProfit(product.sales30d, product.price, 12);
  const priceDownCalc = calcProfit(Math.round(product.sales30d * 1.35), 850, product.returnRate);

  const scenarioCalc = {
    current: currentCalc,
    returnDrop: returnDropCalc,
    priceDown: priceDownCalc,
  };

  const active = scenarioCalc[activeScenario];
  const priceGap = Math.round(((product.price - marketMedian) / marketMedian) * 100);
  const returnCount = (product.sales30d * product.returnRate) / 100;

  const metrics = [
    { label: "Satış adedi", value: `${product.sales30d} adet` },
    { label: "Satış geliri", value: formatSellerPrice(active.revenue) },
    { label: "Ürün başı maliyet", value: formatSellerPrice(unitCost) },
    { label: "Kargo", value: formatSellerPrice(active.shippingCost) },
    { label: "Komisyon", value: formatSellerPrice(active.commission) },
    {
      label: "İade maliyeti",
      value: formatSellerPrice(active.returnCost),
      highlight: active.returnCost > active.net,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Scenario picker */}
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-extrabold text-[#111827]">
          Senaryo Simülatörü — farklı stratejilerin etkisini gör
        </h2>
        <div className="grid gap-2 md:grid-cols-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => setActiveScenario(sc.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                activeScenario === sc.id
                  ? "border-[#FF6000] bg-[#FFF4EC]"
                  : "border-[#E5E7EB] bg-white hover:border-[#FF6000]/40"
              )}
            >
              <p className={cn("font-extrabold", activeScenario === sc.id ? "text-[#FF6000]" : "text-[#111827]")}>
                {sc.label}
              </p>
              <p className="mt-0.5 text-xs text-[#6B7280]">{sc.description}</p>
              <p className={cn("mt-2 text-lg font-extrabold", scenarioCalc[sc.id].net < 0 ? "text-[#DC2626]" : "text-[#16A34A]")}>
                {formatSellerPrice(scenarioCalc[sc.id].net)}/ay
              </p>
            </button>
          ))}
        </div>

        {/* Scenario comparison note */}
        {activeScenario !== "current" && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
            <TrendingUp className="size-4 shrink-0 text-[#2563EB]" />
            <p className="text-sm text-[#1E40AF]">
              {activeScenario === "returnDrop"
                ? `İadeyi %12'ye düşürürsen aylık net kâr ${formatSellerPrice(returnDropCalc.net - currentCalc.net)} artar (+%${Math.round(((returnDropCalc.net - currentCalc.net) / Math.abs(currentCalc.net)) * 100)}).`
                : `Fiyatı 850 TL'ye çekersen ve satış hacmi %35 artarsa net kâr ${formatSellerPrice(priceDownCalc.net - currentCalc.net)} artar.`}
            </p>
          </div>
        )}
      </section>

      {/* Metrics grid */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={cn(
              "rounded-xl border p-4 shadow-sm",
              metric.highlight ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-[#E5E7EB] bg-white"
            )}
          >
            <p className={cn("text-sm font-bold", metric.highlight ? "text-[#991B1B]" : "text-[#6B7280]")}>
              {metric.label}
            </p>
            <p className={cn("mt-2 text-2xl font-extrabold", metric.highlight ? "text-[#DC2626]" : "text-[#111827]")}>
              {metric.value}
            </p>
          </div>
        ))}
        {/* Net profit highlight */}
        <div
          className={cn(
            "rounded-xl border p-4 shadow-sm",
            active.net < 2000 ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-[#BBF7D0] bg-[#F0FDF4]"
          )}
        >
          <p className={cn("text-sm font-bold", active.net < 2000 ? "text-[#991B1B]" : "text-[#166534]")}>
            Tahmini aylık net kâr
          </p>
          <p className={cn("mt-2 text-2xl font-extrabold", active.net < 2000 ? "text-[#DC2626]" : "text-[#16A34A]")}>
            {formatSellerPrice(active.net)}
          </p>
        </div>
      </section>

      {/* Return cost breakdown */}
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#D97706]" />
          <div>
            <h3 className="font-extrabold text-[#111827]">İade Maliyeti Detayı</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              Aylık yaklaşık {Math.round(returnCount)} iade — her iade gerçekte ne kadar kaybettiriyor?
            </p>
          </div>
        </div>
        <div className="mt-4 divide-y divide-[#F1F5F9]">
          {[
            { label: "Kargo geri (iade kargo)", value: shipping },
            { label: "Ürün hasarı (ortalama)", value: 80 },
            { label: "İşgücü / operasyon süresi", value: 25 },
            { label: "Komisyon kaybı (%8)", value: Math.round(product.price * commissionRate) },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-[#374151]">{row.label}</span>
              <span className="font-bold text-[#DC2626]">{formatSellerPrice(row.value)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 text-sm font-extrabold">
            <span className="text-[#111827]">Her iade başına toplam kayıp</span>
            <span className="text-[#DC2626]">
              {formatSellerPrice(shipping + 80 + 25 + Math.round(product.price * commissionRate))}
            </span>
          </div>
        </div>
      </section>

      {/* Market position */}
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
            <div>
              <div className="flex justify-between text-sm font-bold">
                <span>En düşük rakip</span>
                <span>{formatSellerPrice(650)}</span>
              </div>
              <Progress value={64} className="mt-2 h-2 bg-[#DCFCE7]" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
            <TrendingUp className="mb-2 size-5 text-[#7C3AED]" />
            <h3 className="font-extrabold text-[#312E81]">Premiuma oyna</h3>
            <p className="mt-2 text-sm leading-6 text-[#4C1D95]">
              Açıklama, fotoğraf, garanti ve teknik bilgi güçlendirilirse yüksek
              fiyat daha savunulabilir hale gelir.
            </p>
            <p className="mt-3 text-sm font-extrabold text-[#5B2EFF]">
              Tahmini etki: Dönüşüm %5 → %12
            </p>
          </div>
          <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-5">
            <TrendingDown className="mb-2 size-5 text-[#C2410C]" />
            <h3 className="font-extrabold text-[#9A3412]">Pazara in</h3>
            <p className="mt-2 text-sm leading-6 text-[#9A3412]">
              Fiyatı 850 TL&apos;ye indirirsen dönüşüm artar; iade maliyetiyle
              birlikte hesaplanmalı.
            </p>
            <p className="mt-3 text-sm font-extrabold text-[#C2410C]">
              Tahmini etki: Dönüşüm %5 → %18
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
