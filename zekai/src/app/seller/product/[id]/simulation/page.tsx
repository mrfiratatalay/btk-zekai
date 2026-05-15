import { SellerSimulation } from "@/components/seller-studio/SellerSimulation";
import { getSellerProductById } from "@/lib/mock-data/seller";
import { notFound } from "next/navigation";

export default async function SellerSimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getSellerProductById(id);
  if (!product) notFound();
  return <SellerSimulation product={product} />;
}
