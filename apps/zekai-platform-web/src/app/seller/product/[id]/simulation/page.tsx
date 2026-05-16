import { SellerSimulationClient } from "@/components/seller-studio/SellerSimulationClient";

export default async function SellerSimulationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerSimulationClient productId={id} />;
}
