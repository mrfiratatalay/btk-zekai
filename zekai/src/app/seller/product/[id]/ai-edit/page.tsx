import { SellerAIEdit } from "@/components/seller-studio/SellerAIEdit";
import { getSellerProductById } from "@/lib/mock-data/seller";
import { notFound } from "next/navigation";

export default async function SellerAIEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getSellerProductById(id);
  if (!product) notFound();
  return <SellerAIEdit product={product} />;
}
