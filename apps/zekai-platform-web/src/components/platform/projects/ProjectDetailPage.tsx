"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  GitCompare,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getProjectById,
  syncProjectsFromApi,
  getSavedAnalyses,
  deleteProject,
  addAnalysisToProject,
  removeAnalysisFromProject,
  addToCompareQueue,
  clearCompareQueue,
} from "@/lib/buyer-store";
import { notifyStoreUpdate } from "@/components/platform/PlatformNav";
import { compareAnalyses } from "@/lib/compare-engine";
import type { ShoppingProject, SavedAnalysis } from "@/types/analysis";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

/* ─── Level config ───────────────────────────────────────────────────────── */
const LEVEL = {
  safe: { label: "Güvenli", chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", icon: ShieldCheck },
  caution: { label: "Dikkat", chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400", icon: AlertTriangle },
  risky: { label: "Riskli", chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", icon: XCircle },
} as const;

/* ─── Add Analysis Modal ─────────────────────────────────────────────────── */
function AddAnalysisModal({
  projectId,
  existingIds,
  allAnalyses,
  onClose,
  onAdd,
}: {
  projectId: string;
  existingIds: string[];
  allAnalyses: SavedAnalysis[];
  onClose: () => void;
  onAdd: () => void;
}) {
  const available = allAnalyses.filter((a) => !existingIds.includes(a.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Ürün Ekle</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {available.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Eklenebilecek kayıtlı analiz yok.</p>
            <Link
              href="/platform"
              onClick={onClose}
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#5a8a00] dark:text-[#adff41] hover:underline"
            >
              Yeni analiz yap →
            </Link>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {available.map((a) => {
              const lv = LEVEL[a.recommendationLevel];
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    addAnalysisToProject(projectId, a.id);
                    notifyStoreUpdate();
                    onAdd();
                    onClose();
                    toast.success("Ürün Karar Odasına eklendi.");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 text-left hover:bg-muted transition-colors"
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image src={a.productImage} alt={a.productTitle} fill sizes="40px" className="object-contain p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{a.productTitle}</p>
                    <span className={cn("mt-0.5 inline-flex rounded-full px-1.5 text-[10px] font-semibold", lv.chip)}>
                      %{a.overallRiskPercent} · {lv.label}
                    </span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/40" />
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Project Analysis Row ───────────────────────────────────────────────── */
function AnalysisRow({
  analysis,
  isWinner,
  projectId,
  onRemove,
}: {
  analysis: SavedAnalysis;
  isWinner: boolean;
  projectId: string;
  onRemove: () => void;
}) {
  const lv = LEVEL[analysis.recommendationLevel];
  const Icon = lv.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 transition-all",
        isWinner
          ? "border-[#adff41]/40 bg-[#adff41]/5"
          : analysis.recommendationLevel === "risky"
          ? "border-red-200 bg-red-50/30 dark:border-red-500/20 dark:bg-red-500/5"
          : "border-border bg-card"
      )}
    >
      {isWinner && (
        <Star className="size-4 shrink-0 text-[#5a8a00] dark:text-[#adff41]" />
      )}
      {!isWinner && analysis.recommendationLevel === "risky" && (
        <Icon className="size-4 shrink-0 text-red-500" />
      )}
      {!isWinner && analysis.recommendationLevel !== "risky" && (
        <div className="size-4" />
      )}

      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
        <Image src={analysis.productImage} alt={analysis.productTitle} fill sizes="40px" className="object-contain p-1" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{analysis.productTitle}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold", lv.chip)}>
            {lv.label}
          </span>
          <span className="text-[11px] text-muted-foreground">%{analysis.overallRiskPercent} risk</span>
          <span className="text-[10px] text-muted-foreground/50">{analysis.productPrice}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href={`/platform/analysis/${analysis.id}`}
          className="rounded-lg border border-[#adff41]/30 bg-[#adff41]/10 px-2.5 py-1 text-[10px] font-semibold text-[#5a8a00] dark:text-[#adff41] hover:bg-[#adff41]/20 transition-colors"
        >
          Rapor →
        </Link>
        <button
          onClick={onRemove}
          className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
          aria-label="Çıkar"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Detail Page ───────────────────────────────────────────────────── */
export function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ShoppingProject | null>(null);
  const [allAnalyses, setAllAnalyses] = useState<SavedAnalysis[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getProjectById(projectId);
    if (!p) { router.push("/platform/projects"); return; }
    setProject(p);
    setAllAnalyses(getSavedAnalyses());
    setMounted(true);
    syncProjectsFromApi()
      .then(() => {
        const synced = getProjectById(projectId);
        if (synced) setProject(synced);
      })
      .catch(() => {});

    function refresh() {
      const p2 = getProjectById(projectId);
      if (p2) setProject(p2);
      setAllAnalyses(getSavedAnalyses());
    }
    window.addEventListener("zekai-store-update", refresh);
    return () => window.removeEventListener("zekai-store-update", refresh);
  }, [projectId, router]);

  function handleDelete() {
    if (!project) return;
    deleteProject(project.id);
    notifyStoreUpdate();
    toast.success("Karar Odası silindi.");
    router.push("/platform/projects");
  }

  function handleRemoveAnalysis(analysisId: string) {
    if (!project) return;
    removeAnalysisFromProject(project.id, analysisId);
    notifyStoreUpdate();
    setProject(getProjectById(projectId) ?? null);
    toast.success("Ürün Karar Odasından çıkarıldı.");
  }

  function handleCompareAll() {
    if (!project || projectAnalyses.length < 2) return;
    clearCompareQueue();
    const toAdd = projectAnalyses.slice(0, 3);
    toAdd.forEach((a) => addToCompareQueue(a.id));
    notifyStoreUpdate();
    
    if (projectAnalyses.length > 3) {
      toast.info("En fazla 3 ürün karşılaştırılabildiği için ilk 3 ürün eklendi.");
    }
    router.push("/platform/compare");
  }

  if (!mounted || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border" />
      </div>
    );
  }

  const projectAnalyses = project.savedAnalysisIds
    .map((id) => allAnalyses.find((a) => a.id === id))
    .filter(Boolean) as SavedAnalysis[];

  const compareResult =
    projectAnalyses.length >= 2 ? compareAnalyses(projectAnalyses) : null;

  const winner = compareResult
    ? projectAnalyses.find((a) => a.id === compareResult.winnerId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showAddModal && (
          <AddAnalysisModal
            projectId={project.id}
            existingIds={project.savedAnalysisIds}
            allAnalyses={allAnalyses}
            onClose={() => setShowAddModal(false)}
            onAdd={() => setProject(getProjectById(projectId) ?? null)}
          />
        )}
      </AnimatePresence>

      <PlatformNav />

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {/* Back */}
        <Link
          href="/platform/projects"
          className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Karar Odaları
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="size-5 text-[#5a8a00] dark:text-[#adff41]" />
              <h1 className="text-xl font-black text-foreground">{project.title}</h1>
            </div>
            {project.goal && (
              <p className="mt-1 text-sm text-muted-foreground">{project.goal}</p>
            )}
            <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {project.budget && (
                <span className="rounded-full bg-muted px-2 py-0.5">Bütçe: {formatPrice(project.budget)}</span>
              )}
              <span>{projectAnalyses.length} ürün</span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 transition-colors"
          >
            Odayı Sil
          </button>
        </div>

        {/* Zekai Öneri Banner */}
        {compareResult && winner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border border-[#adff41]/40 bg-[#adff41]/8"
          >
            <div className="flex items-start gap-3 p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#adff41]/20 border border-[#adff41]/30">
                <Zap className="size-5 text-[#5a8a00] dark:text-[#adff41]" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Zekai&apos;nin Önerisi</p>
                <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                  {compareResult.reasoning}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            Ürünler ({projectAnalyses.length})
          </h2>
          <div className="flex gap-2">
            {projectAnalyses.length >= 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCompareAll}
                className="rounded-xl text-xs"
              >
                <GitCompare className="mr-1.5 size-3.5" />
                Hepsini Karşılaştır
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="rounded-xl bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] text-xs"
            >
              <Plus className="mr-1 size-3.5" />
              Ürün Ekle
            </Button>
          </div>
        </div>

        {projectAnalyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground">Henüz ürün eklenmedi.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#5a8a00] dark:text-[#adff41] hover:underline"
            >
              <Plus className="size-3.5" />
              Ürün Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projectAnalyses.map((analysis) => (
              <AnalysisRow
                key={analysis.id}
                analysis={analysis}
                isWinner={winner?.id === analysis.id}
                projectId={project.id}
                onRemove={() => handleRemoveAnalysis(analysis.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
