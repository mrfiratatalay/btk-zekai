"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Quote,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Undo2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/mock-data/products";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type AlternativeProduct = {
  id: string;
  title: string;
  image: string;
  brand: string;
  sellerName: string;
  price: number;
  originalPrice: number;
  fitScore: number;
  trustScore: number;
  priceScore: number;
  returnRiskPct: number;
  whyRecommended: string;
};

function getAlternatives(productId: string): AlternativeProduct[] {
  if (productId === "bluetooth-kulaklik-pro-x1") {
    return [
      {
        id: "jbl-tune-770nc",
        title: "JBL Tune 770NC ANC Kablosuz Kulaklık",
        image:
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
        brand: "JBL",
        sellerName: "SesMarket TR",
        price: 1190,
        originalPrice: 1190,
        fitScore: 82,
        trustScore: 91,
        priceScore: 78,
        returnRiskPct: 11,
        whyRecommended:
          "Mikrofon kalitesi hakkında pozitif yorum yoğunluğu yüksek. ANC özelliği online ders ve toplantı kullanımına uygun. Güven skoru 91/100.",
      },
      {
        id: "anker-q45-kulaklik",
        title: "Anker Soundcore Q45 Adaptif ANC",
        image:
          "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1200&q=80",
        brand: "Anker",
        sellerName: "Anker Resmi",
        price: 890,
        originalPrice: 1099,
        fitScore: 76,
        trustScore: 88,
        priceScore: 91,
        returnRiskPct: 14,
        whyRecommended:
          "Pazar medyanının %19 altında fiyat. Resmi yetkili satıcı — güven sorunu yok. Mikrofon şikayeti yorum oranı %6 ile düşük.",
      },
      {
        id: "sony-wh1000xm4",
        title: "Sony WH-1000XM4 Premium ANC",
        image:
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
        brand: "Sony",
        sellerName: "Sony Türkiye",
        price: 2890,
        originalPrice: 3490,
        fitScore: 94,
        trustScore: 97,
        priceScore: 54,
        returnRiskPct: 7,
        whyRecommended:
          "Senin kullanım senaryona (online ders + oyun + mikrofon) en yüksek uyum skoru. İade riski çok düşük. Bütçen izin veriyorsa en güvenli seçim.",
      },
    ];
  }

  return [
    {
      id: "alt-1",
      title: "Benzer Ürün — Yüksek Güven Skoru",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      brand: "Alternatif Marka",
      sellerName: "Güvenilir Satıcı",
      price: 850,
      originalPrice: 1000,
      fitScore: 78,
      trustScore: 89,
      priceScore: 82,
      returnRiskPct: 12,
      whyRecommended:
        "Daha yüksek güven skoru ve daha düşük iade riski ile senin senaryona daha uygun.",
    },
  ];
}

const originalProduct = {
  fitScore: 54,
  trustScore: 41,
  priceScore: 35,
  returnRiskPct: 32,
};

function ScoreBar({
  value,
  invert = false,
}: {
  value: number;
  invert?: boolean;
}) {
  const isGood = invert ? value <= 15 : value >= 70;
  const isMid = invert ? value <= 25 : value >= 45;
  const color = isGood ? "bg-[#16A34A]" : isMid ? "bg-[#D97706]" : "bg-[#DC2626]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${invert ? 100 - value : value}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-bold text-[#111827]">
        {invert ? `%${value}` : `${value}/100`}
      </span>
    </div>
  );
}

export function AlternativesPage({
  product,
  need,
}: {
  product: Product;
  need: string;
}) {
  const alternatives = getAlternatives(product.id);

  const comparisonRows = [
    { label: "Fiyat", key: "price" as const },
    { label: "Uygunluk Skoru", key: "fitScore" as const },
    { label: "Güven Skoru", key: "trustScore" as const },
    { label: "İade Riski", key: "returnRiskPct" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      {/* Back nav */}
      <div>
        <Button asChild variant="ghost" className="h-9 gap-2 px-3 text-sm font-semibold">
          <Link href={`/shop/product/${product.id}`}>
            <ArrowLeft className="size-4" />
            Ürüne Geri Dön
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#F5F3FF] px-3 py-1 text-sm font-extrabold uppercase tracking-wide text-[#5B2EFF]">
            Bana Uygun Alternatifler
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#111827]">
          Bu ürün yerine ne alabilirim?
        </h1>

        {/* User need */}
        {need && (
          <div className="flex max-w-2xl items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <Quote className="mt-0.5 size-4 shrink-0 text-[#6B7280]" />
            <p className="text-sm leading-6 text-[#6B7280]">{need}</p>
          </div>
        )}

        {/* Original product tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-2">
            <XCircle className="size-4 text-[#DC2626]" />
            <span className="text-sm font-bold text-[#991B1B]">
              Analiz ettiğin ürün: {product.title}
            </span>
            <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-extrabold text-[#DC2626]">
              Risk %62
            </span>
          </div>
        </div>
      </div>

      {/* Alternative cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {alternatives.map((alt, idx) => (
          <div
            key={alt.id}
            className={cn(
              "relative rounded-2xl border bg-white p-5 shadow-sm",
              idx === 2
                ? "border-[#A78BFA] ring-2 ring-[#A78BFA]/30"
                : "border-[#E5E7EB]"
            )}
          >
            {idx === 2 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5B2EFF] px-3 py-0.5 text-xs font-extrabold text-white">
                En Uygun
              </div>
            )}
            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-[#F8FAFC]">
              <Image
                src={alt.image}
                alt={alt.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4"
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">
              {alt.brand} · {alt.sellerName}
            </p>
            <h3 className="mt-1 text-sm font-extrabold leading-5 text-[#111827] line-clamp-2">
              {alt.title}
            </h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-[#FF6000]">
                {formatPrice(alt.price)}
              </span>
              {alt.originalPrice > alt.price && (
                <span className="text-sm text-[#9CA3AF] line-through">
                  {formatPrice(alt.originalPrice)}
                </span>
              )}
            </div>

            {/* Scores */}
            <div className="mt-4 space-y-2.5">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#6B7280]">
                  <span>Senin için uygunluk</span>
                </div>
                <ScoreBar value={alt.fitScore} />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#6B7280]">Güven</div>
                <ScoreBar value={alt.trustScore} />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#6B7280]">Fiyat skoru</div>
                <ScoreBar value={alt.priceScore} />
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-[#6B7280]">İade riski</div>
                <ScoreBar value={alt.returnRiskPct} invert />
              </div>
            </div>

            {/* Why recommended */}
            <div className="mt-4 rounded-xl bg-[#F0FDF4] p-3">
              <p className="flex items-start gap-1.5 text-xs leading-5 text-[#166534]">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                {alt.whyRecommended}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 grid gap-2">
              <Button
                className="h-10 w-full rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700]"
                onClick={() => toast.success(`${alt.title} sepete eklendi.`)}
              >
                <ShoppingCart className="size-4" />
                Sepete Ekle
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-9 w-full rounded-xl border-[#E5E7EB] bg-white font-semibold"
              >
                <Link href={`/shop/product/${alt.id}?preAnalyze=true`}>
                  Ürün Sayfasına Git
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-xl font-extrabold text-[#111827]">
            Yan Yana Karşılaştırma
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Analiz ettiğin ürün ile önerilen alternatiflerin karşılaştırması
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-[#6B7280]">
                  Kriter
                </th>
                <th className="px-4 py-3 text-center">
                  <div className="text-xs font-bold text-[#DC2626]">Mevcut Ürün</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-[#6B7280]">{product.title}</div>
                </th>
                {alternatives.map((alt, i) => (
                  <th key={alt.id} className="px-4 py-3 text-center">
                    {i === 2 && (
                      <div className="mb-0.5 text-xs font-extrabold text-[#5B2EFF]">
                        ⭐ En Uygun
                      </div>
                    )}
                    <div className="line-clamp-2 text-xs text-[#374151] font-semibold">
                      {alt.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {/* Price row */}
              <tr>
                <td className="px-6 py-3 font-bold text-[#374151] flex items-center gap-1.5">
                  <Tag className="size-4 text-[#6B7280]" /> Fiyat
                </td>
                <td className="px-4 py-3 text-center font-bold text-[#DC2626]">
                  {formatPrice(product.price)}
                </td>
                {alternatives.map((alt) => (
                  <td key={alt.id} className="px-4 py-3 text-center font-bold text-[#111827]">
                    {formatPrice(alt.price)}
                  </td>
                ))}
              </tr>
              {/* Fit score */}
              <tr className="bg-[#FAFAFA]">
                <td className="px-6 py-3 font-bold text-[#374151]">Uygunluk Skoru</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-sm font-extrabold text-[#DC2626]">
                    {originalProduct.fitScore}/100
                  </span>
                </td>
                {alternatives.map((alt) => (
                  <td key={alt.id} className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-sm font-extrabold text-[#16A34A]">
                      {alt.fitScore}/100
                    </span>
                  </td>
                ))}
              </tr>
              {/* Trust score */}
              <tr>
                <td className="px-6 py-3 font-bold text-[#374151] flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-[#6B7280]" /> Güven Skoru
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-sm font-extrabold text-[#DC2626]">
                    {originalProduct.trustScore}/100
                  </span>
                </td>
                {alternatives.map((alt) => (
                  <td key={alt.id} className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-sm font-extrabold text-[#16A34A]">
                      {alt.trustScore}/100
                    </span>
                  </td>
                ))}
              </tr>
              {/* Return risk */}
              <tr className="bg-[#FAFAFA]">
                <td className="px-6 py-3 font-bold text-[#374151] flex items-center gap-1.5">
                  <Undo2 className="size-4 text-[#6B7280]" /> İade Riski
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-sm font-extrabold text-[#DC2626]">
                    %{originalProduct.returnRiskPct}
                  </span>
                </td>
                {alternatives.map((alt) => (
                  <td key={alt.id} className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-sm font-extrabold text-[#16A34A]">
                      %{alt.returnRiskPct}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Button asChild variant="outline" className="h-11 rounded-xl font-bold">
          <Link href={`/shop/product/${product.id}`}>
            <ArrowLeft className="size-4" />
            Orijinal Ürüne Dön
          </Link>
        </Button>
        <Button
          className="h-11 rounded-xl bg-[#FF6000] px-6 font-extrabold text-white hover:bg-[#E65700]"
          onClick={() => toast.success("En uygun alternatif sepete eklendi.")}
        >
          <CheckCircle2 className="size-4" />
          En Uygun Alternatifi Sepete Ekle
        </Button>
      </div>
    </div>
  );
}
