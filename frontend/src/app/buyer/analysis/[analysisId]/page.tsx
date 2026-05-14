import { notFound } from "next/navigation";
import { BuyerAnalysisExperience } from "@/components/buyer/BuyerAnalysisExperience";
import { getBuyerAnalysisById } from "@/lib/mock-data/buyer-analysis";

export default async function BuyerAnalysisPage({
  searchParams,
  params,
}: {
  params: Promise<{ analysisId: string }>;
  searchParams: Promise<{ need?: string }>;
}) {
  const { analysisId } = await params;
  const { need } = await searchParams;
  const analysis = getBuyerAnalysisById(analysisId, need);

  if (!analysis) {
    notFound();
  }

  return <BuyerAnalysisExperience analysis={analysis} />;
}
