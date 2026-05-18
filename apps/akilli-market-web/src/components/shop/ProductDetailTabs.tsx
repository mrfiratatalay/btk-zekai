"use client";

import Link from "next/link";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { Product, ProductReview } from "@/types/product";
import { cn } from "@/lib/utils";
import { postProductReview } from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer p-0.5"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              i <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: (review: ProductReview) => void }) {
  const user = getCurrentUser();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-500">
        Yorum yapmak için{" "}
        <Link href="/login" className="cursor-pointer font-semibold text-[#FF6000] hover:underline">
          giriş yapın
        </Link>
        .
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
        Yorumunuz başarıyla gönderildi. Teşekkür ederiz!
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Lütfen bir puan seçin."); return; }
    setError("");
    setLoading(true);
    try {
      const newReview = await postProductReview(productId, { rating, title, text });
      setSuccess(true);
      onSubmitted(newReview);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Yorum gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-800">Yorum Yap</p>
      <div>
        <p className="mb-1.5 text-xs font-medium text-slate-500">Puanınız</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Başlık</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="Yorumunuz için kısa bir başlık"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#FF6000]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Yorumunuz</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="Ürün hakkındaki deneyiminizi paylaşın..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF6000]"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer h-9 rounded-lg bg-[#FF6000] px-5 text-sm font-semibold text-white hover:bg-[#E65700] disabled:opacity-60"
      >
        {loading ? "Gönderiliyor..." : "Yorumu Gönder"}
      </button>
    </form>
  );
}

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

const TABS = [
  { id: "description", label: "Açıklama" },
  { id: "specs", label: "Özellikler" },
  { id: "reviews", label: "Yorumlar" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductDetailTabs({
  product,
  reviews: initialReviews,
}: {
  product: Product;
  similarProducts?: Product[];
  reviews: ProductReview[];
}) {
  const [active, setActive] = useState<TabId>("description");
  const [reviews, setReviews] = useState(initialReviews);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  const ratingDist = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    return { stars, pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex">
            {TABS.map((tab) => {
              const label = tab.id === "reviews"
                ? `Yorumlar (${product.reviewCount.toLocaleString("tr-TR")})`
                : tab.label;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "cursor-pointer relative h-12 px-5 text-sm font-medium transition-colors",
                    active === tab.id
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {label}
                  {active === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {active === "description" && (
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
        )}

        {active === "specs" && (
          <div className="max-w-lg">
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {Object.entries(product.features).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[100px_1fr] text-sm sm:grid-cols-[160px_1fr]">
                  <span className="bg-slate-50 px-4 py-3.5 font-medium text-slate-500">{key}</span>
                  <span className="px-4 py-3.5 text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === "reviews" && (
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            <div className="space-y-5">
              <div>
                <p className="text-5xl font-black text-slate-900">{avgRating}</p>
                <Stars rating={Math.round(Number(avgRating))} size="md" />
                <p className="mt-1.5 text-sm text-slate-400">
                  {reviews.length.toLocaleString("tr-TR")} değerlendirme
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

            <div className="space-y-6">
              <ReviewForm
                productId={product.id}
                onSubmitted={(review) => setReviews((prev) => [review, ...prev])}
              />
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
                          <span className="font-medium text-slate-600">
                            {review.authorName || "Müşteri"}
                          </span>
                          {review.verifiedPurchase && <BadgeCheck className="size-3.5 text-emerald-500" />}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{review.text}</p>
                    <button type="button" className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
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
          </div>
        )}
      </div>
    </div>
  );
}
