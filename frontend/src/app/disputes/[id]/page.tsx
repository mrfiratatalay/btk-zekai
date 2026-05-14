import { notFound } from "next/navigation";
import { ArbiterCaseExperience } from "@/components/arbiter/ArbiterCaseExperience";
import { getArbiterCaseById } from "@/lib/mock-data/arbiter";

export default async function DisputePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const arbiterCase = getArbiterCaseById(id);

  if (!arbiterCase) {
    notFound();
  }

  return <ArbiterCaseExperience arbiterCase={arbiterCase} />;
}
