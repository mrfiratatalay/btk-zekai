import { SellerCustomerVoiceClient } from "@/components/seller-studio/SellerCustomerVoiceClient";

export default async function SellerCustomerVoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerCustomerVoiceClient productId={id} />;
}
