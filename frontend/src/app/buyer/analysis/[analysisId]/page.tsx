import { notFound } from "next/navigation";
import { BuyerAnalysisExperience } from "@/components/buyer/BuyerAnalysisExperience";
import { getBuyerAnalysisById } from "@/lib/mock-data/buyer-analysis";

export default async function BuyerAnalysisPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const analysis = getBuyerAnalysisById(analysisId);

  if (!analysis) {
    notFound();
  }

  return <BuyerAnalysisExperience analysis={analysis} />;
}
