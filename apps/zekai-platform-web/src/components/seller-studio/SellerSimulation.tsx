"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Bot, Check, ChevronRight,
  ShoppingCart, Star, ThumbsDown, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import { SYNTHETIC_PERSONAS } from "@/lib/constants/personas";

// ─── Constants ────────────────────────────────────────────────────────────────

// Zeynep(skip), Burak(skip), Ayşe(buy), Mehmet(skip), Elif(buy) → 2 buy / 3 skip
const PERSONAS = [0, 1, 2, 3, 5].map((i) => SYNTHETIC_PERSONAS[i]);

const STEP_LOOKING_MS  = 1800;
const STEP_DECIDING_MS = 1200;

type Decision  = "buy" | "skip" | "undecided";
type Section   = "image" | "price" | "features" | "reviews" | "cta";
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

// lookedAt[0] → which card section glows
const SECTION_MAP: Record<string, Section> = {
  "Mikrofon": "features", "Fotoğraflar": "image",  "Yorumlar": "reviews",
  "Gecikme":  "features", "Fiyat":       "price",  "Pil":      "features",
  "Kargo":    "cta",      "Garanti":     "features","Konfor":   "features",
  "Teknik tablo": "features",
};

function getSection(p: typeof PERSONAS[0]): Section {
  for (const l of p.lookedAt) { const s = SECTION_MAP[l]; if (s) return s; }
  return "features";
}

// Persona positions — speech bubble always appears ABOVE the avatar
const POSITIONS = [
  { left: "6%",  top: "14%" },  // Zeynep — top-left
  { left: "75%", top: "14%" },  // Burak  — top-right
  { left: "82%", top: "48%" },  // Ayşe   — right
  { left: "3%",  top: "48%" },  // Mehmet — left
  { left: "42%", top: "70%" },  // Elif   — bottom
];

// SVG line endpoints — center of each avatar (% of stage)
const SVG_FROM = [
  { x: 12, y: 30 },
  { x: 82, y: 30 },
  { x: 89, y: 60 },
  { x: 10, y: 60 },
  { x: 50, y: 82 },
];
const SVG_TO = { x: 50, y: 47 };

// Default feature bullets (fallback – we don't have real features in the type)
const FALLBACK_FEATURES = [
  "Bluetooth 5.3",
  "15 saat pil ömrü",
  "Dokunmatik kontrol",
  "IPX4 su dayanıklılığı",
];

// ─── Mini Product Card ────────────────────────────────────────────────────────

function ProductCard({ product, activeSection }: {
  product: SellerProductPerformance;
  activeSection: Section | null;
}) {
  const hl = (s: Section) => cn(
    "transition-all duration-300",
    activeSection === s && "ring-2 ring-green-500 ring-offset-1 rounded-xl"
  );

  return (
    <div className="w-[300px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111]">

      {/* Image + title */}
      <div className={cn("p-3.5", hl("image"))}>
        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
          <Image src={product.image} alt={product.title} fill className="object-contain p-2" />
        </div>
        <p className="mt-2.5 text-[13px] font-bold leading-snug text-gray-900 dark:text-white line-clamp-2">
          {product.title}
        </p>
      </div>

      {/* Price */}
      <div className={cn("flex items-center justify-between border-t border-gray-100 px-3.5 py-2.5 dark:border-white/8", hl("price"))}>
        <span className="text-base font-black text-gray-900 dark:text-white">
          {formatSellerPrice(product.price)}
        </span>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
          Stokta
        </span>
      </div>

      {/* Features */}
      <div className={cn("border-t border-gray-100 px-3.5 py-3 dark:border-white/8", hl("features"))}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
          Öne Çıkan Özellikler
        </p>
        <ul className="space-y-1.5">
          {FALLBACK_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                <Check className="size-2.5 text-white" />
              </div>
              <span className="text-[11px] text-gray-700 dark:text-gray-300">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reviews */}
      <div className={cn("flex items-center gap-1.5 border-t border-gray-100 px-3.5 py-2.5 dark:border-white/8", hl("reviews"))}>
        <div className="flex">
          {[1, 2, 3, 4].map((s) => <Star key={s} className="size-3 fill-amber-400 text-amber-400" />)}
          <Star className="size-3 text-gray-200" />
        </div>
        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">4.0 · 142 yorum</span>
      </div>

      {/* CTA */}
      <div className={cn("border-t border-gray-100 p-3 dark:border-white/8", hl("cta"))}>
        <div className="flex h-9 w-full items-center justify-center rounded-xl bg-green-500 text-xs font-bold text-white">
          Sepete Ekle
        </div>
      </div>
    </div>
  );
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────

function SpeechBubble({ text, tail }: {
  text: string;
  tail: "left" | "right" | "bottom";
}) {
  return (
    <div className="relative">
      <div className="whitespace-nowrap rounded-2xl bg-white px-3.5 py-2 shadow-lg border border-gray-100 dark:bg-[#1e1e1e] dark:border-white/10">
        <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-100">{text}</p>
      </div>
      {tail === "bottom" && (
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 size-2.5 rotate-45 border-b border-r border-gray-100 bg-white dark:border-white/10 dark:bg-[#1e1e1e]" />
      )}
      {tail === "left" && (
        <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 size-2.5 rotate-45 border-b border-l border-gray-100 bg-white dark:border-white/10 dark:bg-[#1e1e1e]" />
      )}
      {tail === "right" && (
        <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 size-2.5 rotate-45 border-r border-t border-gray-100 bg-white dark:border-white/10 dark:bg-[#1e1e1e]" />
      )}
    </div>
  );
}

// ─── Persona Node ─────────────────────────────────────────────────────────────

function PersonaNode({ persona, idx, isActive, isDone, phase }: {
  persona: typeof PERSONAS[0];
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

  return (
    <div className="absolute z-20" style={{ left: pos.left, top: pos.top }}>
      <div className={cn(
        "flex flex-col items-center gap-1.5 transition-all duration-500",
        isActive ? "opacity-100 scale-110" :
        isDone   ? "opacity-65 scale-100"  :
                   "opacity-40 scale-95",
      )}>

        {/* Speech bubble — always above the avatar */}
        <div className="min-h-[40px] flex items-end justify-center">
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 4 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <SpeechBubble
                  text={persona.lookedAt[0] + " inceliyor..."}
                  tail="bottom"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="relative">
          {isActive && (
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-green-400 opacity-30" />
          )}
          <div className={cn(
            "size-16 overflow-hidden rounded-full border-2 shadow-xl transition-all duration-300",
            isActive ? "border-green-400 shadow-green-300/50 dark:shadow-green-900/50"
                     : "border-gray-200 dark:border-white/10"
          )}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AVATARS[idx]}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Name */}
        <p className={cn(
          "text-[11px] font-bold transition-colors",
          isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
        )}>
          {persona.name}
        </p>

        {/* Decision badge */}
        <AnimatePresence>
          {showDecision && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold", ds.bg, ds.text)}
            >
              {ds.icon}
              {ds.label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Running State ────────────────────────────────────────────────────────────

function SimulationRunning({ product, activeStep, phase }: {
  product: SellerProductPerformance;
  activeStep: number;
  phase: SimPhase;
}) {
  const activePersona   = PERSONAS[activeStep];
  const activeSection   = phase === "looking" ? getSection(activePersona) : null;
  const completedCount  = phase === "deciding" ? activeStep + 1 : activeStep;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteri Simülasyonu</h1>
          <p className="mt-0.5 text-sm text-gray-400">Müşteriler ürün sayfanızı inceliyor...</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{completedCount} / {PERSONAS.length} tamamlandı</span>
          <div className="flex gap-1">
            {PERSONAS.map((_, i) => (
              <div key={i} className={cn(
                "h-1.5 w-8 rounded-full transition-all duration-500",
                i < completedCount  ? "bg-green-500"        :
                i === activeStep    ? "animate-pulse bg-green-300" :
                                      "bg-gray-200 dark:bg-white/10"
              )} />
            ))}
          </div>
        </div>
      </div>

      {/* Stage — outer div gives positioning context, no overflow clip */}
      <div className="relative h-[540px] w-full">

        {/* Background layer — clipped for rounded corners */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[#f6f8fa] to-white dark:border-white/8 dark:from-[#0c0c0c] dark:to-[#0f0f0f]">
          {/* Subtle dot grid */}
          <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#22c55e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* SVG connecting lines — inside clip */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            {SVG_FROM.map((from, i) => (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={SVG_TO.x} y2={SVG_TO.y}
                stroke="#22c55e"
                strokeWidth="0.4"
                strokeDasharray="1.8 1.2"
                className="transition-all duration-500"
                opacity={i === activeStep ? 0.8 : 0.18}
              />
            ))}
          </svg>
        </div>

        {/* Product card — centered */}
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-10 drop-shadow-2xl">
          <ProductCard product={product} activeSection={activeSection} />
        </div>

        {/* Persona nodes — outside clip so they don't get cut */}
        {PERSONAS.map((persona, i) => (
          <PersonaNode
            key={persona.id}
            persona={persona}
            idx={i}
            isActive={i === activeStep}
            isDone={i < activeStep || (i === activeStep && phase === "deciding")}
            phase={phase}
          />
        ))}
      </div>

      {/* Bottom strip — persona cards */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PERSONAS.map((persona, i) => {
          const done  = i < activeStep || (i === activeStep && phase === "deciding");
          const active = i === activeStep;
          const d  = persona.decision as Decision;
          const ds = DECISION_STYLE[d];
          return (
            <div key={persona.id} className={cn(
              "flex min-w-[155px] shrink-0 items-center gap-2.5 rounded-2xl border p-3 transition-all duration-500",
              active ? "border-green-300 bg-green-50 dark:border-green-500/30 dark:bg-green-500/5"
                     : "border-gray-100 bg-white dark:border-white/8 dark:bg-white/3",
              !active && !done && "opacity-35"
            )}>
              <div className="relative size-8 shrink-0 overflow-hidden rounded-full">
                <Image src={AVATARS[i]} alt={persona.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{persona.name}</p>
                <p className="truncate text-[10px] text-gray-400">{persona.segment}</p>
              </div>
              {done && (
                <div className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", ds.bg, ds.text)}>
                  {ds.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Completed State ──────────────────────────────────────────────────────────

function SimulationCompleted({ product }: { product: SellerProductPerformance }) {
  const buy       = PERSONAS.filter((p) => p.decision === "buy").length;
  const skip      = PERSONAS.filter((p) => p.decision === "skip").length;
  const undecided = PERSONAS.filter((p) => p.decision === "undecided").length;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/seller/products" className="hover:text-gray-600 dark:hover:text-gray-300">Ürünlerim</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${product.id}`} className="hover:text-gray-600 dark:hover:text-gray-300">
          {product.title}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-gray-600 dark:text-gray-300">Simülasyon Sonucu</span>
      </nav>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simülasyon Tamamlandı</h1>
          <p className="mt-1 text-sm text-gray-400">{PERSONAS.length} farklı müşteri profili ürününüzü inceledi.</p>
        </div>
        <Link
          href={`/seller/product/${product.id}/ai-edit`}
          className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600"
        >
          <Bot className="size-4" />
          AI ile Düzenle
        </Link>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { count: buy,       label: "Satın Aldı",   note: "İkna oldu",       bg: "bg-green-50 dark:bg-green-500/8",  border: "border-green-100 dark:border-green-500/20",  text: "text-green-600 dark:text-green-400",  sub: "text-green-600/60 dark:text-green-400/60" },
          { count: undecided, label: "Kararsız Kaldı", note: "İkna edilebilir", bg: "bg-amber-50 dark:bg-amber-500/8",  border: "border-amber-100 dark:border-amber-500/20",  text: "text-amber-600 dark:text-amber-400",  sub: "text-amber-600/60 dark:text-amber-400/60" },
          { count: skip,      label: "Vazgeçti",     note: "Geri döndü",      bg: "bg-red-50 dark:bg-red-500/8",      border: "border-red-100 dark:border-red-500/20",      text: "text-red-600 dark:text-red-400",      sub: "text-red-600/60 dark:text-red-400/60" },
        ].map((c) => (
          <div key={c.label} className={cn("rounded-2xl border p-5 text-center", c.bg, c.border)}>
            <p className={cn("text-4xl font-black", c.text)}>{c.count}</p>
            <p className={cn("mt-1 text-sm font-bold", c.text)}>{c.label}</p>
            <p className={cn("mt-0.5 text-[11px]", c.sub)}>{c.note}</p>
          </div>
        ))}
      </div>

      {/* Persona decisions */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#111]">
        <p className="mb-5 font-bold text-gray-900 dark:text-white">Müşteri Kararları</p>
        <div className="space-y-4">
          {PERSONAS.map((persona, i) => {
            const d  = persona.decision as Decision;
            const ds = DECISION_STYLE[d];
            return (
              <div key={persona.id} className="flex items-start gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-gray-100 dark:border-white/10">
                  <Image src={AVATARS[i]} alt={persona.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{persona.name}</p>
                    <p className="text-xs text-gray-400">{persona.segment} · {persona.city}</p>
                    <div className={cn("ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold", ds.bg, ds.text)}>
                      {ds.icon}
                      {ds.label}
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    &ldquo;{persona.reason}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3">
        <Link
          href={`/seller/product/${product.id}/ai-edit`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white hover:bg-green-600"
        >
          <Bot className="size-4" />
          Sonuçlara Göre AI ile Düzenle
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/seller/products"
          className="flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
        >
          Ürünlere Dön
        </Link>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function SellerSimulation({ product }: { product: SellerProductPerformance }) {
  const [activeStep, setActiveStep] = useState(0);
  const [phase,      setPhase]      = useState<SimPhase>("looking");
  const [completed,  setCompleted]  = useState(false);

  // looking → deciding
  useEffect(() => {
    if (completed) return;
    const t = setTimeout(() => setPhase("deciding"), STEP_LOOKING_MS);
    return () => clearTimeout(t);
  }, [activeStep, completed]);

  // deciding → next step or complete
  useEffect(() => {
    if (phase !== "deciding" || completed) return;
    const t = setTimeout(() => {
      if (activeStep < PERSONAS.length - 1) {
        setActiveStep((s) => s + 1);
        setPhase("looking");
      } else {
        setCompleted(true);
      }
    }, STEP_DECIDING_MS);
    return () => clearTimeout(t);
  }, [phase, activeStep, completed]);

  if (completed) return <SimulationCompleted product={product} />;

  return <SimulationRunning product={product} activeStep={activeStep} phase={phase} />;
}
