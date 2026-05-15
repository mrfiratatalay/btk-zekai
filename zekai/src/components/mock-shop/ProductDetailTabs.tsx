"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import type { Product } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ── Mock reviews ──────────────────────────────────────────────────────────── */
const REVIEWS = [
  {
    id: "r1", name: "Ahmet Y.", date: "3 gün önce", rating: 5, verified: true,
    title: "Beklentilerimin çok üzerinde",
    body: "Online toplantılarımda mükemmel ses kalitesi, mikrofon net duyuluyor. Kulağımı hiç rahatsız etmedi. Hızlı kargo, orijinal kutu. Kesinlikle tavsiye ederim.",
    helpful: 24,
  },
  {
    id: "r2", name: "Selin K.", date: "1 hafta önce", rating: 4, verified: true,
    title: "Çok iyi ses ama mikrofon idare eder",
    body: "Müzik dinleme için harika. Bas sesi gerçekten dolu. Mikrofon günlük görüşmeler için yeterli ama stüdyo kalitesi beklemeyin. Pil ömrü ise tam söyledikleri gibi.",
    helpful: 18,
  },
  {
    id: "r3", name: "Murat D.", date: "2 hafta önce", rating: 5, verified: false,
    title: "Fiyat/performans en iyisi",
    body: "Bu fiyata bu ses kalitesi? İnanılmaz. 3 aydır kullanıyorum, hiçbir sorun yaşamadım. Bluetooth bağlantısı anında kuruluyor, kesilme hiç olmadı.",
    helpful: 31,
  },
  {
    id: "r4", name: "Zeynep A.", date: "3 hafta önce", rating: 3, verified: true,
    title: "İyi ama oyun için değil",
    body: "Müzik için gayet iyi, ama oyun oynarken gecikme hissedilir. Eğer oyun için alıyorsanız başka bir modele bakın. Uzun süre takılınca biraz sıkıyor.",
    helpful: 47,
  },
  {
    id: "r5", name: "Emre T.", date: "1 ay önce", rating: 5, verified: true,
    title: "Harika bir ürün",
    body: "Evden çalışanlar için ideal. Toplantılarda mikrofon net, kulaklık rahat, pil günlerce gidiyor. Bu fiyata bu kalite gerçekten çok iyi.",
    helpful: 12,
  },
];

const RATING_DIST = [
  { stars: 5, pct: 62 },
  { stars: 4, pct: 21 },
  { stars: 3, pct: 9  },
  { stars: 2, pct: 4  },
  { stars: 1, pct: 4  },
];

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "size-5" : "size-3.5";
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(sz, i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

export function ProductDetailTabs({ product, similarProducts }: {
  product: Product;
  similarProducts: Product[];
}) {
  const avgRating = product.rating.toFixed(1);
  const questionCount = Math.max(18, Math.round(product.reviewCount / 10));

  return (
    <Tabs defaultValue="description">

      {/* ── Sticky tab strip ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <TabsList className="flex h-auto w-full justify-start gap-0 rounded-none border-0 bg-transparent p-0">
            {[
              { value: "description", label: "Açıklama" },
              { value: "specs",       label: "Özellikler" },
              { value: "reviews",     label: `Yorumlar (${product.reviewCount.toLocaleString("tr-TR")})` },
              { value: "similar",     label: "Benzer Ürünler" },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="h-12 rounded-none border-b-2 border-transparent bg-transparent px-5 text-sm font-medium text-slate-500 transition-none hover:text-slate-900 data-[state=active]:border-slate-900 data-[state=active]:text-slate-900">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ── Açıklama ─────────────────────────────────────────────────── */}
        <TabsContent value="description" className="mt-0">
          <div className="max-w-2xl space-y-6">
            <p className="text-base leading-8 text-slate-600">{product.description}</p>
            {product.badges?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.badges.map(b => (
                  <span key={b} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{b}</span>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Özellikler ───────────────────────────────────────────────── */}
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

        {/* ── Yorumlar ─────────────────────────────────────────────────── */}
        <TabsContent value="reviews" className="mt-0">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

            {/* Rating summary */}
            <div className="space-y-5">
              <div>
                <p className="text-5xl font-black text-slate-900">{avgRating}</p>
                <Stars rating={Math.round(product.rating)} size="md" />
                <p className="mt-1.5 text-sm text-slate-400">{product.reviewCount.toLocaleString("tr-TR")} değerlendirme</p>
              </div>
              <div className="space-y-2">
                {RATING_DIST.map(row => (
                  <div key={row.stars} className="flex items-center gap-2.5 text-xs">
                    <span className="w-4 text-right text-slate-500">{row.stars}</span>
                    <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="w-6 text-slate-400">%{row.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review list */}
            <div className="divide-y divide-slate-100">
              {REVIEWS.map(review => (
                <div key={review.id} className="py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Stars rating={review.rating} />
                        <span className="text-xs text-slate-400">{review.date}</span>
                      </div>
                      <p className="font-semibold text-slate-900">{review.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">{review.name}</span>
                        {review.verified && <BadgeCheck className="size-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{review.body}</p>
                  <button type="button" className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
                    <ThumbsUp className="size-3.5" />
                    Faydalı ({review.helpful})
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Benzer Ürünler ───────────────────────────────────────────── */}
        <TabsContent value="similar" className="mt-0">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map(item => (
              <Link key={item.id} href={`/mock-shop/product/${item.id}`}
                className="group space-y-3 rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:shadow-sm">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
                  <Image src={item.image} alt={item.title} fill sizes="200px"
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="space-y-0.5">
                  <p className="line-clamp-2 text-xs font-medium leading-4 text-slate-800">{item.title}</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

      </div>
    </Tabs>
  );
}
