"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Loader2,
  ShoppingCart,
  Star,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice, sellerImprovements, syntheticPersonas } from "@/lib/mock-data/seller";

const COMPLETE_DELAY_MS = 4200;
const STREAM_INTERVAL_MS = 320;

type Decision = "buy" | "skip" | "undecided";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=80",
];

const decisionBadge: Record<Decision, { label: string; cls: string; icon: React.ReactNode }> = {
  buy: {
    label: "Satın Aldı",
    cls: "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    icon: <ShoppingCart className="size-3" />,
  },
  skip: {
    label: "Vazgeçti",
    cls: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    icon: <XCircle className="size-3" />,
  },
  undecided: {
    label: "Kararsız",
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    icon: <ThumbsDown className="size-3" />,
  },
};

const earlyInsights = [
  { icon: "📷", title: "Fotoğraf eksikliği", desc: "Kutu içeriği ve kullanım görseli yok" },
  { icon: "💬", title: "Açıklama belirsizliği", desc: "Mikrofon kalitesi net değil" },
  { icon: "💰", title: "Fiyat sorgulanıyor", desc: "Premium kanıt yetersiz" },
  { icon: "🛡️", title: "Güven sinyali eksik", desc: "Garanti bilgisi görünür değil" },
];

/* ═════════════════ Running State ═════════════════ */

function SimulationRunning({ product, visible }: { product: SellerProductPerformance; visible: number }) {
  const total = syntheticPersonas.length;
  const visiblePersonas = syntheticPersonas.slice(0, visible);
  const buyV = visiblePersonas.filter((p) => p.decision === "buy").length;
  const skipV = visiblePersonas.filter((p) => p.decision === "skip").length;
  const undecV = visiblePersonas.filter((p) => p.decision === "undecided").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteri Simülasyonu</h1>
          <p className="mt-1 text-sm text-gray-500">Müşteriler ürünü değerlendiriyor, lütfen bekleyin...</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm dark:border-white/8 dark:bg-white/4">
          <Loader2 className="size-4 animate-spin text-green-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {visible}/{total} tamamlandı
          </span>
        </div>
      </div>

      {/* 3-col layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* LEFT: Canlı Akış */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Canlı Akış</p>
          </div>
          <div className="space-y-2.5">
            {visiblePersonas.map((p, i) => {
              const badge = decisionBadge[p.decision];
              return (
                <div
                  key={p.id}
                  className="animate-in fade-in slide-in-from-left-2 flex gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm duration-300 dark:border-white/8 dark:bg-white/4"
                >
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-white/20">
                    <Image src={AVATARS[i % AVATARS.length]} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{p.name}</p>
                      <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.cls)}>
                        {badge.icon} {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">{p.city} · {p.segment}</p>
                    <p className="mt-1 line-clamp-1 text-[11px] text-gray-500 dark:text-gray-400">"{p.reason}"</p>
                  </div>
                </div>
              );
            })}
            {visible < total && (
              <div className="flex h-16 items-center justify-center rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/8">
                <Loader2 className="size-5 animate-spin text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Ana Simülasyon Özeti */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Ana Simülasyon Özeti</p>

          {/* Product card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/4">
            <div className="flex gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <Image src={product.image} alt={product.title} fill className="object-contain p-2" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{product.title}</p>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{formatSellerPrice(product.price)}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-gray-400">İlerleme</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">{visible}/{total} kişi</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${(visible / total) * 100}%` }} />
              </div>
            </div>

            {/* Live stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-green-50 py-2.5 dark:bg-green-500/10">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{buyV}</p>
                <p className="text-[10px] text-green-600/70 dark:text-green-400/70">Satın Aldı</p>
              </div>
              <div className="rounded-xl bg-amber-50 py-2.5 dark:bg-amber-500/10">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{undecV}</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Kararsız</p>
              </div>
              <div className="rounded-xl bg-red-50 py-2.5 dark:bg-red-500/10">
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{skipV}</p>
                <p className="text-[10px] text-red-600/70 dark:text-red-400/70">Vazgeçti</p>
              </div>
            </div>
          </div>

          {/* Reference product comparison */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/4">
            <p className="mb-3 text-xs font-bold text-gray-400">Rakip Karşılaştırması</p>
            <div className="flex gap-3">
              <div className="relative size-12 overflow-hidden rounded-xl bg-gray-50">
                <Image src={product.image} alt="" fill className="object-contain p-1.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{product.title}</p>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4].map((s) => <Star key={s} className="size-3 fill-amber-400 text-amber-400" />)}
                  <Star className="size-3 text-gray-200" />
                  <span className="ml-1 text-[10px] text-gray-400">4.0 puan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Taşınan Simüler */}
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Taşınan Simüler</p>
          <div className="space-y-2">
            {visiblePersonas.map((p, i) => {
              const badge = decisionBadge[p.decision];
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 dark:border-white/8 dark:bg-white/4">
                  <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                    <Image src={AVATARS[i % AVATARS.length]} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.caresAbout}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.cls)}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Erteyin İçgörüleri */}
      {visible > 3 && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Erteyin İçgörüleri</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {earlyInsights.slice(0, Math.ceil((visible / total) * 4)).map((insight) => (
              <div key={insight.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/4">
                <span className="text-2xl">{insight.icon}</span>
                <p className="mt-2 text-xs font-bold text-gray-900 dark:text-white">{insight.title}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════ Completed State ═════════════════ */

function SimulationCompleted({ product }: { product: SellerProductPerformance }) {
  const buy = syntheticPersonas.filter((p) => p.decision === "buy").length;
  const undecided = syntheticPersonas.filter((p) => p.decision === "undecided").length;
  const skip = syntheticPersonas.filter((p) => p.decision === "skip").length;
  const top3 = sellerImprovements.slice(0, 3);
  const nextStepSuggestions = [
    "Simülasyon sonuçlarına göre başlığı iyileştir",
    "Eksik fotoğrafları ekle ve düzenle",
    "Garanti ve iade bilgisini görünür yap",
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/seller/products" className="hover:text-gray-600">Ürünlerim</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${product.id}`} className="hover:text-gray-600">Bluetooth Kulaklık</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-gray-600 dark:text-gray-300">Müşteri Simülasyonu</span>
      </div>

      {/* Product mini-bar */}
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm dark:border-white/8 dark:bg-white/4">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-gray-50">
          <Image src={product.image} alt={product.title} fill className="object-contain p-1.5" />
        </div>
        <p className="font-bold text-gray-900 dark:text-white truncate flex-1">{product.title}</p>
        <div className="hidden items-center gap-6 sm:flex">
          {[
            { label: "Fiyat", value: formatSellerPrice(product.price) },
            { label: "Müşteri", value: String(syntheticPersonas.length) },
            { label: "Puan", value: (5 - product.returnRate / 20).toFixed(1) },
            { label: "Skor", value: String(product.healthScore) },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Title + progress */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteri Simülasyonu Tamamlandı</h1>
          <p className="mt-1 text-sm text-gray-500">
            {syntheticPersonas.length} müşteri profili incelendi ve sonuçlar hazır.
          </p>
        </div>
        <div className="hidden flex-col items-end gap-1 sm:flex">
          <p className="text-sm font-bold text-gray-900 dark:text-white">10/16 tamamlandı</p>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div className="h-full w-[62%] rounded-full bg-green-500" />
          </div>
        </div>
      </div>

      {/* Big stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center dark:border-green-500/20 dark:bg-green-500/8">
          <p className="text-4xl font-black text-green-600 dark:text-green-400">{buy}</p>
          <p className="mt-1 text-sm font-bold text-green-700 dark:text-green-400">aktif</p>
          <p className="mt-0.5 text-[11px] text-green-600/60 dark:text-green-400/60">142 kez incelendi</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center dark:border-amber-500/20 dark:bg-amber-500/8">
          <p className="text-4xl font-black text-amber-600 dark:text-amber-400">{undecided}</p>
          <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-400">kararsız kaldı</p>
          <p className="mt-0.5 text-[11px] text-amber-600/60 dark:text-amber-400/60">İkna edilebilir profil</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-500/20 dark:bg-red-500/8">
          <p className="text-4xl font-black text-red-600 dark:text-red-400">{skip}</p>
          <p className="mt-1 text-sm font-bold text-red-700 dark:text-red-400">vazgeçti</p>
          <p className="mt-0.5 text-[11px] text-red-600/60 dark:text-red-400/60">Sana raporlanıyor!</p>
        </div>
      </div>

      {/* Main content: Left + Right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* En çok takılan 3 nokta */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-white/4">
            <p className="font-bold text-gray-900 dark:text-white">En çok takılan: 3 nokta</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Ürünü satın almamanın veya iade etmenin önde gelen sebepleri
            </p>
            <ol className="mt-5 space-y-4">
              {top3.map((imp, i) => (
                <li key={imp.id} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-500 dark:bg-white/10 dark:text-gray-400">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{imp.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{imp.rationale}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-gray-400">Frekuansı</span>
                </li>
              ))}
            </ol>
            <button className="mt-5 text-xs font-semibold text-green-600 hover:underline dark:text-green-400">
              Tüm müşteri yorumlarına bakın →
            </button>
          </div>

          {/* Persona row */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-white/4">
            <p className="mb-4 font-bold text-gray-900 dark:text-white">Öneri Sıralaması</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {syntheticPersonas.map((p, i) => {
                const badge = decisionBadge[p.decision];
                return (
                  <div key={p.id} className="w-36 shrink-0 rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-white/8 dark:bg-white/3">
                    <div className="flex items-center gap-2">
                      <div className="relative size-8 overflow-hidden rounded-full border-2 border-white">
                        <Image src={AVATARS[i % AVATARS.length]} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="truncate text-[10px] text-gray-400">{p.city}</p>
                      </div>
                    </div>
                    <span className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.cls)}>
                      {badge.icon} {badge.label}
                    </span>
                    <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                      "{p.reason}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Next step */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-white/4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sonraki adım</p>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Simülasyon bulgularına göre ürünü AI Studio'da düzelterek sonuçları iyileştirin.
            </p>
            <ul className="mt-4 space-y-3">
              {nextStepSuggestions.map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500 mt-0.5">
                    <CheckCircle2 className="size-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/seller/product/${product.id}/ai-edit`}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600"
            >
              <Bot className="size-4" />
              AI ile Düzenle
            </Link>
            <Link
              href={`/seller/product/${product.id}/ai-edit`}
              className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:text-gray-700 dark:border-white/10 dark:text-gray-400"
            >
              Tüm önerilere git
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Product thumbnail */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
              <Image src={product.image} alt={product.title} fill className="object-contain p-4" />
            </div>
            <p className="mt-3 text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">{product.title}</p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{formatSellerPrice(product.price)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════ Main Export ═════════════════ */

export function SellerSimulation({ product }: { product: SellerProductPerformance }) {
  const [visible, setVisible] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (visible < syntheticPersonas.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), STREAM_INTERVAL_MS);
      return () => clearTimeout(t);
    }
  }, [visible]);

  useEffect(() => {
    const t = setTimeout(() => setCompleted(true), COMPLETE_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (completed) return <SimulationCompleted product={product} />;
  return <SimulationRunning product={product} visible={visible} />;
}
