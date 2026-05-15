import { SellerProductDetail } from "@/components/seller-studio/SellerProductDetail";
import { getSellerProductById } from "@/lib/mock-data/seller";
import { notFound } from "next/navigation";

export default async function SellerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getSellerProductById(id);
  if (!product) notFound();
  return <SellerProductDetail product={product} />;
}
