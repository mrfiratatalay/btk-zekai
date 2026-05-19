import { SellerSeoClient } from "@/components/seller-studio/SellerSeoClient";

export default async function SellerSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerSeoClient productId={id} />;
}
