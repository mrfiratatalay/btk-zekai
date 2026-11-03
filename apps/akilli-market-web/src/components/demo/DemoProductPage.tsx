"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductPageView } from "@/components/shop/ProductPageView";
import {
  getProduct,
  getProductBundles,
  getProductFaqs,
  getProductReviews,
  mapProductDetailToProduct,
  type ProductFaq,
  type PublicProductBundle,
} from "@/lib/api/products";
import type { Product, ProductReview } from "@/types/product";

type PageData = { product: Product; reviews: ProductReview[]; bundles: PublicProductBundle[]; faqs: ProductFaq[] };

/** Same product page, filled in the browser from the same API functions as the real page. */
export function DemoProductPage({ id }: { id: string }) {
  const [data, setData] = useState<PageData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const detail = await getProduct(id);
        const [reviews, bundles, faqs] = await Promise.all([getProductReviews(id), getProductBundles(id), getProductFaqs(id)]);
        if (active) setData({ product: mapProductDetailToProduct(detail), reviews, bundles, faqs });
      } catch {
        if (active) setMissing(true);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (missing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-bold text-[#111827]">Ürün bulunamadı</p>
        <p className="text-sm text-[#6B7280]">Ürün yayından kaldırılmış ya da silinmiş olabilir.</p>
        <Link href="/" className="text-sm font-bold text-[#FF6000] hover:underline">Alışverişe dön</Link>
      </div>
    );
  }
  if (!data) {
    return <div className="mx-auto mt-24 h-96 max-w-5xl animate-pulse rounded-2xl bg-[#F3F4F6]" />;
  }
  return <ProductPageView {...data} />;
}
