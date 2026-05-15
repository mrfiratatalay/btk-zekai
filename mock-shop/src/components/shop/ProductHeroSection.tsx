"use client";

import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfoPanel } from "@/components/shop/ProductInfoPanel";

export function ProductHeroSection({ product }: { product: Product }) {
  return (
    <section className="grid gap-12 pb-12 lg:grid-cols-[1fr_400px]">
      <ProductGallery product={product} />
      <ProductInfoPanel product={product} />
    </section>
  );
}
