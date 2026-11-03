import { notFound } from "next/navigation";
import { DemoProductPage } from "@/components/demo/DemoProductPage";
import { ProductPageView } from "@/components/shop/ProductPageView";
import {
  getProduct,
  getProductReviews,
  getProductBundles,
  getProductFaqs,
  mapProductDetailToProduct,
} from "@/lib/api/products";
import { isDemoMode } from "@/lib/api/transport";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The demo keeps its data in the visitor's browser, so the page is filled there.
  if (isDemoMode) return <DemoProductPage id={id} />;

  let productDetail;
  try {
    productDetail = await getProduct(id);
  } catch {
    notFound();
  }

  const [reviews, bundles, faqs] = await Promise.all([
    getProductReviews(id),
    getProductBundles(id),
    getProductFaqs(id),
  ]);

  return (
    <ProductPageView
      product={mapProductDetailToProduct(productDetail)}
      reviews={reviews}
      bundles={bundles}
      faqs={faqs}
    />
  );
}
