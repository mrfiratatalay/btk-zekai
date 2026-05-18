"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Bot, Check, ChevronRight, Loader2,
  MessageSquare, ShoppingCart, ThumbsDown, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellerProductPerformance, SyntheticPersona } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import { streamSimulateProduct } from "@/lib/api/seller";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LOOKING_MS  = 1800;
const STEP_DECIDING_MS = 1200;
const MAX_PERSONAS      = 5;

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

const SECTION_MAP: Record<string, Section> = {
  "Mikrofon": "features", "Fotoğraflar": "image",  "Yorumlar": "reviews",
  "Gecikme":  "features", "Fiyat":       "price",  "Pil":      "features",
  "Kargo":    "cta",      "Garanti":     "features","Konfor":   "features",
  "Teknik tablo": "features",
};

function getSection(p: SyntheticPersona): Section {
  for (const l of p.lookedAt) { const s = SECTION_MAP[l]; if (s) return s; }
  return "features";
}

const POSITIONS = [
  { left: "6%",  top: "14%" },
  { left: "75%", top: "14%" },
  { left: "82%", top: "48%" },
  { left: "3%",  top: "48%" },
  { left: "42%", top: "70%" },
];

const SVG_FROM = [
  { x: 12, y: 30 },
  { x: 82, y: 30 },
  { x: 89, y: 60 },
  { x: 10, y: 60 },
  { x: 50, y: 82 },
];
const SVG_TO = { x: 50, y: 47 };

// ─── Mini Product Card ────────────────────────────────────────────────────────

function ProductCard({ product, activeSection }: {
  product: SellerProductPerformance;
  activeSection: Section | null;
}) {
  const featureValues = Object.values(product.features);
  const displayFeatures = featureValues.length > 0
    ? featureValues.slice(0, 4)
    : ["Ürün özellikleri yükleniyor..."];
  const hl = (s: Section) => cn(
    "transition-all duration-300",
    activeSection === s && "ring-2 ring-green-500 ring-offset-1 rounded-xl"
  );

  return (
    <div className="w-[300px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <div className={cn("p-3.5", hl("image"))}>
        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-muted">
          <Image src={product.image} alt={product.title} fill className="object-contain p-2" />
        </div>
        <p className="mt-2.5 text-[13px] font-bold leading-snug text-foreground line-clamp-2">
          {product.title}
        </p>
      </div>
      <div className={cn("flex items-center justify-between border-t border-border px-3.5 py-2.5 border-border", hl("price"))}>
        <span className="text-base font-black text-foreground">{formatSellerPrice(product.price)}</span>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">Stokta</span>
      </div>
      <div className={cn("border-t border-border px-3.5 py-3 border-border", hl("features"))}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Öne Çıkan Özellikler</p>
        <ul className="space-y-1.5">
          {displayFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                <Check className="size-2.5 text-white" />
              </div>
              <span className="text-[11px] text-gray-700 dark:text-gray-300">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={cn("flex items-center gap-1.5 border-t border-border px-3.5 py-2.5 border-border", hl("reviews"))}>
        <MessageSquare className="size-3 text-gray-300 dark:text-gray-600" />
        <span className="text-[11px] font-semibold text-muted-foreground dark:text-gray-500">Yorumlar</span>
      </div>
      <div className={cn("border-t border-border p-3 border-border", hl("cta"))}>
        <div className="flex h-9 w-full items-center justify-center rounded-xl bg-green-500 text-xs font-bold text-white">
          Sepete Ekle
        </div>
      </div>
    </div>
  );
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="relative">
      <div className="whitespace-nowrap rounded-2xl border border-border bg-card px-3.5 py-2 shadow-lg">
        <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-100">{text}</p>
      </div>
      <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 size-2.5 rotate-45 border-b border-r border-border bg-card" />
    </div>
  );
}

// ─── Pending Persona (not yet arrived from stream) ────────────────────────────

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
        <div className="min-h-[40px] flex items-end justify-center">
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 4 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <SpeechBubble text={persona.lookedAt[0] + " inceliyor..."} />
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

// ─── Running State ────────────────────────────────────────────────────────────

function SimulationRunning({
  product, personas, totalPersonas, activeStep, phase, streamStep,
}: {
  product: SellerProductPerformance;
  personas: SyntheticPersona[];
  totalPersonas: number;
  activeStep: number;
  phase: SimPhase;
  streamStep: string | null;
}) {
  const activePersona   = personas[activeStep];
  const activeSection   = activePersona && phase === "looking" ? getSection(activePersona) : null;
  const completedCount  = phase === "deciding" ? activeStep + 1 : activeStep;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Müşteri Simülasyonu</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {streamStep ?? "Müşteriler ürün sayfanızı inceliyor..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{completedCount} / {totalPersonas} tamamlandı</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPersonas }, (_, i) => (
              <div key={i} className={cn(
                "h-1.5 w-8 rounded-full transition-all duration-500",
                i < completedCount      ? "bg-green-500"             :
                i === activeStep        ? "animate-pulse bg-green-300" :
                i < personas.length     ? "bg-muted-foreground/30" :
                                          "bg-muted"
              )} />
            ))}
          </div>
        </div>
      </div>

      {/* Stage */}
      <div className="relative h-[540px] w-full">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-[#f6f8fa] to-white border-border dark:from-[#0c0c0c] dark:to-[#0f0f0f]">
          <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#22c55e" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* SVG lines */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            {SVG_FROM.map((from, i) => (
              <line key={i}
                x1={from.x} y1={from.y} x2={SVG_TO.x} y2={SVG_TO.y}
                stroke="#22c55e" strokeWidth="0.4" strokeDasharray="1.8 1.2"
                className="transition-all duration-500"
                opacity={i === activeStep ? 0.8 : i < personas.length ? 0.18 : 0.06}
              />
            ))}
          </svg>
        </div>

        {/* Product card */}
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-10 drop-shadow-2xl">
          <ProductCard product={product} activeSection={activeSection} />
        </div>

        {/* Persona nodes — real or pending placeholders */}
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

      {/* Bottom persona card strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: totalPersonas }, (_, i) => {
          const persona = personas[i];
          if (!persona) {
            // Placeholder card
            return (
              <div key={i} className="flex min-w-[155px] shrink-0 items-center gap-2.5 rounded-2xl border border-border bg-card p-3 opacity-25">
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-12 animate-pulse rounded bg-muted" />
                </div>
              </div>
            );
          }
          const done  = i < activeStep || (i === activeStep && phase === "deciding");
          const active = i === activeStep;
          const d  = persona.decision as Decision;
          const ds = DECISION_STYLE[d];
          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "flex min-w-[155px] shrink-0 items-center gap-2.5 rounded-2xl border p-3 transition-all duration-500",
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
                <p className="truncate text-[10px] text-muted-foreground">{persona.segment}</p>
              </div>
              {done && (
                <div className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", ds.bg, ds.text)}>
                  {ds.label}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Completed State ──────────────────────────────────────────────────────────

function saveSimulationContext(productId: string, personas: SyntheticPersona[]) {
  try {
    sessionStorage.setItem(
      `zekai_sim_${productId}`,
      JSON.stringify({ personas, savedAt: Date.now() }),
    );
  } catch { /* ignore */ }
}

function SimulationCompleted({ product, personas }: { product: SellerProductPerformance; personas: SyntheticPersona[] }) {
  const buy       = personas.filter((p) => p.decision === "buy").length;
  const skip      = personas.filter((p) => p.decision === "skip").length;
  const undecided = personas.filter((p) => p.decision === "undecided").length;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
          <h1 className="text-2xl font-bold text-foreground">Simülasyon Tamamlandı</h1>
          <p className="mt-1 text-sm text-muted-foreground">{personas.length} farklı müşteri profili ürününüzü inceledi.</p>
        </div>
        <Link
          href={`/seller/product/${product.id}/ai-edit?from=simulation`}
          onClick={() => saveSimulationContext(product.id, personas)}
          className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600">
          <Bot className="size-4" />AI ile Düzenle
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { count: buy,       label: "Satın Aldı",    note: "İkna oldu",        bg: "bg-green-50 dark:bg-green-500/8",  border: "border-green-100 dark:border-green-500/20",  text: "text-green-600 dark:text-green-400",  sub: "text-green-600/60 dark:text-green-400/60" },
          { count: undecided, label: "Kararsız Kaldı", note: "İkna edilebilir",  bg: "bg-amber-50 dark:bg-amber-500/8",  border: "border-amber-100 dark:border-amber-500/20",  text: "text-amber-600 dark:text-amber-400",  sub: "text-amber-600/60 dark:text-amber-400/60" },
          { count: skip,      label: "Vazgeçti",       note: "Geri döndü",       bg: "bg-red-50 dark:bg-red-500/8",      border: "border-red-100 dark:border-red-500/20",      text: "text-red-600 dark:text-red-400",      sub: "text-red-600/60 dark:text-red-400/60" },
        ].map((c) => (
          <div key={c.label} className={cn("rounded-2xl border p-5 text-center", c.bg, c.border)}>
            <p className={cn("text-4xl font-black", c.text)}>{c.count}</p>
            <p className={cn("mt-1 text-sm font-bold", c.text)}>{c.label}</p>
            <p className={cn("mt-0.5 text-[11px]", c.sub)}>{c.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="mb-5 font-bold text-foreground">Müşteri Kararları</p>
        <div className="space-y-4">
          {personas.map((persona, i) => {
            const d  = persona.decision as Decision;
            const ds = DECISION_STYLE[d];
            return (
              <div key={persona.id} className="flex items-start gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-border">
                  <Image src={AVATARS[i]} alt={persona.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">{persona.name}</p>
                    <p className="text-xs text-muted-foreground">{persona.segment} · {persona.city}</p>
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

      <div className="flex items-center gap-3">
        <Link
          href={`/seller/product/${product.id}/ai-edit?from=simulation`}
          onClick={() => saveSimulationContext(product.id, personas)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white hover:bg-green-600">
          <Bot className="size-4" />Sonuçlara Göre AI ile Düzenle<ArrowRight className="size-4" />
        </Link>
        <Link href="/seller/products"
          className="flex items-center justify-center rounded-xl border border-border px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted">
          Ürünlere Dön
        </Link>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function SellerSimulation({ product }: { product: SellerProductPerformance }) {
  const [personas,   setPersonas]   = useState<SyntheticPersona[]>([]);
  const [totalPersonas, setTotalPersonas] = useState(MAX_PERSONAS);
  const [streamDone, setStreamDone] = useState(false);
  const [streamStep, setStreamStep] = useState<string | null>("Simülasyon başlatılıyor...");
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
        // Extract total count from message like "5 profil hazır..."
        const match = event.message.match(/^(\d+) profil/);
        if (match) setTotalPersonas(Number(match[1]));
      } else if (event.type === "persona") {
        const p = event.persona;
        setPersonas((prev) => [
          ...prev,
          {
            id: p.id, name: p.name, age: p.age, city: p.city,
            segment: p.segment, profile: p.profile, caresAbout: p.caresAbout,
            decision: p.decision as "buy" | "skip" | "undecided",
            reason: p.reason, lookedAt: p.lookedAt,
            recommendation: p.recommendation, monologue: p.monologue,
          },
        ]);
        setLoading(false);
      } else if (event.type === "done") {
        setStreamDone(true);
        setStreamStep(null);
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
      setStreamDone(true);
    });
  }, [product.id]);

  // looking → deciding: start timer only when current persona has arrived
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
        // Next persona already arrived
        setActiveStep((s) => s + 1);
        setPhase("looking");
      } else if (streamDone) {
        // No more personas coming
        setCompleted(true);
      }
      // else: next persona not arrived yet — stay "deciding", effect re-runs when personas changes
    }, STEP_DECIDING_MS);
    return () => clearTimeout(t);
  }, [phase, activeStep, completed, personas, streamDone]);

  // Loading state — before any persona arrives
  if (loading && personas.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
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

  if (completed) return <SimulationCompleted product={product} personas={personas} />;

  return (
    <SimulationRunning
      product={product}
      personas={personas}
      totalPersonas={totalPersonas}
      activeStep={activeStep}
      phase={phase}
      streamStep={streamStep}
    />
  );
}
