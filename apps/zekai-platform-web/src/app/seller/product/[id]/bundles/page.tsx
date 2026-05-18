import { SellerBundlesClient } from "@/components/seller-studio/SellerBundlesClient";

export default async function SellerBundlesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerBundlesClient productId={id} />;
}
