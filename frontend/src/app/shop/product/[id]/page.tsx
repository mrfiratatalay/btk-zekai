import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { ProductHeroSection } from "@/components/shop/ProductHeroSection";
import { ProductDetailTabs } from "@/components/shop/ProductDetailTabs";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { getProductById, getSimilarProducts } from "@/lib/mock-data/products";

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const similarProducts = getSimilarProducts(product.id);

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-16 border-b border-slate-100" />}>
        <ShopHeader />
      </Suspense>

      <div className="mx-auto max-w-5xl px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 py-4 text-xs text-slate-400">
          <Link href="/shop" className="hover:text-slate-700">Ana Sayfa</Link>
          <ChevronRight className="size-3.5" />
          <span>{product.category}</span>
          <ChevronRight className="size-3.5" />
          <span className="line-clamp-1 text-slate-600">{product.title}</span>
        </nav>

        {/* Hero + sticky bar */}
        <ProductHeroSection product={product} />
      </div>

      {/* Tabs */}
      <div className="border-t border-slate-100">
        <ProductDetailTabs product={product} similarProducts={similarProducts} />
      </div>
    </div>
  );
}
