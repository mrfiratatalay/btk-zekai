"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSellerProduct, type SellerProduct } from "@/lib/api/seller";
import { getProduct, type ProductDetail } from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";
import { SellerAIEdit } from "./SellerAIEdit";
import type { SellerProductPerformance } from "@/types/seller";

function mapToPerformance(sp: SellerProduct, pd: ProductDetail): SellerProductPerformance {
  return {
    id: sp.id,
    title: pd.title,
    image: pd.images[0] ?? "",
    category: pd.category,
    price: pd.price,
    stock: pd.stock,
    sales30d: sp.sales30d,
    returnRate: sp.returnRate,
    conversionRate: sp.conversionRate,
    aiRiskScore: sp.healthScore,
    healthScore: sp.healthScore,
    lostProfitMonthly: sp.lostProfitMonthly,
    improvableRevenueMonthly: sp.improvableRevenueMonthly,
    status: sp.status.toLowerCase() as "urgent" | "watch" | "healthy",
    mainIssue: sp.mainIssue,
    lastAction: "Analiz bekleniyor",
    updatedAt: new Date(sp.updatedAt).toLocaleDateString("tr-TR"),
  };
}

export function SellerAIEditClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<SellerProductPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const user = getCurrentUser();
        const pd = await getProduct(productId);
        if (!pd) { setError("Ürün bulunamadı."); return; }

        if (user?.role === "Seller") {
          const sp = await getSellerProduct(productId);
          setProduct(mapToPerformance(sp, pd));
        } else {
          setProduct({
            id: pd.id, title: pd.title, image: pd.images[0] ?? "",
            category: pd.category, price: pd.price, stock: pd.stock,
            sales30d: 0, returnRate: 0, conversionRate: 0,
            aiRiskScore: 70, healthScore: 70,
            lostProfitMonthly: 0, improvableRevenueMonthly: 0,
            status: "healthy", mainIssue: "", lastAction: "",
            updatedAt: new Date(pd.updatedAt).toLocaleDateString("tr-TR"),
          });
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

  return <SellerAIEdit product={product} />;
}
