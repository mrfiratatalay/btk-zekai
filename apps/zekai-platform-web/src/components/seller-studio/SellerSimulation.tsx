"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Bot, Check, ChevronRight, Loader2,
  MessageSquare, Package, Shield, ShoppingCart, Star,
  ThumbsDown, Truck, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockStore } from "@/lib/store/mock-store";
import type { SellerProductPerformance, SyntheticPersona, SyntheticPersonaFocusArea } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import { streamSimulateProduct } from "@/lib/api/seller";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LOOKING_MS  = 1800;
const STEP_DECIDING_MS = 1200;
const MAX_PERSONAS      = 5;

type Decision  = "buy" | "skip" | "undecided";
type FocusArea = SyntheticPersonaFocusArea;
type SimPhase  = "looking" | "deciding";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80",
];

const DECISION_STYLE: Record<Decision, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  buy:       { label: "Satın Aldı", bg: "bg-green-500", text: "text-white", icon: <ShoppingCart className="size-3" /> },
  skip:      { label: "Vazgeçti",   bg: "bg-red-500",   text: "text-white", icon: <XCircle className="size-3" /> },
  undecided: { label: "Kararsız",   bg: "bg-amber-400", text: "text-white", icon: <ThumbsDown className="size-3" /> },
};

// Frontend fallback — persona.focusArea boş gelirse veya unknown ise
const FALLBACK_FOCUS_LABEL: Record<FocusArea, string> = {
  image:    "Görsellere bakıyor",
  title:    "Başlığı okuyor",
  price:    "Fiyatı tartıyor",
  rating:   "Puanları inceliyor",
  reviews:  "Yorumlara bakıyor",
  features: "Özellikleri inceliyor",
  shipping: "Kargoya bakıyor",
  warranty: "Garantiye bakıyor",
  cta:      "Sepete eklemeyi düşünüyor",
};

function safeFocusArea(area: string | undefined): FocusArea {
  if (!area) return "features";
  return (FALLBACK_FOCUS_LABEL as Record<string, string>)[area] ? (area as FocusArea) : "features";
}

// Persona pozisyonları (5 persona için)
const POSITIONS = [
  { left: "6%",  top: "12%" },
  { left: "78%", top: "12%" },
  { left: "84%", top: "52%" },
  { left: "3%",  top: "52%" },
  { left: "44%", top: "82%" },
];

// SVG line origin koordinatları (viewBox 100x100)
const SVG_FROM = [
  { x: 12, y: 24 },
  { x: 84, y: 24 },
  { x: 90, y: 60 },
  { x: 10, y: 60 },
  { x: 50, y: 88 },
];

// Her focusArea için ürün kartı içindeki anchor noktası (viewBox 100x100).
// Ürün kartı stage'in ortasında ~30% genişlik kaplar, x: 35-65, y: 18-78 aralığında.
const FOCUS_ANCHOR: Record<FocusArea, { x: number; y: number }> = {
  image:    { x: 50, y: 26 },
  title:    { x: 50, y: 42 },
  price:    { x: 38, y: 50 },
  rating:   { x: 62, y: 50 },
  features: { x: 50, y: 58 },
  reviews:  { x: 50, y: 66 },
  shipping: { x: 38, y: 72 },
  warranty: { x: 62, y: 72 },
  cta:      { x: 50, y: 78 },
};

// ─── Product Card (Full Focus Targets) ────────────────────────────────────────

function ProductCard({ product, activeArea }: {
  product: SellerProductPerformance;
  activeArea: FocusArea | null;
}) {
  const featureValues = Object.values(product.features);
  const displayFeatures = featureValues.length > 0
    ? featureValues.slice(0, 3)
    : ["Ürün özellikleri yükleniyor..."];
  const hl = (s: FocusArea) => cn(
    "transition-all duration-300",
    activeArea === s && "ring-2 ring-green-500 ring-offset-2 ring-offset-card rounded-xl"
  );

  return (
    <div className="w-[300px] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl sm:w-[360px]">
      {/* Image */}
      <div className={cn("p-4", hl("image"))}>
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={product.image} alt={product.title} fill className="object-contain p-3" />
        </div>
      </div>

      {/* Title */}
      <div className={cn("px-4 pb-2", hl("title"))}>
        <p className="text-sm font-bold leading-snug text-foreground line-clamp-2">
          {product.title}
        </p>
      </div>

      {/* Price + Rating row */}
      <div className="flex border-t border-border">
        <div className={cn("flex-1 px-4 py-3", hl("price"))}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Fiyat</p>
          <p className="mt-0.5 text-xl font-black text-foreground">{formatSellerPrice(product.price)}</p>
        </div>
        <div className={cn("flex-1 border-l border-border px-4 py-3", hl("rating"))}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Puan</p>
          <div className="mt-0.5 flex items-center gap-1">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-base font-black text-foreground">4.7</span>
            <span className="text-[10px] text-muted-foreground">/5</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className={cn("border-t border-border px-4 py-3", hl("features"))}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Öne Çıkan Özellikler</p>
        <ul className="space-y-1.5">
          {displayFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                <Check className="size-2.5 text-white" />
              </div>
              <span className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-1">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reviews */}
      <div className={cn("flex items-center justify-between border-t border-border px-4 py-2.5", hl("reviews"))}>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground">Yorumlar</span>
        </div>
        <span className="text-[11px] font-bold text-foreground">128 değerlendirme</span>
      </div>

      {/* Shipping + Warranty row */}
      <div className="flex border-t border-border">
        <div className={cn("flex flex-1 items-center gap-1.5 px-4 py-2.5", hl("shipping"))}>
          <Truck className="size-3.5 text-green-600 dark:text-green-400" />
          <span className="text-[10px] font-semibold text-foreground">Yarın kargo</span>
        </div>
        <div className={cn("flex flex-1 items-center gap-1.5 border-l border-border px-4 py-2.5", hl("warranty"))}>
          <Shield className="size-3.5 text-green-600 dark:text-green-400" />
          <span className="text-[10px] font-semibold text-foreground">2 yıl garanti</span>
        </div>
      </div>

      {/* CTA */}
      <div className={cn("border-t border-border p-3", hl("cta"))}>
        <div className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white">
          <ShoppingCart className="size-4" />
          Sepete Ekle
        </div>
      </div>
    </div>
  );
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative max-w-[220px]">
      <div className="rounded-2xl border border-border bg-card px-3.5 py-2 shadow-lg">
        <p className="whitespace-normal wrap-break-word text-[12px] font-semibold leading-snug text-gray-800 dark:text-gray-100">
          {text}
        </p>
      </div>
      <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 size-2.5 rotate-45 border-b border-r border-border bg-card" />
    </div>
  );
}

// ─── Pending Persona ──────────────────────────────────────────────────────────

function PendingPersonaNode({ idx }: { idx: number }) {
  const pos = POSITIONS[idx];
  return (
    <div className="absolute z-20 opacity-25" style={{ left: pos.left, top: pos.top }}>
      <div className="flex flex-col items-center gap-1.5">
        <div className="min-h-[40px]" />
        <div className="size-16 animate-pulse overflow-hidden rounded-full border-2 border-dashed border-border bg-muted" />
        <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

// ─── Real Persona Node ────────────────────────────────────────────────────────

function PersonaNode({ persona, idx, isActive, isDone, phase }: {
  persona: SyntheticPersona;
  idx: number;
  isActive: boolean;
  isDone: boolean;
  phase: SimPhase;
}) {
  const pos          = POSITIONS[idx];
  const d            = persona.decision as Decision;
  const ds           = DECISION_STYLE[d];
  const showBubble   = isActive && phase === "looking";
  const showDecision = isDone || (isActive && phase === "deciding");
  const area         = safeFocusArea(persona.focusArea);
  const bubbleText   = persona.bubbleText?.trim() || persona.focusLabel || FALLBACK_FOCUS_LABEL[area];

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: pos.left, top: pos.top }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <div className={cn(
        "flex flex-col items-center gap-1.5 transition-all duration-500",
        isActive ? "opacity-100 scale-110" :
        isDone   ? "opacity-65 scale-100"  :
                   "opacity-40 scale-95",
      )}>
        <div className="min-h-[44px] flex items-end justify-center">
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 4 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <SpeechBubble text={bubbleText} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          {isActive && (
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-green-400 opacity-30" />
          )}
          <div className={cn(
            "size-16 overflow-hidden rounded-full border-2 shadow-xl transition-all duration-300",
            isActive ? "border-green-400 shadow-green-300/50 dark:shadow-green-900/50"
                     : "border-border"
          )}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AVATARS[idx]} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
        <p className={cn(
          "text-[11px] font-bold transition-colors",
          isActive ? "text-foreground" : "text-gray-500 dark:text-muted-foreground"
        )}>
          {persona.name}
        </p>
        <AnimatePresence>
          {showDecision && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold", ds.bg, ds.text)}
            >
              {ds.icon}{ds.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Running State (Full Screen Stage) ────────────────────────────────────────

function SimulationRunning({
  product, personas, totalPersonas, activeStep, phase, streamStep, mockBanner,
}: {
  product: SellerProductPerformance;
  personas: SyntheticPersona[];
  totalPersonas: number;
  activeStep: number;
  phase: SimPhase;
  streamStep: string | null;
  mockBanner: React.ReactNode;
}) {
  const activePersona = personas[activeStep];
  const activeArea: FocusArea | null = activePersona && phase === "looking"
    ? safeFocusArea(activePersona.focusArea)
    : null;
  const completedCount = phase === "deciding" ? activeStep + 1 : activeStep;

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-linear-to-br from-[#f6f8fa] to-white dark:from-[#0a0a0a] dark:to-[#0e0e0e]">
      {/* Background dot pattern (full viewport) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.06]">
        <defs>
          <pattern id="sim-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#22c55e" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sim-dots)" />
      </svg>

      {/* Top bar */}
      <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-card/60 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/seller/product/${product.id}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Ürüne dön"
          >
            <ChevronRight className="size-4 rotate-180" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-foreground sm:text-base">
              Müşteri Simülasyonu · {product.title}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              {streamStep ?? "Müşteriler ürün sayfanızı inceliyor..."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {completedCount} / {totalPersonas}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPersonas }, (_, i) => (
              <div key={i} className={cn(
                "h-1.5 w-5 rounded-full transition-all duration-500 sm:w-7",
                i < completedCount      ? "bg-green-500"             :
                i === activeStep        ? "animate-pulse bg-green-300" :
                i < personas.length     ? "bg-muted-foreground/30" :
                                          "bg-muted"
              )} />
            ))}
          </div>
        </div>
      </header>

      {mockBanner && (
        <div className="relative z-30 px-4 pt-3 sm:px-6">{mockBanner}</div>
      )}

      {/* Stage — fills remaining space */}
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
        {/* SVG lines — each persona connects to its focusArea anchor */}
        <div className="pointer-events-none absolute inset-0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            {personas.map((p, i) => {
              const from = SVG_FROM[i];
              if (!from) return null;
              const area = safeFocusArea(p.focusArea);
              const to = FOCUS_ANCHOR[area];
              const isActive = i === activeStep;
              return (
                <line key={p.id}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="#22c55e" strokeWidth="0.35" strokeDasharray="1.6 1.1"
                  className="transition-all duration-500"
                  opacity={isActive ? 0.85 : 0.18}
                />
              );
            })}
            {/* Pending placeholders — straight line to product center */}
            {Array.from({ length: totalPersonas }, (_, i) => {
              if (personas[i]) return null;
              const from = SVG_FROM[i];
              if (!from) return null;
              return (
                <line key={`pending-${i}`}
                  x1={from.x} y1={from.y} x2={50} y2={50}
                  stroke="#22c55e" strokeWidth="0.3" strokeDasharray="0.8 1.2"
                  opacity={0.06}
                />
              );
            })}
          </svg>
        </div>

        {/* Product card — center */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl">
          <ProductCard product={product} activeArea={activeArea} />
        </div>

        {/* Persona nodes */}
        {Array.from({ length: totalPersonas }, (_, i) => {
          const persona = personas[i];
          if (!persona) return <PendingPersonaNode key={i} idx={i} />;
          return (
            <PersonaNode
              key={persona.id}
              persona={persona}
              idx={i}
              isActive={i === activeStep}
              isDone={i < activeStep || (i === activeStep && phase === "deciding")}
              phase={phase}
            />
          );
        })}
      </div>

      {/* Bottom persona strip */}
      <footer className="relative z-30 shrink-0 border-t border-border/40 bg-card/60 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: totalPersonas }, (_, i) => {
            const persona = personas[i];
            if (!persona) {
              return (
                <div key={i} className="flex min-w-[155px] shrink-0 items-center gap-2.5 rounded-2xl border border-border bg-card p-2.5 opacity-25">
                  <div className="size-7 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-2 w-12 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              );
            }
            const done   = i < activeStep || (i === activeStep && phase === "deciding");
            const active = i === activeStep;
            const dStyle = DECISION_STYLE[persona.decision as Decision];
            const area   = safeFocusArea(persona.focusArea);
            const label  = persona.focusLabel || FALLBACK_FOCUS_LABEL[area];
            return (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "flex min-w-[180px] shrink-0 items-center gap-2.5 rounded-2xl border p-2.5 transition-all duration-500",
                  active ? "border-green-300 bg-green-50 dark:border-green-500/30 dark:bg-green-500/5"
                         : "border-border bg-card",
                  !active && !done && "opacity-35"
                )}
              >
                <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                  <Image src={AVATARS[i]} alt={persona.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">{persona.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{label}</p>
                </div>
                {done && (
                  <div className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", dStyle.bg, dStyle.text)}>
                    {dStyle.label}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

// ─── Completed State (Full Screen) ────────────────────────────────────────────

function saveSimulationContext(productId: string, personas: SyntheticPersona[]) {
  try {
    const payload = JSON.stringify({ personas, savedAt: Date.now() });
    sessionStorage.setItem(`zekai_sim_${productId}`, payload);
    localStorage.setItem(`zekai_sim_last_${productId}`, payload);
  } catch { /* ignore */ }
}

function SimulationCompleted({
  product, personas, mockBanner,
}: {
  product: SellerProductPerformance;
  personas: SyntheticPersona[];
  mockBanner: React.ReactNode;
}) {
  const buy       = personas.filter((p) => p.decision === "buy").length;
  const skip      = personas.filter((p) => p.decision === "skip").length;
  const undecided = personas.filter((p) => p.decision === "undecided").length;

  // Persist son sonucu — AI edit handoff için
  useEffect(() => {
    saveSimulationContext(product.id, personas);
  }, [product.id, personas]);

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#f6f8fa] to-white dark:from-[#0a0a0a] dark:to-[#0e0e0e]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/seller/products" className="hover:text-gray-600 dark:hover:text-gray-300">Ürünlerim</Link>
          <ChevronRight className="size-3.5" />
          <Link href={`/seller/product/${product.id}`} className="hover:text-gray-600 dark:hover:text-gray-300">
            {product.title}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-gray-600 dark:text-gray-300">Simülasyon Sonucu</span>
        </nav>

        {mockBanner}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Simülasyon Tamamlandı</h1>
            <p className="mt-1 text-sm text-muted-foreground">{personas.length} farklı müşteri profili ürününüzü inceledi.</p>
          </div>
          <Link
            href={`/seller/product/${product.id}/ai-edit?from=simulation`}
            onClick={() => saveSimulationContext(product.id, personas)}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 sm:justify-start">
            <Bot className="size-4" />AI ile Düzenle
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { count: buy,       label: "Satın Aldı",    note: "İkna oldu",        bg: "bg-green-50 dark:bg-green-500/8",  border: "border-green-100 dark:border-green-500/20",  text: "text-green-600 dark:text-green-400",  sub: "text-green-600/60 dark:text-green-400/60" },
            { count: undecided, label: "Kararsız Kaldı", note: "İkna edilebilir",  bg: "bg-amber-50 dark:bg-amber-500/8",  border: "border-amber-100 dark:border-amber-500/20",  text: "text-amber-600 dark:text-amber-400",  sub: "text-amber-600/60 dark:text-amber-400/60" },
            { count: skip,      label: "Vazgeçti",       note: "Geri döndü",       bg: "bg-red-50 dark:bg-red-500/8",      border: "border-red-100 dark:border-red-500/20",      text: "text-red-600 dark:text-red-400",      sub: "text-red-600/60 dark:text-red-400/60" },
          ].map((c) => (
            <div key={c.label} className={cn("rounded-2xl border p-4 text-center sm:p-6", c.bg, c.border)}>
              <p className={cn("text-3xl font-black sm:text-5xl", c.text)}>{c.count}</p>
              <p className={cn("mt-1 text-xs font-bold sm:text-sm", c.text)}>{c.label}</p>
              <p className={cn("mt-0.5 hidden text-[11px] sm:block", c.sub)}>{c.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-5 font-bold text-foreground">Müşteri Kararları</p>
          <div className="space-y-4">
            {personas.map((persona, i) => {
              const d  = persona.decision as Decision;
              const ds = DECISION_STYLE[d];
              const area = safeFocusArea(persona.focusArea);
              const label = persona.focusLabel || FALLBACK_FOCUS_LABEL[area];
              return (
                <div key={persona.id} className="flex items-start gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-border">
                    <Image src={AVATARS[i]} alt={persona.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground">{persona.name}</p>
                      <p className="text-xs text-muted-foreground">{persona.segment} · {persona.city}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {label}
                      </span>
                      <div className={cn("ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", ds.bg, ds.text)}>
                        {ds.icon}{ds.label}
                      </div>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-muted-foreground">
                      &ldquo;{persona.reason}&rdquo;
                    </p>
                    {persona.recommendation && (
                      <p className="mt-1 text-[11px] text-green-600 dark:text-green-400">
                        💡 {persona.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/seller/product/${product.id}/ai-edit?from=simulation`}
            onClick={() => saveSimulationContext(product.id, personas)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white hover:bg-green-600">
            <Bot className="size-4" />Sonuçlara Göre AI ile Düzenle<ArrowRight className="size-4" />
          </Link>
          <Link href="/seller/products"
            className="flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function SellerSimulation({ product }: { product: SellerProductPerformance }) {
  const [personas,   setPersonas]   = useState<SyntheticPersona[]>([]);
  const [totalPersonas, setTotalPersonas] = useState(MAX_PERSONAS);
  const isMockMode = useMockStore((s) => s.isMockMode);
  const [streamDone, setStreamDone] = useState(false);
  const [streamStep, setStreamStep] = useState<string | null>("Simülasyon başlatılıyor...");
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [phase,      setPhase]      = useState<SimPhase>("looking");
  const [completed,  setCompleted]  = useState(false);
  const hasFetched = useRef(false);

  // SSE stream
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    streamSimulateProduct(product.id, (event) => {
      if (event.type === "step") {
        setStreamStep(event.message);
        const match = event.message.match(/^(\d+) profil/);
        if (match) setTotalPersonas(Number(match[1]));
      } else if (event.type === "persona") {
        const p = event.persona;
        const focusArea = safeFocusArea(p.focusArea);
        setPersonas((prev) => [
          ...prev,
          {
            id: p.id, name: p.name, age: p.age, city: p.city,
            segment: p.segment, profile: p.profile, caresAbout: p.caresAbout,
            decision: p.decision as Decision,
            reason: p.reason, lookedAt: p.lookedAt,
            recommendation: p.recommendation, monologue: p.monologue,
            focusArea,
            focusLabel: p.focusLabel || FALLBACK_FOCUS_LABEL[focusArea],
            bubbleText: p.bubbleText || p.focusLabel || FALLBACK_FOCUS_LABEL[focusArea],
          },
        ]);
        setLoading(false);
      } else if (event.type === "done") {
        setStreamDone(true);
        setStreamStep(null);
        setLoading(false);
      } else if (event.type === "error") {
        setSimulationError(event.message);
        setStreamDone(true);
        setLoading(false);
      }
    }).catch(() => {
      setSimulationError("Müşteri simülasyonu başlatılamadı. Lütfen tekrar deneyin.");
      setLoading(false);
      setStreamDone(true);
    });
  }, [product.id]);

  // looking → deciding
  useEffect(() => {
    if (loading || completed) return;
    if (!personas[activeStep]) return;
    const t = setTimeout(() => setPhase("deciding"), STEP_LOOKING_MS);
    return () => clearTimeout(t);
  }, [activeStep, completed, loading, personas]);

  // deciding → next persona (or wait, or complete)
  useEffect(() => {
    if (phase !== "deciding" || completed) return;
    if (!personas[activeStep]) return;

    const t = setTimeout(() => {
      if (personas[activeStep + 1]) {
        setActiveStep((s) => s + 1);
        setPhase("looking");
      } else if (streamDone) {
        setCompleted(true);
      }
    }, STEP_DECIDING_MS);
    return () => clearTimeout(t);
  }, [phase, activeStep, completed, personas, streamDone]);

  const mockBanner = isMockMode && personas.length > 0 ? (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400">
      <Package className="size-4 shrink-0" />
      Demo mod — Gemini API kapasitesi geçici olarak doldu. Bu simülasyon gerçek AI profilleri değil, sabit demo verisidir.
    </div>
  ) : null;

  if (simulationError && personas.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-linear-to-br from-[#f6f8fa] to-white px-6 text-center dark:from-[#0a0a0a] dark:to-[#0e0e0e]">
        <div className="flex size-14 items-center justify-center rounded-full bg-red-500/10">
          <XCircle className="size-7 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Simülasyon tamamlanamadı</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{simulationError}</p>
        </div>
        <Link
          href={`/seller/product/${product.id}`}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Ürüne dön
        </Link>
      </div>
    );
  }

  if (loading && personas.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-linear-to-br from-[#f6f8fa] to-white dark:from-[#0a0a0a] dark:to-[#0e0e0e]">
        <div className="relative flex size-14 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400/20" />
          <div className="relative flex size-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10">
            <Bot className="size-6 text-green-500" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">AI Simülasyon Hazırlanıyor</p>
          <p className="mt-1 text-sm text-muted-foreground">{streamStep ?? "Bağlanıyor..."}</p>
        </div>
        <Loader2 className="size-5 animate-spin text-green-500" />
      </div>
    );
  }

  if (completed) return (
    <SimulationCompleted product={product} personas={personas} mockBanner={mockBanner} />
  );

  return (
    <SimulationRunning
      product={product}
      personas={personas}
      totalPersonas={totalPersonas}
      activeStep={activeStep}
      phase={phase}
      streamStep={streamStep}
      mockBanner={mockBanner}
    />
  );
}
