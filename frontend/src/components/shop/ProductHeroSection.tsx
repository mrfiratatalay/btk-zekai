"use client";

import { useRef } from "react";
import type { Product } from "@/types/product";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfoPanel } from "@/components/shop/ProductInfoPanel";
import { StickyPurchaseBar } from "@/components/shop/StickyPurchaseBar";

export function ProductHeroSection({ product }: { product: Product }) {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <>
      <section ref={heroRef} className="grid gap-12 pb-12 lg:grid-cols-[1fr_400px]">
        <ProductGallery product={product} />
        <ProductInfoPanel product={product} />
      </section>
      <StickyPurchaseBar product={product} heroRef={heroRef} />
    </>
  );
}
