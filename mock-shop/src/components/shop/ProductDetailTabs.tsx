"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import type { Product, ProductReview } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "size-5" : "size-3.5";
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(sz, i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")}
        />
      ))}
    </div>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductDetailTabs({
  product,
  similarProducts,
  reviews,
}: {
  product: Product;
  similarProducts: Product[];
  reviews: ProductReview[];
}) {
  const avgRating = product.rating.toFixed(1);
  const ratingDist = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => Math.round(review.rating) === stars).length;
    return {
      stars,
      pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
    };
  });

  return (
    <Tabs defaultValue="description">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <TabsList className="flex h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0">
            {[
              { value: "description", label: "Açıklama" },
              { value: "specs", label: "Özellikler" },
              { value: "reviews", label: `Yorumlar (${product.reviewCount.toLocaleString("tr-TR")})` },
              { value: "similar", label: "Benzer Ürünler" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-12 rounded-none border-b-2 border-transparent bg-transparent px-5 text-sm font-medium text-slate-500 transition-none hover:text-slate-900 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <TabsContent value="description" className="mt-0">
          <div className="max-w-2xl space-y-6">
            <p className="text-base leading-8 text-slate-600">{product.description}</p>
            {product.badges?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-0">
          <div className="max-w-lg">
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {Object.entries(product.features).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[160px_1fr] text-sm">
                  <span className="bg-slate-50 px-4 py-3.5 font-medium text-slate-500">{key}</span>
                  <span className="px-4 py-3.5 text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-0">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            <div className="space-y-5">
              <div>
                <p className="text-5xl font-black text-slate-900">{avgRating}</p>
                <Stars rating={Math.round(product.rating)} size="md" />
                <p className="mt-1.5 text-sm text-slate-400">
                  {product.reviewCount.toLocaleString("tr-TR")} değerlendirme
                </p>
              </div>
              <div className="space-y-2">
                {ratingDist.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2.5 text-xs">
                    <span className="w-4 text-right text-slate-500">{row.stars}</span>
                    <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="w-6 text-slate-400">%{row.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <div key={review.id} className="py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Stars rating={Math.round(review.rating)} />
                        <span className="text-xs text-slate-400">
                          {new Date(review.date).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900">{review.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">Müşteri</span>
                        {review.verifiedPurchase && <BadgeCheck className="size-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{review.text}</p>
                  <button type="button" className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
                    <ThumbsUp className="size-3.5" />
                    Faydalı ({review.helpfulCount})
                  </button>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="py-8 text-sm text-slate-500">Bu ürün için henüz yorum kaydı yok.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="similar" className="mt-0">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="group space-y-3 rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="200px"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="line-clamp-2 text-xs font-medium leading-4 text-slate-800">{item.title}</p>
                  <p className="text-sm font-bold text-slate-900">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
            {similarProducts.length === 0 && (
              <p className="col-span-full text-sm text-slate-500">Bu kategori için benzer ürün bulunamadı.</p>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
