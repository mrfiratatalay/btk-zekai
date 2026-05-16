import { SellerProductDetailClient } from "@/components/seller-studio/SellerProductDetailClient";

export default async function SellerProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SellerProductDetailClient productId={id} />;
}
