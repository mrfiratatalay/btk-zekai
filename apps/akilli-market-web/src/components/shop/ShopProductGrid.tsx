"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProducts, mapProductListItemToProduct } from "@/lib/api/products";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";

export function ShopProductGrid() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts(activeCategory ? { category: activeCategory } : undefined)
      .then((items) => setProducts(items.map(mapProductListItemToProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            {activeCategory ? `${activeCategory} ürünleri` : "Öne çıkan ürünler"}
          </h2>
          {activeCategory && (
            <p className="mt-1 text-sm text-[#6B7280]">
              {products.length} ürün bulundu
            </p>
          )}
        </div>
        {activeCategory && (
          <Link href="/" className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#FF6000]">
            Tümünü Gör
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#E5E7EB]">
          <Loader2 className="size-7 animate-spin text-[#FF6000]" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
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
          <Button asChild variant="outline" className="rounded-lg border-[#E5E7EB] font-bold">
            <Link href="/">Tüm Ürünleri Gör</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
