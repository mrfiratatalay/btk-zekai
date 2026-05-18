import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlatformAnalysisPage } from "@/components/platform/PlatformAnalysisPage";
import { getProduct, mapProductDetailToProduct } from "@/lib/api/products";
import { buildBuyerAnalysisFromProduct } from "@/lib/analysis/build-buyer-analysis";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;

  let [productId, ...rest] = analysisId.split("--");
  if (productId.startsWith("analysis-")) {
    productId = productId.replace("analysis-", "");
  }
  let product;
  try {
    product = mapProductDetailToProduct(await getProduct(productId));
  } catch {
    notFound();
  }

  const userNeed = rest.length > 0
    ? decodeURIComponent(rest.join("--").replace(/\+/g, " "))
    : "";
  const analysis = buildBuyerAnalysisFromProduct({
    analysisId,
    product,
    userNeedText: userNeed,
  });

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <PlatformAnalysisPage analysis={analysis} product={product} />
    </Suspense>
  );
}
