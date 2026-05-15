import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Shield, Tag, Truck } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";
import { products } from "@/lib/mock-data/products";

export default function HomePage() {
  const hero = products[0];
  const promo = products[2];

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-6">
        {/* Hero + promo */}
        <section className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F4EEE8]">
            <div className="grid h-full md:grid-cols-[1fr_1fr]">
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <h1 className="max-w-xs text-4xl font-extrabold leading-tight text-[#111827] lg:text-5xl">
                  Daha akıllı alışveriş
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#555]">
                  Zekai ile satın almadan önce pişmanlık riskini öğren.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/product/${hero.id}`}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF6000] px-5 text-sm font-bold text-white hover:bg-[#E65700] transition-colors"
                  >
                    Alışverişe Başla
                  </Link>
                  <a
                    href="http://localhost:3001"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0a0a0f] bg-[#0a0a0f] px-5 text-sm font-bold text-[#ADFF41] hover:bg-[#111] transition-colors"
                  >
                    Zekai ile Analiz Et
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>
              <div className="relative min-h-[200px]">
                <Image src={hero.image} alt={hero.title} fill sizes="600px" className="object-contain p-6" />
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F0F4FF] p-8">
            <h2 className="text-2xl font-extrabold text-[#111827]">Kargo Bedava</h2>
            <p className="mt-3 text-sm text-[#555]">Seçili ürünlerde ücretsiz kargo fırsatı.</p>
            <Link href={`/product/${promo.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#5B2EFF] hover:underline">
              Ürünlere Git <ArrowRight className="size-4" />
            </Link>
            <div className="absolute bottom-4 right-4 h-40 w-40">
              <Image src={promo.image} alt={promo.title} fill sizes="160px" className="object-contain" />
            </div>
          </div>
        </section>

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
