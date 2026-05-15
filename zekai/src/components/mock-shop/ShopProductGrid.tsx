"use client";

import { ArrowRight, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/mock-data/products";
import { ProductCard } from "@/components/mock-shop/ProductCard";
import { Button } from "@/components/ui/button";

export function ShopProductGrid() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  const filtered = activeCategory
    ? products.filter(
        (p) =>
          p.category.toLocaleLowerCase("tr-TR") ===
          activeCategory.toLocaleLowerCase("tr-TR")
      )
    : products;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            {activeCategory ? `${activeCategory} ürünleri` : "Öne çıkan ürünler"}
          </h2>
          {activeCategory && (
            <p className="mt-1 text-sm text-[#6B7280]">
              {filtered.length} ürün bulundu
            </p>
          )}
        </div>
        {!activeCategory && (
          <Link
            href="/mock-shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6000]"
          >
            Tümünü Gör
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] py-16">
          <PackageSearch className="size-12 text-[#D1D5DB]" />
          <div className="text-center">
            <p className="font-extrabold text-[#111827]">Bu kategoride ürün bulunamadı</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Farklı bir kategori seçmeyi deneyin.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-lg border-[#E5E7EB] font-bold"
          >
            <Link href="/mock-shop">Tüm Ürünleri Gör</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
