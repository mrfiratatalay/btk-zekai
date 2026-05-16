import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ProductHeroSection } from "@/components/shop/ProductHeroSection";
import { ProductDetailTabs } from "@/components/shop/ProductDetailTabs";
import {
  getProduct,
  getProductPriceHistory,
  getProductReviews,
  getProducts,
  mapProductDetailToProduct,
  mapProductListItemToProduct,
} from "@/lib/api/products";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let productDetail;
  try {
    productDetail = await getProduct(id);
  } catch {
    notFound();
  }

  const [reviews, priceHistory, similarItems] = await Promise.all([
    getProductReviews(id),
    getProductPriceHistory(id),
    getProducts({ category: productDetail.category }),
  ]);
  const product = {
    ...mapProductDetailToProduct(productDetail),
    analysisEvidence: {
      reviews: reviews.map((review) => ({ ...review, id: String(review.id) })),
      visualNotes: {
        studioPhotoCount: productDetail.images.length,
        customerPhotoCount: 0,
        consistencyNotes: productDetail.images.length > 1 ? ["Ürün için birden fazla görsel var."] : [],
        redFlags: productDetail.images.length === 0 ? ["Ürün görseli yok."] : [],
      },
      priceHistory,
      market: {
        medianPrice: priceHistory.at(-1)?.marketMedian ?? productDetail.price,
        fairPriceMin: Math.round((priceHistory.at(-1)?.marketMedian ?? productDetail.price) * 0.92),
        fairPriceMax: Math.round((priceHistory.at(-1)?.marketMedian ?? productDetail.price) * 1.08),
        alternativeSellers: [],
      },
      returnReasons: [],
      sellerSignals: {
        storeRating: productDetail.rating,
        shippingScore: productDetail.cargoText ? 80 : 50,
        responseTime: "API kaydında yok",
        riskNotes: [],
      },
    },
  };
  const similar = similarItems
    .filter((item) => item.id !== product.id)
    .slice(0, 4)
    .map(mapProductListItemToProduct);

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
        <ProductHeroSection product={product} />
      </div>
      <div className="border-t border-slate-100">
        <ProductDetailTabs product={product} similarProducts={similar} reviews={reviews.map((review) => ({ ...review, id: String(review.id) }))} />
      </div>
    </div>
  );
}
