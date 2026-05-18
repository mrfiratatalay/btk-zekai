import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ProductHeroSection } from "@/components/shop/ProductHeroSection";
import { ProductDetailTabs } from "@/components/shop/ProductDetailTabs";
import {
  getProduct,
  getProductReviews,
  getProductBundles,
  mapProductDetailToProduct,
} from "@/lib/api/products";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let productDetail;
  try {
    productDetail = await getProduct(id);
  } catch {
    notFound();
  }

  const [reviews, bundles] = await Promise.all([
    getProductReviews(id),
    getProductBundles(id),
  ]);
  const product = mapProductDetailToProduct(productDetail);

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-16 border-b" />}>
        <ShopHeader />
      </Suspense>
      <div className="mx-auto max-w-5xl px-6">
        <nav className="flex items-center gap-1.5 py-4 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700">Ana Sayfa</Link>
          <ChevronRight className="size-3.5" />
          <span>{product.category}</span>
          <ChevronRight className="size-3.5" />
          <span className="line-clamp-1 text-slate-600">{product.title}</span>
        </nav>
        <ProductHeroSection product={product} bundles={bundles} />
      </div>
      <div className="border-t border-slate-100">
        <ProductDetailTabs product={product} reviews={reviews.map((review) => ({ ...review, id: String(review.id) }))} />
      </div>
    </div>
  );
}
