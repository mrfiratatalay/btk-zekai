"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, Eye, Package, Search, Sparkles, Star, Tag, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSellerProducts, type SellerProduct } from "@/lib/api/seller";
import { getProducts, type ProductListItem } from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type FilterKey = "all" | "active" | "draft";

function isDraft(stock: number) {
  return stock < 15;
}

// Merge API product list (images, stock) with seller metrics
type MergedProduct = SellerProduct & { primaryImage?: string };

export function SellerProducts() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [publicProducts, setPublicProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const isSeller = user?.role === "Seller";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch public products for images
        const pub = await getProducts();
        setPublicProducts(pub);

        // Fetch seller-specific metrics if logged in as seller
        if (isSeller) {
          const sel = await getSellerProducts();
          setSellerProducts(sel);
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSeller]);

  // Merge seller metrics with public product images
  const merged: MergedProduct[] = useMemo(() => {
    if (isSeller && sellerProducts.length > 0) {
      return sellerProducts.map((sp) => ({
        ...sp,
        primaryImage: publicProducts.find((p) => p.id === sp.id)?.primaryImage ?? sp.primaryImage,
      }));
    }
    // Fallback: show public products as seller products
    return publicProducts.map((p) => ({
      id: p.id,
      title: p.title,
      primaryImage: p.primaryImage,
      category: p.category,
      price: p.price,
      stock: p.stock,
      sales30d: 0,
      returnRate: 0,
      conversionRate: 0,
      healthScore: 70,
      lostProfitMonthly: 0,
      improvableRevenueMonthly: 0,
      status: "Healthy" as const,
      mainIssue: "",
      updatedAt: new Date().toISOString(),
    }));
  }, [isSeller, sellerProducts, publicProducts]);

  const filtered = useMemo(() => {
    return merged
      .filter((p) => p.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR")))
      .filter((p) => {
        if (filter === "active") return !isDraft(p.stock);
        if (filter === "draft") return isDraft(p.stock);
        return true;
      });
  }, [merged, search, filter]);

  const urgentCount = merged.filter((p) => p.status === "Urgent").length;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-100 dark:bg-white/8" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/8" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünlerim</h1>
          <p className="mt-1 text-sm text-gray-400">
            {merged.length} ürün · Ürünlerini yönet, test et ve Zekai ile geliştir.
          </p>
        </div>
        {bannerVisible && urgentCount > 0 && (
          <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-green-200 bg-green-50 py-2 pl-3 pr-3 dark:border-green-500/20 dark:bg-green-500/10">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-500">
              <Zap className="size-3.5 text-white" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-bold">Öneri:</span> Satışa çıkmadan önce ürünlerini müşteri simülasyonuyla test et.
            </p>
            <button onClick={() => setBannerVisible(false)} className="ml-1 text-gray-400 hover:text-gray-600">
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı ile ara..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "draft"] as FilterKey[]).map((key) => {
            const label = key === "all" ? "Tümü" : key === "active" ? "Aktif" : "Taslak";
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "h-9 rounded-xl px-5 text-sm font-semibold transition-all",
                  filter === key
                    ? "bg-green-500 text-white"
                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map((product, idx) => {
          const draft = isDraft(product.stock);
          const featured = idx === 0 && filter === "all";
          const rating = draft ? "–" : (5 - product.returnRate / 20).toFixed(1);
          const stockDisplay = draft ? "–" : String(product.stock);

          return (
            <div
              key={product.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl bg-white transition-all hover:shadow-md dark:bg-[#111]",
                featured
                  ? "border-2 border-green-500 shadow-md"
                  : "border border-gray-200 shadow-sm dark:border-white/10",
              )}
            >
              {/* Clickable body → product detail */}
              <Link
                href={`/seller/product/${product.id}`}
                className="relative flex gap-0 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
              >
                {featured && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    <Sparkles className="size-3" />
                    Önerilen
                  </div>
                )}

                {/* Image */}
                <div className="relative m-4 size-36 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage}
                      alt={product.title}
                      fill
                      sizes="144px"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <Package className="size-10" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 dark:text-white">
                    {product.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={cn("text-sm font-bold", draft ? "text-gray-400" : "text-green-600 dark:text-green-400")}>
                      {draft ? "Taslak" : "Aktif"}
                    </span>
                    <span className={cn("size-1.5 rounded-full", draft ? "bg-gray-300" : "bg-green-500")} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {[
                      { icon: <Tag className="size-3" />, label: "Fiyat", value: formatPrice(product.price) },
                      { icon: <Package className="size-3" />, label: "Stok", value: stockDisplay },
                      { icon: <Star className="size-3" />, label: "Puan", value: rating },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex items-center gap-1 text-gray-400">{stat.icon}<span className="text-[11px]">{stat.label}</span></div>
                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-2.5 text-[11px] text-gray-400">
                    Son güncelleme: {new Date(product.updatedAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </Link>

              {/* Buttons */}
              <div className="flex flex-col gap-2 border-t border-gray-100 px-4 pb-4 pt-3 dark:border-white/8">
                <Link
                  href={`/seller/product/${product.id}/simulation`}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white transition-colors hover:bg-green-600"
                >
                  Müşteri Simülasyonuyla Test Et
                  <span className="text-green-200">›</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/seller/product/${product.id}/ai-edit`}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                  >
                    <Bot className="size-4 text-gray-400" />
                    AI ile Düzenle
                  </Link>
                  <Link
                    href={`/mock-shop/product/${product.id}`}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                  >
                    <Eye className="size-4 text-gray-400" />
                    Mağazada Gör
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-24 text-center">
          <Package className="mx-auto mb-3 size-8 text-gray-200" />
          <p className="text-sm text-gray-400">Ürün bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
