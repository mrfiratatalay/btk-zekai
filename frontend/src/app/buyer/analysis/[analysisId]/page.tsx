import { notFound } from "next/navigation";
import { BuyerAnalysisExperience } from "@/components/buyer/BuyerAnalysisExperience";
import { getBuyerAnalysisById } from "@/lib/mock-data/buyer-analysis";
import { getProductById } from "@/lib/mock-data/products";

export default async function BuyerAnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ analysisId: string }>;
  searchParams: Promise<{ need?: string }>;
}) {
  const { analysisId } = await params;
  const { need } = await searchParams;
  const analysis = getBuyerAnalysisById(analysisId, need);

  if (!analysis) notFound();

  const product = getProductById(analysisId);

  return <BuyerAnalysisExperience analysis={analysis} product={product} />;
}
