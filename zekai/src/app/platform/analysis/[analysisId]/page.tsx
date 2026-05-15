import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlatformAnalysisPage } from "@/components/platform/PlatformAnalysisPage";
import { getBuyerAnalysis } from "@/lib/mock-data/buyer-analysis";
import { getProductById } from "@/lib/mock-data/products";

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
  const product = getProductById(productId);
  if (!product) notFound();

  const userNeed = rest.length > 0
    ? decodeURIComponent(rest.join("--").replace(/\+/g, " "))
    : "";
  const analysis = getBuyerAnalysis(product, userNeed, analysisId);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <PlatformAnalysisPage analysis={analysis} product={product} />
    </Suspense>
  );
}
