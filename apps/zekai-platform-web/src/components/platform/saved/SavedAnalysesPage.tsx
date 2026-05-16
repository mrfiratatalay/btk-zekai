"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BookmarkCheck,
  ChevronDown,
  GitCompare,
  ShieldCheck,
  Trash2,
  XCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getSavedAnalyses,
  deleteAnalysis,
  updateAnalysisStatus,
  updateAnalysisNote,
  addToCompareQueue,
  getCompareQueue,
  STATUS_OPTIONS,
  STATUS_LABELS,
} from "@/lib/buyer-store";
import { notifyStoreUpdate } from "@/components/platform/PlatformNav";
import type { SavedAnalysis, SavedAnalysisStatus } from "@/types/analysis";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { Button } from "@/components/ui/button";

/* ─── Recommendation level config ───────────────────────────────────────── */
const LEVEL = {
  safe: {
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: ShieldCheck,
    label: "Güvenli",
  },
  caution: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: AlertTriangle,
    label: "Dikkat",
  },
  risky: {
    chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot: "bg-red-500",
    icon: XCircle,
    label: "Riskli",
  },
} as const;

type FilterStatus = "all" | SavedAnalysisStatus;

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Tümü" },
  ...STATUS_OPTIONS,
];

/* ─── Status Dropdown ─────────────────────────────────────────────────────── */
function StatusDropdown({
  id,
  current,
  onChange,
}: {
  id: string;
  current: SavedAnalysisStatus;
  onChange: (s: SavedAnalysisStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-1.5 rounded-full border border-border/50 bg-background/90 backdrop-blur-md px-3 text-[11px] font-bold text-foreground hover:bg-background transition-colors shadow-sm"
      >
        {STATUS_LABELS[current]}
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-20 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-xs hover:bg-muted transition-colors",
                  current === opt.value ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {current === opt.value && <Check className="size-3 text-[#5a8a00] dark:text-[#adff41]" />}
                {current !== opt.value && <span className="size-3" />}
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Analysis Card ──────────────────────────────────────────────────────── */
function SavedAnalysisCard({
  analysis,
  index,
  inCompare,
  onStatusChange,
  onDelete,
  onAddToCompare,
}: {
  analysis: SavedAnalysis;
  index: number;
  inCompare: boolean;
  onStatusChange: (id: string, s: SavedAnalysisStatus) => void;
  onDelete: (id: string) => void;
  onAddToCompare: (id: string) => void;
}) {
  const lv = LEVEL[analysis.recommendationLevel];
  const Icon = lv.icon;
  const [note, setNote] = useState(analysis.userNote ?? "");
  const [editingNote, setEditingNote] = useState(false);

  function saveNote() {
    updateAnalysisNote(analysis.id, note);
    notifyStoreUpdate();
    setEditingNote(false);
    toast.success("Not kaydedildi.");
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-[#adff41]/5 transition-all"
    >
      {/* Top Badges */}
      <div className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-sm border border-border/50">
        <Icon className={cn("size-4", lv.chip.split(" ")[1])} />
      </div>

      <div className="absolute top-4 left-4 z-20">
        <StatusDropdown
          id={analysis.id}
          current={analysis.status}
          onChange={(s) => onStatusChange(analysis.id, s)}
        />
      </div>

      {/* Image Area */}
      <div className="relative h-48 w-full bg-muted/20 p-4 border-b border-border/30">
        <Image
          src={analysis.productImage}
          alt={analysis.productTitle}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/platform/analysis/${analysis.id}`}
          className="mb-2 line-clamp-2 text-base font-bold text-foreground hover:text-[#5a8a00] dark:hover:text-[#adff41] transition-colors leading-tight"
        >
          {analysis.productTitle}
        </Link>

        <div className="mb-5 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-foreground">{analysis.productPrice}</span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold", lv.chip)}>
            <span className={cn("size-1.5 rounded-full", lv.dot)} />
            {lv.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
          <button
            onClick={() => onAddToCompare(analysis.id)}
            disabled={inCompare}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-[11px] font-bold transition-all",
              inCompare
                ? "border-amber-300/50 bg-amber-50/50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 cursor-default"
                : "border-border bg-background text-foreground hover:bg-muted hover:border-border/80"
            )}
          >
            {inCompare ? <Check className="size-3.5" /> : <GitCompare className="size-3.5" />}
            {inCompare ? "Kuyrukta" : "Karşılaştır"}
          </button>
          
          <button
            onClick={() => setEditingNote((e) => !e)}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-[11px] font-bold transition-all",
              note 
                ? "border-[#adff41]/50 bg-[#adff41]/10 text-[#5a8a00] dark:text-[#adff41]" 
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {note ? "Notu Gör" : "+ Not Ekle"}
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(analysis.id)}
          className="absolute bottom-5 right-5 flex size-8 items-center justify-center rounded-full bg-background border border-border text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition-all shadow-sm"
          aria-label="Sil"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Note editor */}
      <AnimatePresence>
        {editingNote && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden rounded-b-2xl border-t border-border"
          >
            <div className="p-4 space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Bu ürün hakkında özel notun..."
                className="w-full resize-none rounded-xl border border-border/50 bg-background px-4 py-3 text-sm text-foreground shadow-inner outline-none placeholder:text-muted-foreground/50 focus:border-[#adff41]/50 transition-all"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingNote(false)}
                  className="rounded-xl px-4 text-xs"
                >
                  İptal
                </Button>
                <Button
                  size="sm"
                  onClick={saveNote}
                  className="rounded-xl bg-foreground px-5 text-xs font-bold text-background hover:bg-foreground/90"
                >
                  Kaydet
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export function SavedAnalysesPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [compareQueue, setCompareQueue] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAnalyses(getSavedAnalyses());
    setCompareQueue(getCompareQueue());
    setMounted(true);

    function refresh() {
      setAnalyses(getSavedAnalyses());
      setCompareQueue(getCompareQueue());
    }
    window.addEventListener("zekai-store-update", refresh);
    return () => window.removeEventListener("zekai-store-update", refresh);
  }, []);

  function handleStatusChange(id: string, status: SavedAnalysisStatus) {
    updateAnalysisStatus(id, status);
    setAnalyses(getSavedAnalyses());
    notifyStoreUpdate();
  }

  function handleDelete(id: string) {
    deleteAnalysis(id);
    setAnalyses(getSavedAnalyses());
    setCompareQueue(getCompareQueue());
    notifyStoreUpdate();
    toast.success("Analiz silindi.");
  }

  function handleAddToCompare(id: string) {
    const ok = addToCompareQueue(id);
    if (ok) {
      setCompareQueue(getCompareQueue());
      notifyStoreUpdate();
      toast.success("Karşılaştırma kuyruğuna eklendi!", {
        action: {
          label: "Karşılaştır →",
          onClick: () => (window.location.href = "/platform/compare"),
        },
      });
    } else {
      toast.error("Kuyruk dolu (maks 3 ürün).");
    }
  }

  const filtered =
    filter === "all" ? analyses : analyses.filter((a) => a.status === filter);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformNav />

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <BookmarkCheck className="size-8 text-[#5a8a00] dark:text-[#adff41]" />
              Karar Hafızası
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {analyses.length} analiz · {compareQueue.length} karşılaştırma kuyruğunda
            </p>
          </div>

          {compareQueue.length > 0 && (
            <Link href="/platform/compare">
              <Button
                size="sm"
                className="rounded-xl bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30]"
              >
                <GitCompare className="mr-1.5 size-3.5" />
                Karşılaştır ({compareQueue.length})
              </Button>
            </Link>
          )}
        </div>

        {/* Filter bar (Segmented Control) */}
        <div className="mb-8 flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-2xl w-fit border border-border/50">
          {FILTER_OPTIONS.map((opt) => {
            const count =
              opt.value === "all"
                ? analyses.length
                : analyses.filter((a) => a.status === opt.value).length;
            if (count === 0 && opt.value !== "all") return null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  filter === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {opt.label}
                <span className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  filter === opt.value ? "bg-muted text-foreground" : "bg-border text-muted-foreground"
                )}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
            <BookmarkCheck className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "Henüz kaydedilen analiz yok."
                : `"${STATUS_LABELS[filter as SavedAnalysisStatus]}" durumunda ürün yok.`}
            </p>
            {filter === "all" && (
              <Link
                href="/platform"
                className="mt-4 inline-flex items-center gap-1 text-xs text-[#5a8a00] dark:text-[#adff41] hover:underline"
              >
                Dashboard'a dön →
              </Link>
            )}
          </div>
        )}

        {/* Analysis cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((analysis, index) => (
              <SavedAnalysisCard
                key={analysis.id}
                analysis={analysis}
                index={index}
                inCompare={compareQueue.includes(analysis.id)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onAddToCompare={handleAddToCompare}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
