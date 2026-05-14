import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/mock-data/products";

export default function ShopPage() {
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
                  <Link href="/shop/product/bluetooth-kulaklik-pro-x1">
                    Alışverişe Başla
                  </Link>
                </Button>
                <div className="mt-8 flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#FF6000]" />
                  <span className="size-2.5 rounded-full bg-white" />
                  <span className="size-2.5 rounded-full bg-white" />
                </div>
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
                href="/shop/product/ergonomik-calisma-sandalyesi"
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
              title: "Senin için uygun ürünleri keşfet",
              text: "İhtiyacına ve zevkine uygun öneriler",
            },
            {
              icon: Scale,
              title: "Fiyat ve yorumları karşılaştır",
              text: "En iyi seçimi yapman için yanındayız",
            },
            {
              icon: ShieldCheck,
              title: "Satın almadan önce bilinçli karar ver",
              text: "Gerçek kullanıcı yorumları ve detaylı bilgiler",
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

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Öne çıkan ürünler
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6000]"
            >
              Tümünü Gör
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
