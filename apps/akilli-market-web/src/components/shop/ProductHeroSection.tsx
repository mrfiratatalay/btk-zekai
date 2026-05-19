"use client";

import type { Product } from "@/types/product";
import type { PublicProductBundle } from "@/lib/api/products";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfoPanel } from "@/components/shop/ProductInfoPanel";
import { ProductBundleCard } from "@/components/shop/ProductBundleCard";

export function ProductHeroSection({ product, bundles = [] }: { product: Product; bundles?: PublicProductBundle[] }) {
  return (
    <section className="grid gap-12 pb-12 lg:grid-cols-[1fr_400px]">
      <ProductGallery product={product} />
      <div className="space-y-5">
        <ProductInfoPanel product={product} />
        {bundles.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#111827]">Paket Fırsatları</h2>
              <span className="text-xs font-semibold text-slate-400">{bundles.length} paket</span>
            </div>
            {bundles.map((bundle) => (
              <ProductBundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
