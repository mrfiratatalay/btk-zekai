"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Sparkles, Target, ChevronRight, ChevronLeft, X } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useKombinStore } from "@/lib/kombin-store";
import { useAnalysesStore } from "@/lib/buyer-store";
import { inferBodyZone, formatPrice } from "@/lib/kombin-utils";
import { runKombinAnalyzeStream } from "@/lib/api/kombin";
import type { BodyZone, KombinProduct } from "@/types/kombin";

const Figure3D = dynamic(
  () => import("./Figure3D").then((m) => ({ default: m.Figure3D })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#080808]" /> },
);

const AGENT_LABELS: Record<string, string> = {
  goal_parser: "Hedef Analizi",
  product_fit: "Ürün Uyumu",
  synergy:     "Sinerji",
  budget:      "Bütçe",
  synthesizer: "Sentez",
};

// 2D overlay positions for each body zone — tuned for RPM avatar + camera [0,0.9,3.2] fov=42
const ZONE_OVERLAY: Record<BodyZone, { top: string; left: string; side: "left" | "right" | "center" }> = {
  head:   { top: "8%",   left: "50%",  side: "center" },
  torso:  { top: "35%",  left: "76%",  side: "right"  },
  wrist:  { top: "48%",  left: "82%",  side: "right"  },
  hands:  { top: "52%",  left: "18%",  side: "left"   },
  back:   { top: "38%",  left: "18%",  side: "left"   },
  feet:   { top: "82%",  left: "50%",  side: "center" },
};

const ZONE_LABEL: Record<BodyZone, string> = {
  head: "Baş", torso: "Gövde", wrist: "Bilek", hands: "El", back: "Sırt", feet: "Ayak",
};

// ── Product selector bottom sheet ─────────────────────────────────────────────
function ProductSelector({
  onAdd,
  onClose,
  addedIds,
}: {
  onAdd: (p: KombinProduct) => void;
  onClose: () => void;
  addedIds: Set<string>;
}) {
  const analyses = useAnalysesStore((s) => s.analyses);
  const [search, setSearch] = useState("");

  const filtered = analyses.filter(
    (a) =>
      !addedIds.has(a.productId) &&
      (search === "" || a.productTitle.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-2xl border-t border-border bg-card p-4 pb-8 max-h-[72vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between shrink-0">
          <h3 className="font-black text-foreground">Ürün Seç</h3>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 hover:bg-muted">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        <input
          type="text"
          autoFocus
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full shrink-0 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm focus:outline-none focus:border-[#adff41]/60"
        />
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {analyses.length === 0
                ? "Önce bir ürün analizi kaydet."
                : "Eşleşen ürün bulunamadı."}
            </p>
          ) : (
            filtered.map((a) => (
              <div
                key={a.productId}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:border-[#adff41]/30 transition-colors"
                onClick={() => {
                  onAdd({
                    id: a.productId,
                    title: a.productTitle,
                    category: a.productTitle,
                    price: parseFloat(a.productPrice.replace(/[^\d]/g, "")) || 0,
                    image: a.productImage,
                    bodyZone: inferBodyZone(a.productTitle),
                    analysisId: a.id,
                  });
                }}
              >
                <img
                  src={a.productImage}
                  alt={a.productTitle}
                  className="size-12 rounded-lg object-cover bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{a.productTitle}</p>
                  <p className="text-xs font-bold text-[#adff41]">{a.productPrice}</p>
                </div>
                <Plus className="size-4 shrink-0 text-[#adff41]" />
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Step2Place component ─────────────────────────────────────────────────
export function Step2Place({ fullscreen = false }: { fullscreen?: boolean }) {
  const {
    goal, products, addProduct, removeProduct,
    liveScores, setLiveScores, setIsAnalyzing, isAnalyzing,
    setAnalysisResult, nextStep, prevStep,
  } = useKombinStore();

  const [showSelector, setShowSelector] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addedIds = new Set(products.map((p) => p.id));
  const activeZones = products.map((p) => p.bodyZone).filter((z): z is BodyZone => !!z);
  const totalPrice = products.reduce((s, p) => s + p.price, 0);
  const canAnalyze = products.length >= 1;

  async function handleAnalyze() {
    if (!canAnalyze || isAnalyzing) return;
    setError(null);
    setIsAnalyzing(true);
    try {
      await runKombinAnalyzeStream(
        {
          goal: goal.goalText,
          budget: goal.budget,
          useCases: goal.useCases,
          priorities: goal.priorities,
          style: goal.style,
          products: products.map((p) => ({
            id: p.id, title: p.title, category: p.category,
            price: p.price, imageUrl: p.image,
          })),
        },
        {
          onAgentStep: (author) => setActiveAgent(author),
          onLiveScores: (scores) => setLiveScores(scores),
          onResult: (result) => { setAnalysisResult(result); nextStep(); },
          onError: (err) => { setError(err); setIsAnalyzing(false); },
        },
      );
    } catch (err) {
      setError(String(err));
      setIsAnalyzing(false);
    }
  }

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#080808] lg:flex-row">

        {/* ── LEFT: 3D Figure — fixed height on mobile, fills width on desktop ── */}
        <div className="relative w-full overflow-hidden bg-[#080808] h-[42vh] flex-shrink-0 lg:h-auto lg:flex-1">
          {/* Back button (desktop) */}
          <button
            onClick={() => prevStep()}
            className="cursor-pointer absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="size-4" />
            Geri
          </button>

          {/* Title overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
            <h1 className="text-base font-black text-white">Kombin Danışmanı</h1>
            <p className="flex items-center justify-center gap-1.5 text-xs text-white/50">
              <span className="size-1.5 rounded-full bg-[#adff41] inline-block" />
              Alıcı Modülü
            </p>
          </div>

          {/* Step indicator */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
            {[
              { n: 1, label: "Amaç" },
              { n: 2, label: "Yerleştir" },
              { n: 3, label: "Analiz" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-1">
                <div className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                  s.n === 2 ? "bg-[#adff41] text-[#1a2e00]" : "border border-white/20 text-white/40",
                )}>
                  <span className={cn(
                    "flex size-3.5 items-center justify-center rounded-full text-[9px] font-black",
                    s.n === 2 ? "bg-[#1a2e00] text-[#adff41]" : "border border-current",
                  )}>{s.n}</span>
                  {s.label}
                </div>
                {i < 2 && <div className="h-px w-2 bg-white/15" />}
              </div>
            ))}
          </div>

          {/* 3D Canvas — full height */}
          <Figure3D
            activeZones={activeZones}
            className="absolute inset-0 w-full h-full"
          />

          {/* Product zone badges — overlay on the figure */}
          <AnimatePresence>
            {products.map((p) => {
              const zone = p.bodyZone;
              if (!zone) return null;
              const pos = ZONE_OVERLAY[zone];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="absolute z-30 flex items-center gap-2 rounded-xl border border-[#adff41]/50 bg-black/75 backdrop-blur-md px-2.5 py-1.5 shadow-[0_0_12px_rgba(173,255,65,0.25)]"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform:
                      pos.side === "center"
                        ? "translateX(-50%)"
                        : pos.side === "left"
                          ? "translateX(0)"
                          : "translateX(-100%)",
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="size-8 rounded-lg object-cover bg-muted/40 shrink-0 ring-1 ring-[#adff41]/30"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#adff41] leading-none mb-0.5">{ZONE_LABEL[zone]}</p>
                    <p className="text-xs font-semibold text-white/90 max-w-[90px] truncate">{p.title}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Goal summary — bottom left */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-xl border border-white/10 bg-black/60 backdrop-blur-md px-4 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="size-4 shrink-0 text-[#adff41]" />
              <p className="truncate text-xs text-white/80 font-medium">{goal.goalText}</p>
            </div>
            <span className="shrink-0 ml-3 text-sm font-black text-[#adff41]">{formatPrice(goal.budget)}</span>
          </div>
        </div>

        {/* ── RIGHT: Panel — fills remaining viewport height on mobile, fixed width on desktop ── */}
        <div className="flex flex-1 flex-col overflow-y-auto border-t border-border/60 bg-background lg:flex-none lg:w-[420px] xl:w-[480px] lg:border-t-0 lg:border-l">
          <div className="flex-1 p-5 space-y-4">

            {/* Products list */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Eklenen Ürünler ({products.length})
                </p>
                <button
                  onClick={() => setShowSelector(true)}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-[#adff41]/50 bg-[#adff41]/10 px-3 py-1.5 text-xs font-bold text-[#adff41] hover:bg-[#adff41]/20 transition-colors"
                >
                  <Plus className="size-3.5" />
                  Ürün Ekle
                </button>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-muted-foreground">
                  <p className="text-sm">Henüz ürün eklenmedi</p>
                  <p className="text-xs mt-1">Ürün ekleyerek analizi başlatabilirsin</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
                    >
                      <img src={p.image} alt={p.title} className="size-11 rounded-lg object-cover bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                        <p className="text-xs font-bold text-[#adff41]">{formatPrice(p.price)}</p>
                      </div>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget bar */}
            {products.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Toplam</span>
                  <span className={cn(
                    "text-sm font-black",
                    totalPrice > goal.budget ? "text-red-400" : "text-[#adff41]",
                  )}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      totalPrice > goal.budget ? "bg-red-400" : "bg-[#adff41]",
                    )}
                    style={{ width: `${Math.min(100, (totalPrice / goal.budget) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">0</span>
                  <span className="text-[10px] text-muted-foreground">Bütçe: {formatPrice(goal.budget)}</span>
                </div>
              </div>
            )}

            {/* Live scores during analysis */}
            <AnimatePresence>
              {isAnalyzing && liveScores && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-[#adff41]/30 bg-[#adff41]/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#adff41] flex items-center gap-1.5">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="inline-block"
                      >
                        ✦
                      </motion.span>
                      {activeAgent ? (AGENT_LABELS[activeAgent] ?? activeAgent) : "Analiz"} yapılıyor...
                    </p>
                    <span className="text-2xl font-black text-[#adff41]">{liveScores.overall}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "İhtiyaç", val: liveScores.needFit },
                      { label: "Parça", val: liveScores.partFit },
                      { label: "Bütçe", val: liveScores.budgetBalance },
                      { label: "Risk", val: liveScores.risk },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-bold text-foreground">{val}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Sticky bottom CTA */}
          <div className="sticky bottom-0 border-t border-border/60 bg-background/95 backdrop-blur-xl p-4">
            <button
              type="button"
              disabled={!canAnalyze || isAnalyzing}
              onClick={handleAnalyze}
              className={cn(
                "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-base font-black transition-all",
                canAnalyze && !isAnalyzing
                  ? "bg-[#adff41] text-[#1a2e00] hover:bg-[#9ee833] active:scale-[0.98]"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              {isAnalyzing ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles className="size-5" />
                  </motion.div>
                  Analiz ediliyor...
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  ZekAI Analizini Çalıştır
                  <ChevronRight className="size-5" />
                </>
              )}
            </button>
            {products.length === 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                En az 1 ürün ekle
              </p>
            )}
          </div>
        </div>

      {/* Product selector */}
      <AnimatePresence>
        {showSelector && (
          <ProductSelector
            onAdd={(p) => {
              const zone = inferBodyZone(p.category || p.title);
              addProduct({ ...p, bodyZone: zone });
              setShowSelector(false);
            }}
            onClose={() => setShowSelector(false)}
            addedIds={addedIds}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
