"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSellerProduct, type SellerProduct } from "@/lib/api/seller";
import { getProduct, type ProductDetail } from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";
import { SellerProductDetail } from "./SellerProductDetail";
import type { SellerProductPerformance } from "@/types/seller";

function mapToPerformance(sp: SellerProduct, pd: ProductDetail): SellerProductPerformance {
  return {
    id: sp.id,
    title: pd.title,
    image: pd.images[0] ?? "",
    brand: pd.brand ?? "",
    category: pd.category,
    categoryId: 0,
    price: pd.price,
    originalPrice: pd.originalPrice ?? null,
    stock: pd.stock,
    cargoText: pd.cargoText ?? "",
    updatedAt: new Date(sp.updatedAt).toLocaleDateString("tr-TR"),
    description: pd.description ?? "",
    shortDescription: pd.shortDescription ?? "",
    features: pd.features ?? {},
  };
}

function mapPublicToPerformance(pd: ProductDetail): SellerProductPerformance {
  return {
    id: pd.id,
    title: pd.title,
    image: pd.images[0] ?? "",
    brand: pd.brand ?? "",
    category: pd.category,
    categoryId: 0,
    price: pd.price,
    originalPrice: pd.originalPrice ?? null,
    stock: pd.stock,
    cargoText: pd.cargoText ?? "",
    updatedAt: new Date(pd.updatedAt).toLocaleDateString("tr-TR"),
    description: pd.description ?? "",
    shortDescription: pd.shortDescription ?? "",
    features: pd.features ?? {},
  };
}

export function SellerProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<SellerProductPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();

    async function load() {
      try {
        if (user?.role === "Seller") {
          // Önce seller endpoint — yayınlanmamış ürünler de gelir
          const sp = await getSellerProduct(productId);

          // Public detail de dene (açıklama/özellikler için); yayınlanmamışsa pas geç
          try {
            const pd = await getProduct(productId);
            setProduct(mapToPerformance(sp, pd));
          } catch {
            // Yayınlanmamış ürün: seller verisinden minimum bilgiyle devam
            setProduct({
              id: sp.id,
              title: sp.title,
              image: sp.primaryImage ?? "",
              brand: "",
              category: sp.category,
              categoryId: 0,
              price: sp.price,
              originalPrice: null,
              stock: sp.stock,
              cargoText: "",
              updatedAt: new Date(sp.updatedAt).toLocaleDateString("tr-TR"),
              description: "",
              shortDescription: "",
              features: {},
            });
          }
        } else {
          const pd = await getProduct(productId);
          if (!pd) { setError("Ürün bulunamadı."); return; }
          setProduct(mapPublicToPerformance(pd));
        }
      } catch {
        setError("Ürün yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">{error ?? "Ürün bulunamadı."}</p>
      </div>
    );
  }

  return <SellerProductDetail product={product} />;
}
