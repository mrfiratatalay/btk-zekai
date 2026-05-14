import { notFound } from "next/navigation";
import { getProductById } from "@/lib/mock-data/products";
import { AlternativesPage } from "@/components/buyer/AlternativesPage";

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ need?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { productId } = await params;
  const { need } = await searchParams;
  const product = getProductById(productId);

  if (!product) notFound();

  return <AlternativesPage product={product} need={need ?? ""} />;
}
