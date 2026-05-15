import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Search, ShieldCheck, Tag } from "lucide-react";
import { ShopHeader } from "@/components/mock-shop/ShopHeader";
import { ShopProductGrid } from "@/components/mock-shop/ShopProductGrid";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data/products";

export default function MockShopPage() {
  const heroProduct = products[0];
  const promoProduct = products[2];

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <main className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F4EEE8]">
            <div className="grid h-full gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="z-10 flex flex-col justify-center p-8 lg:p-10">
                <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[#232323] lg:text-5xl">
                  Daha akıllı alışveriş, daha iyi seçimler
                </h1>
                <p className="mt-4 max-w-md text-base leading-7 text-[#333333]">
                  İhtiyacına en uygun ürünleri keşfet, fiyat ve yorumları
                  karşılaştır, güvenle satın al.
                </p>
                <Button
                  asChild
                  className="mt-6 h-11 w-fit rounded-lg bg-[#FF6000] px-5 font-bold text-white hover:bg-[#E65700]"
                >
                  <Link href="/mock-shop/product/bluetooth-kulaklik-pro-x1">
                    Alışverişe Başla
                  </Link>
                </Button>
              </div>
              <div className="relative min-h-[260px]">
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-contain p-8 md:object-right"
                />
              </div>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F4EEE8] p-8">
            <div className="relative z-10 max-w-52">
              <h2 className="text-3xl font-extrabold leading-tight text-[#111827]">
                Kargo Bedava Fırsatları
              </h2>
              <p className="mt-5 text-sm leading-6 text-[#232323]">
                Seçili ürünlerde kargo avantajı seni bekliyor.
              </p>
              <Link
                href="/mock-shop/product/ergonomik-calisma-sandalyesi"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#111827] hover:text-[#FF6000]"
              >
                Ürünlere Git
                <ArrowRight className="size-4 text-[#FF6000]" />
              </Link>
            </div>
            <div className="absolute bottom-4 right-4 h-44 w-48">
              <Image
                src={promoProduct.image}
                alt={promoProduct.title}
                fill
                sizes="260px"
                className="object-contain"
              />
            </div>
          </div>
        </section>

        <section className="grid rounded-2xl border border-[#E5E7EB] bg-white shadow-sm md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Doğru ürünü keşfet",
              text: "İhtiyacına göre ürünleri filtrele",
            },
            {
              icon: Tag,
              title: "En iyi fiyatı bul",
              text: "Rekabetçi fiyatlar ve kampanyalar",
            },
            {
              icon: ShieldCheck,
              title: "Güvenle satın al",
              text: "15 gün iade, hızlı kargo garantisi",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-4 border-[#E5E7EB] p-5 md:border-r md:last:border-r-0"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white">
                  <Icon className="size-6 text-[#111827]" />
                </span>
                <div>
                  <h3 className="font-bold text-[#111827]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{item.text}</p>
                </div>
              </div>
            );
          })}
        </section>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl bg-[#F1F5F9]"
                />
              ))}
            </div>
          }
        >
          <ShopProductGrid />
        </Suspense>
      </main>
    </div>
  );
}
