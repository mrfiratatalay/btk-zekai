import { notFound } from "next/navigation";
import { DebugAgentFlow } from "@/components/debug/DebugAgentFlow";
import { getBuyerAnalysisById } from "@/lib/mock-data/buyer-analysis";

export default async function DebugAgentsPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const analysis = getBuyerAnalysisById(analysisId);

  if (!analysis) {
    notFound();
  }

  return <DebugAgentFlow analysisId={analysisId} steps={analysis.agentSteps} />;
}
