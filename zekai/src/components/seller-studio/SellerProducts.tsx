"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, Eye, Package, Search, Sparkles, Star, Tag, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSellerPrice, sellerProducts } from "@/lib/mock-data/seller";

type FilterKey = "all" | "active" | "draft";

/* products with low stock treated as draft */
function isDraft(stock: number) {
  return stock < 15;
}

export function SellerProducts() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [bannerVisible, setBannerVisible] = useState(true);

  const filtered = useMemo(() => {
    return sellerProducts
      .filter((p) =>
        p.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR")),
      )
      .filter((p) => {
        if (filter === "active") return !isDraft(p.stock);
        if (filter === "draft") return isDraft(p.stock);
        return true;
      });
  }, [search, filter]);

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünlerim</h1>
          <p className="mt-1 text-sm text-gray-400">
            Ürünlerini yönet, test et ve Zekai ile geliştir.
          </p>
        </div>

        {/* Banner pill */}
        {bannerVisible && (
          <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-green-200 bg-green-50 py-2 pl-3 pr-3 dark:border-green-500/20 dark:bg-green-500/10">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-500">
              <Zap className="size-3.5 text-white" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-bold">Öneri:</span> Satışa çıkmadan önce ürünlerini müşteri simülasyonuyla test et.
            </p>
            <button
              onClick={() => setBannerVisible(false)}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı ile ara..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* Filter tabs */}
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
                "flex flex-col overflow-hidden rounded-2xl bg-white transition-all hover:shadow-lg dark:bg-[#111]",
                featured
                  ? "border-2 border-green-500 shadow-md"
                  : "border border-gray-200 shadow-sm dark:border-white/10",
              )}
            >
              {/* ── Clickable body ── */}
              <Link
                href={`/seller/product/${product.id}`}
                className="relative flex gap-0 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
              >
                {/* Featured badge */}
                {featured && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    <Sparkles className="size-3" />
                    Önerilen
                  </div>
                )}

                {/* Product image */}
                <div className="relative m-4 size-36 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="144px"
                    className="object-contain p-3"
                  />
                </div>

                {/* Product content */}
                <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 dark:text-white">
                    {product.title}
                  </h3>

                  {/* Status badge */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-bold",
                        draft ? "text-gray-400" : "text-green-600 dark:text-green-400",
                      )}
                    >
                      {draft ? "Taslak" : "Aktif"}
                    </span>
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        draft ? "bg-gray-300" : "bg-green-500",
                      )}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {[
                      { icon: <Tag className="size-3" />, label: "Fiyat", value: formatSellerPrice(product.price) },
                      { icon: <Package className="size-3" />, label: "Stok", value: stockDisplay },
                      { icon: <Star className="size-3" />, label: "Puan", value: rating },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex items-center gap-1 text-gray-400">
                          {stat.icon}
                          <span className="text-[11px]">{stat.label}</span>
                        </div>
                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Son test */}
                  <p className="mt-2.5 text-[11px] text-gray-400">
                    Son test: {product.updatedAt}
                  </p>
                </div>
              </Link>

              {/* ── Buttons ── */}
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

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <Package className="mx-auto mb-3 size-8 text-gray-200" />
          <p className="text-sm text-gray-400">Ürün bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
