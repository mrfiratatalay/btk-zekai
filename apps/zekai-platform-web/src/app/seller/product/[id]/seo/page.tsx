import { redirect } from "next/navigation";

export default async function SellerSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/seller/product/${id}/ai-edit`);
}
