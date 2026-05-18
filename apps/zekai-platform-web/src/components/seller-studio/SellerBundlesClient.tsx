"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getProduct } from "@/lib/api/products";
import { getSellerProductBundles, generateBundleRecommendations } from "@/lib/api/seller";
import { SellerBundles } from "./SellerBundles";

export function SellerBundlesClient({ productId }: { productId: string }) {
  const productQuery = useQuery({
    queryKey: ["seller-product-detail", productId],
    queryFn: () => getProduct(productId),
  });
  const bundlesQuery = useQuery({
    queryKey: ["seller-bundles", productId],
    queryFn: () => getSellerProductBundles(productId),
  });
  const recommendationsQuery = useQuery({
    queryKey: ["bundle-recommendations", productId],
    queryFn: () => generateBundleRecommendations(productId),
    enabled: false,
  });

  if (productQuery.isLoading || bundlesQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (productQuery.error || !productQuery.data) {
    return <div className="py-20 text-center text-sm text-gray-400">Urun yuklenemedi.</div>;
  }

  return (
    <SellerBundles
      product={productQuery.data}
      bundles={bundlesQuery.data ?? []}
      recommendations={recommendationsQuery.data}
      recommendationsLoading={recommendationsQuery.isFetching}
      onGenerate={() => recommendationsQuery.refetch()}
    />
  );
}
