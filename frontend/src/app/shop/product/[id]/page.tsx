import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Box,
  ChevronRight,
  Home,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfoPanel } from "@/components/shop/ProductInfoPanel";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Badge } from "@/components/ui/badge";
import {
  getProductById,
  getSimilarProducts,
} from "@/lib/mock-data/products";

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const similarProducts = getSimilarProducts(product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <main className="mx-auto flex max-w-[1440px] flex-col gap-7 px-6 py-6">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
          <Link href="/shop" className="flex items-center gap-1 hover:text-[#FF6000]">
            <Home className="size-4" />
            Ana Sayfa
          </Link>
          <ChevronRight className="size-4" />
          <span>Elektronik</span>
          <ChevronRight className="size-4" />
          <span>Ses & Görüntü</span>
          <ChevronRight className="size-4" />
          <span>Kulaklık & Mikrofon</span>
          <ChevronRight className="size-4" />
          <span className="font-semibold text-[#2563EB]">{product.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[520px_minmax(0,1fr)_320px]">
          <ProductGallery product={product} />
          <ProductInfoPanel product={product} />

          <aside className="space-y-4">
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#FFF4EC] text-[#FF6000]">
                  <Store className="size-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-[#111827]">
                      {product.sellerName}
                    </h2>
                    <BadgeCheck className="size-4 fill-[#2563EB] text-white" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Badge className="rounded-md bg-[#DCFCE7] px-2 py-1 text-[#16A34A]">
                      9.2
                    </Badge>
                    <span className="text-sm text-[#374151]">Mağaza Puanı</span>
                  </div>
                  <Link
                    href="/shop"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#2563EB]"
                  >
                    Mağazaya Git
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <h2 className="font-extrabold text-[#111827]">Kargo & Teslimat</h2>
              <div className="mt-5 grid gap-5 text-sm">
                <div className="flex items-center gap-4">
                  <Truck className="size-6 text-[#334155]" />
                  <div>
                    <p className="text-[#6B7280]">Tahmini Teslimat</p>
                    <p className="font-extrabold text-[#16803A]">Yarın kapında</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Box className="size-6 text-[#334155]" />
                    <p className="font-semibold text-[#111827]">Kargo Bedava</p>
                  </div>
                  <Badge className="rounded-md bg-[#16A34A] text-white">Ücretsiz</Badge>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-7 text-[#FF6000]" />
                <h2 className="font-extrabold text-[#111827]">Zekai Güven Rozeti</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#6B7280]">
                Bu ürün Zekai tarafından analiz edildi.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-[#374151]">
                {[
                  "Yorumlar tarandı",
                  "Fiyat geçmişi kontrol edildi",
                  "Satıcı güven skoru hesaplandı",
                  "İade riski değerlendirildi",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <PackageCheck className="size-4 text-[#16A34A]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-[#111827]">Benzer Ürünler</h2>
                <Link href="/shop" className="text-sm font-bold text-[#2563EB]">
                  Tümünü Gör
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {similarProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/product/${item.id}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8F8F8]"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="100px"
                      className="object-contain p-2"
                    />
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="flex overflow-x-auto border-b border-[#E5E7EB] px-4">
            {["Ürün Açıklaması", "Teknik Özellikler", `Yorumlar (${product.reviewCount.toLocaleString("tr-TR")})`, "Soru & Cevap (142)"].map(
              (tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`min-w-max border-b-2 px-5 py-4 text-sm font-bold ${
                    index === 0
                      ? "border-[#FF6000] text-[#111827]"
                      : "border-transparent text-[#374151]"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827]">
                Ürün Açıklaması
              </h2>
              <p className="mt-4 max-w-4xl leading-7 text-[#4B5563]">
                {product.description}
              </p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB]">
              {Object.entries(product.features).map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-[150px_1fr] gap-3 border-b border-[#E5E7EB] px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="text-[#6B7280]">{key}</span>
                  <span className="font-bold text-[#111827]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
