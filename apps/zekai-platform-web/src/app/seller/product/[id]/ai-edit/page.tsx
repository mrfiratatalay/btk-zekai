import { SellerAIEditClient } from "@/components/seller-studio/SellerAIEditClient";

export default async function SellerAIEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerAIEditClient productId={id} />;
}
