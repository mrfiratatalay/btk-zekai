import { SellerSocialMediaClient } from "@/components/seller-studio/SellerSocialMediaClient";

export default async function SellerSocialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerSocialMediaClient productId={id} />;
}
