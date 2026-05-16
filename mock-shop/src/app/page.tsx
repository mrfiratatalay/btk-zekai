import { Suspense } from "react";
import { Shield, Tag, Truck } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-6">
        {/* Features strip */}
        <section className="grid rounded-2xl border border-[#E5E7EB] bg-white shadow-sm md:grid-cols-3">
          {[
            { icon: Shield, title: "Güvenli Alışveriş", text: "15 gün iade garantisi" },
            { icon: Truck, title: "Hızlı Kargo", text: "2 iş günü içinde teslim" },
            { icon: Tag, title: "En İyi Fiyat", text: "Güncel kampanyalar" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-4 border-[#E5E7EB] p-5 md:border-r md:last:border-r-0">
                <span className="flex size-11 items-center justify-center rounded-full border border-[#E5E7EB]">
                  <Icon className="size-5 text-[#111827]" />
                </span>
                <div>
                  <p className="font-bold text-[#111827]">{item.title}</p>
                  <p className="text-sm text-[#6B7280]">{item.text}</p>
                </div>
              </div>
            );
          })}
        </section>

        <Suspense fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#F3F4F6]" />
            ))}
          </div>
        }>
          <ShopProductGrid />
        </Suspense>
      </main>
    </div>
  );
}
