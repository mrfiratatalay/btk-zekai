"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Quote, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/mock-data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Alternative = {
  id: string;
  title: string;
  image: string;
  brand: string;
  seller: string;
  price: number;
  originalPrice?: number;
  fitScore: number;
  trustScore: number;
  priceScore: number;
  returnRisk: number;
  why: string;
};

function getAlternatives(productId: string): Alternative[] {
  if (productId === "bluetooth-kulaklik-pro-x1") {
    return [
      {
        id: "jbl-tune-770nc",
        title: "JBL Tune 770NC Kablosuz ANC Kulaklık",
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
        brand: "JBL", seller: "SesMarket TR",
        price: 1190,
        fitScore: 82, trustScore: 91, priceScore: 78, returnRisk: 11,
        why: "Mikrofon yorumları güçlü, resmi satıcı, fiyat makul.",
      },
      {
        id: "anker-q45",
        title: "Anker Soundcore Q45 Adaptif ANC",
        image: "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=800&q=80",
        brand: "Anker", seller: "Anker Resmi TR",
        price: 890, originalPrice: 1099,
        fitScore: 76, trustScore: 88, priceScore: 91, returnRisk: 14,
        why: "Resmi satıcı, pazar medyanının altında fiyat, bot yorum riski yok.",
      },
      {
        id: "sony-wh1000xm4",
        title: "Sony WH-1000XM4 Premium ANC",
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
        brand: "Sony", seller: "Sony Türkiye",
        price: 2890, originalPrice: 3490,
        fitScore: 94, trustScore: 97, priceScore: 54, returnRisk: 7,
        why: "Senin senaryona en yüksek uyum. Güven skoru 97/100.",
      },
    ];
  }
  return [
    {
      id: "alt-1",
      title: "Yüksek Güvenilirlikli Alternatif",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      brand: "Alternatif", seller: "Güvenilir Satıcı",
      price: 850,
      fitScore: 78, trustScore: 89, priceScore: 82, returnRisk: 12,
      why: "Daha yüksek güven skoru ve düşük iade riski.",
    },
  ];
}

function fitColor(n: number) {
  if (n >= 80) return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (n >= 60) return { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   };
  return               { text: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"     };
}

/* ─────────────────────────────────────────────────────────────────────────── */

export function AlternativesPage({ product, need }: { product: Product; need: string }) {
  const alts    = getAlternatives(product.id);
  const bestId  = alts.reduce((a, b) => a.fitScore > b.fitScore ? a : b).id;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-slate-400 hover:text-slate-700">
          <Link href={`/buyer/analysis/${product.id}?need=${encodeURIComponent(need)}`}>
            <ArrowLeft className="size-4" />
            Analiz raporuna dön
          </Link>
        </Button>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative size-6 shrink-0 overflow-hidden rounded-md border border-slate-100">
            <Image src={product.image} alt={product.title} fill sizes="24px" className="object-contain p-0.5" />
          </div>
          <p className="truncate text-xs text-slate-400">{product.title}</p>
        </div>
      </div>

      {/* ── Heading ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 pb-8 pt-10">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Alternatifler</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {alts.length} daha iyi seçenek bulduk.
        </h1>
        {need && (
          <div className="mt-3 flex items-start gap-2">
            <Quote className="mt-1 size-3.5 shrink-0 text-slate-300" />
            <p className="text-sm italic leading-6 text-slate-400">{need}</p>
          </div>
        )}
      </div>

      {/* ── Cards ────────────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {alts.map((alt, idx) => {
          const isBest = alt.id === bestId;
          const fc     = fitColor(alt.fitScore);
          const disc   = alt.originalPrice
            ? Math.round((1 - alt.price / alt.originalPrice) * 100)
            : null;

          return (
            <motion.div
              key={alt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.25 }}
              className={cn(
                "group flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-md",
                isBest ? "border-emerald-200 shadow-sm shadow-emerald-50" : "border-slate-100",
              )}
            >
              {/* Image area */}
              <div className="relative aspect-[4/3] bg-slate-50">
                <Image
                  src={alt.image}
                  alt={alt.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Best badge */}
                {isBest && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                    <Sparkles className="size-3" />
                    En iyi uyum
                  </div>
                )}

                {/* Discount badge */}
                {disc && (
                  <div className="absolute right-3 top-3 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">
                    %{disc}
                  </div>
                )}

                {/* Fit score badge */}
                <div className={cn(
                  "absolute bottom-3 right-3 rounded-xl border px-3 py-1.5 text-center shadow-sm",
                  fc.bg, fc.border,
                )}>
                  <p className={cn("text-xl font-black tabular-nums leading-none", fc.text)}>{alt.fitScore}</p>
                  <p className={cn("mt-0.5 text-[10px] font-medium", fc.text)}>uygunluk</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400">{alt.brand} · {alt.seller}</p>
                  <h3 className="text-sm font-semibold leading-5 text-slate-900">{alt.title}</h3>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-lg font-bold text-slate-900">{formatPrice(alt.price)}</span>
                    {alt.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">{formatPrice(alt.originalPrice)}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">{alt.why}</p>

                {/* Mini stats */}
                <div className="flex gap-3 text-center">
                  {[
                    { label: "Güven",   value: alt.trustScore  },
                    { label: "Fiyat",   value: alt.priceScore  },
                    { label: "İade",    value: alt.returnRisk, invert: true },
                  ].map(s => {
                    const c = s.invert
                      ? (s.value <= 15 ? "text-emerald-600" : s.value <= 25 ? "text-amber-500" : "text-red-500")
                      : (s.value >= 75 ? "text-emerald-600" : s.value >= 50 ? "text-amber-500" : "text-red-500");
                    return (
                      <div key={s.label} className="flex-1 rounded-xl bg-slate-50 py-2">
                        <p className={cn("text-sm font-bold tabular-nums", c)}>
                          {s.invert ? `%${s.value}` : s.value}
                        </p>
                        <p className="text-[10px] text-slate-400">{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* CTAs */}
                <div className="mt-auto flex gap-2">
                  <Button
                    size="sm"
                    className={cn(
                      "flex-1 rounded-lg font-medium",
                      isBest
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-900 text-white hover:bg-slate-700",
                    )}
                    onClick={() => toast.success(`${alt.title} sepete eklendi.`)}
                  >
                    <ShoppingCart className="size-3.5" />
                    Sepete Ekle
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-lg border-slate-200 text-slate-500 hover:text-slate-900">
                    <Link href={`/shop/product/${alt.id}`}>Detay</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
