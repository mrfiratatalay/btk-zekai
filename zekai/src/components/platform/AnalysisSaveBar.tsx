"use client";

/**
 * AnalysisSaveBar
 *
 * Analiz raporu sayfasının alt sticky barına eklenir.
 * Raporu kaydet / Karşılaştırmaya ekle / Karar Odasına ekle
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  FolderOpen,
  GitCompare,
  Plus,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getSavedAnalyses,
  saveAnalysis,
  isAnalysisSaved,
  addToCompareQueue,
  getCompareQueue,
  getProjects,
  createProject,
  addAnalysisToProject,
} from "@/lib/buyer-store";
import { notifyStoreUpdate } from "@/components/platform/PlatformNav";
import { formatPrice } from "@/lib/mock-data/products";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";

interface AnalysisSaveBarProps {
  analysis: BuyerAnalysis;
  product: Product;
}

export function AnalysisSaveBar({ analysis, product }: AnalysisSaveBarProps) {
  const [saved, setSaved] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isAnalysisSaved(analysis.analysisId));
    setInCompare(getCompareQueue().includes(analysis.analysisId));
  }, [analysis.analysisId]);

  function handleSave() {
    const toSave = {
      id: analysis.analysisId,
      productId: analysis.productId,
      productTitle: product.title,
      productImage: product.image,
      productPrice: formatPrice(product.price),
      sellerName: product.sellerName,
      userNeedText: analysis.userNeedText,
      overallRiskPercent: analysis.overallRiskPercent,
      recommendationLevel: analysis.recommendationLevel,
      scores: analysis.scores,
      savedAt: new Date().toISOString(),
      status: "thinking" as const,
    };
    saveAnalysis(toSave);
    setSaved(true);
    notifyStoreUpdate();
    toast.success("Rapor kaydedildi!", {
      description: "Kaydedilenler sayfasında bulabilirsin.",
      action: { label: "Gör →", onClick: () => (window.location.href = "/platform/saved") },
    });
  }

  function handleCompare() {
    if (!saved) handleSave();
    const ok = addToCompareQueue(analysis.analysisId);
    if (ok) {
      setInCompare(true);
      notifyStoreUpdate();
      toast.success("Karşılaştırma kuyruğuna eklendi!", {
        description: "En fazla 3 ürün karşılaştırabilirsin.",
        action: { label: "Karşılaştır →", onClick: () => (window.location.href = "/platform/compare") },
      });
    } else {
      toast.error("Kuyruk dolu!", {
        description: "Karşılaştırma sayfasında ürün çıkarıp tekrar dene.",
      });
    }
  }

  function handleProjectAdd() {
    if (!saved) handleSave();
    setShowProjectModal(true);
  }

  if (!mounted) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Kaydet */}
        <Button
          size="sm"
          variant={saved ? "outline" : "default"}
          className={
            saved
              ? "rounded-full h-12 px-4 sm:px-5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-bold transition-all"
              : "rounded-full h-12 px-4 sm:px-5 bg-[#ADFF41] font-bold text-[#0a0a0f] hover:bg-[#9AE635] shadow-sm shadow-[#adff41]/20 transition-all hover:scale-105"
          }
          onClick={saved ? undefined : handleSave}
        >
          {saved ? (
            <>
              <BookmarkCheck className="mr-1.5 size-3.5" />
              Kaydedildi
            </>
          ) : (
            <>
              <Bookmark className="mr-1.5 size-3.5" />
              Kaydet
            </>
          )}
        </Button>

        {/* Karşılaştırmaya ekle */}
        <Button
          size="sm"
          variant="outline"
          className={
            inCompare
              ? "rounded-full h-12 px-4 sm:px-5 border-amber-400/40 text-amber-600 dark:text-amber-400 font-bold transition-all"
              : "rounded-full h-12 px-4 sm:px-5 border-border font-bold text-foreground hover:bg-muted transition-all"
          }
          onClick={inCompare ? undefined : handleCompare}
        >
          {inCompare ? (
            <>
              <Check className="mr-1.5 size-3.5" />
              Kuyrukta
            </>
          ) : (
            <>
              <GitCompare className="mr-1.5 size-3.5" />
              Karşılaştır
            </>
          )}
        </Button>

        {/* Karar Odasına ekle */}
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-12 px-4 sm:px-5 border-border font-bold text-foreground hover:bg-muted transition-all"
          onClick={handleProjectAdd}
        >
          <FolderOpen className="mr-1.5 size-3.5" />
          <span className="hidden sm:inline">Karar Odası</span>
          <span className="sm:hidden">Oda</span>
        </Button>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <ProjectSelectModal
            analysisId={analysis.analysisId}
            onClose={() => setShowProjectModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Project Select/Create Modal ─────────────────────────────────────────── */
function ProjectSelectModal({
  analysisId,
  onClose,
}: {
  analysisId: string;
  onClose: () => void;
}) {
  const projects = getProjects();
  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [creating, setCreating] = useState(projects.length === 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleAdd(projectId: string) {
    addAnalysisToProject(projectId, analysisId);
    notifyStoreUpdate();
    toast.success("Karar Odasına eklendi!");
    onClose();
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    const p = createProject({ title: newTitle.trim(), goal: newGoal.trim() });
    addAnalysisToProject(p.id, analysisId);
    notifyStoreUpdate();
    toast.success("Karar Odası oluşturuldu ve ürün eklendi!");
    onClose();
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Karar Odasına Ekle</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">
            ✕
          </button>
        </div>

        {!creating && projects.length > 0 && (
          <>
            <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto pr-1">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAdd(p.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-left hover:bg-muted transition-colors"
                >
                  <FolderOpen className="size-4 shrink-0 text-[#5a8a00] dark:text-[#adff41]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.savedAnalysisIds.length} ürün</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs text-muted-foreground hover:border-[#adff41]/40 hover:text-[#5a8a00] dark:hover:text-[#adff41] transition-colors"
            >
              <Plus className="size-3.5" />
              Yeni Karar Odası Oluştur
            </button>
          </>
        )}

        {creating && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Karar Odası Adı *
              </label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Örn: Yeni Laptop Alacağım"
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none focus:border-[#adff41]/40 transition-all"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Amaç / Bütçe (opsiyonel)
              </label>
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Örn: Yazılım + okul, max 30.000 TL"
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none focus:border-[#adff41]/40 transition-all"
              />
            </div>
            <div className="flex gap-2 pt-1">
              {projects.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCreating(false)}
                  className="flex-1"
                >
                  Geri
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="flex-1 bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] rounded-xl disabled:opacity-50"
              >
                Oluştur ve Ekle
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
