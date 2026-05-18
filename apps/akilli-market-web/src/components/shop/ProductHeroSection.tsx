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
        {bundles[0] && <ProductBundleCard bundle={bundles[0]} />}
      </div>
    </section>
  );
}
