"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  FolderOpen,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProjectsStore,
  useAnalysesStore,
} from "@/lib/buyer-store";
import type { ShoppingProject, SavedAnalysis } from "@/types/analysis";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

/* ─── Create Project Modal ────────────────────────────────────────────────── */
function CreateProjectModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (p: ShoppingProject) => void;
}) {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    const createProjectFn = useProjectsStore.getState().createProject;
    const projectData = {
      title: title.trim(),
      goal: goal.trim(),
      budget: budget ? parseInt(budget.replace(/\D/g, ""), 10) : undefined,
    };
    createProjectFn(projectData).then((p) => {
      onCreate(p);
      toast.success("Karar Odası oluşturuldu!");
    }).catch(() => { toast.error("Oluşturulamadı."); });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4"
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
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Yeni Karar Odası</h3>
          <button onClick={onClose} className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Başlık *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Yeni Laptop Alacağım"
              maxLength={60}
              className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none focus:border-[#adff41]/40 transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Amaç / Kullanım (opsiyonel)
            </label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Örn: Yazılım, okul, hafif oyun"
              className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none focus:border-[#adff41]/40 transition-all"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Bütçe (opsiyonel)
            </label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Örn: 30000"
              type="number"
              className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none focus:border-[#adff41]/40 transition-all"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!title.trim()}
              className="flex-1 bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] rounded-xl disabled:opacity-50"
            >
              <Plus className="mr-1.5 size-3.5" />
              Oluştur
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Project Card ────────────────────────────────────────────────────────── */
function ProjectCard({
  project,
  allAnalyses,
  onDelete,
}: {
  project: ShoppingProject;
  allAnalyses: SavedAnalysis[];
  onDelete: (id: string) => void;
}) {
  const analyses = project.savedAnalysisIds
    .map((id) => allAnalyses.find((a) => a.id === id))
    .filter(Boolean) as SavedAnalysis[];

  const best = analyses.length > 0
    ? analyses.sort((a, b) => a.overallRiskPercent - b.overallRiskPercent)[0]
    : null;

  const riskyCounts = analyses.filter((a) => a.recommendationLevel === "risky").length;

  const createdDate = new Date(project.createdAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className="group relative flex flex-col overflow-hidden rounded-[32px] border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-[#adff41]/5 transition-all"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted/40 border border-border shadow-sm group-hover:border-[#adff41]/50 transition-colors">
            <FolderOpen className="size-6 text-[#5a8a00] dark:text-[#adff41]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">{project.title}</h3>
            {project.goal && (
              <p className="mt-1 truncate text-sm text-muted-foreground">{project.goal}</p>
            )}
          </div>
          <button
            onClick={() => onDelete(project.id)}
            className="shrink-0 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
            aria-label="Sil"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {/* Info & Avatar Stack */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            {project.budget ? (
              <span>Bütçe: {formatPrice(project.budget)}</span>
            ) : (
              <span>{createdDate}</span>
            )}
            <span>{analyses.length} Aday Ürün</span>
          </div>
          
          {/* Avatar stack */}
          {analyses.length > 0 && (
            <div className="flex -space-x-3">
              {analyses.slice(0, 4).map((a, i) => (
                <div key={a.id} className="relative size-10 rounded-full border-2 border-background overflow-hidden bg-muted/50 shadow-sm" style={{ zIndex: 10 - i }}>
                  <Image src={a.productImage} alt={a.productTitle} fill sizes="40px" className="object-contain p-1 mix-blend-multiply dark:mix-blend-normal" />
                </div>
              ))}
              {analyses.length > 4 && (
                <div className="relative flex size-10 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold shadow-sm" style={{ zIndex: 1 }}>
                  +{analyses.length - 4}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mini stats */}
        {analyses.length > 0 && (
          <div className="mt-6">
            {best ? (
              <div className="rounded-2xl border border-[#adff41]/30 bg-gradient-to-r from-[#adff41]/10 to-transparent p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#5a8a00] dark:text-[#adff41]">⭐ En İyi Aday</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground line-clamp-1 pr-2">{best.productTitle}</p>
                  <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-[10px] font-bold shadow-sm">
                    %{best.overallRiskPercent} Risk
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-[74px]" /> // placeholder
            )}
          </div>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/50 bg-muted/10 px-6 py-4">
        {analyses.length === 0 ? (
          <p className="text-xs font-semibold text-muted-foreground/60">Henüz ürün eklenmedi</p>
        ) : (
          <div className="flex items-center gap-1.5">
            {riskyCounts > 0 ? (
              <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <span className="flex size-2 rounded-full bg-[#adff41]" />
            )}
            <p className="text-[11px] font-bold uppercase text-muted-foreground">
              {riskyCounts > 0 ? `${riskyCounts} riskli aday var` : "Güvenli Adaylar"}
            </p>
          </div>
        )}
        <Link
          href={`/platform/projects/${project.id}`}
          className="flex h-8 items-center rounded-full bg-background border border-border px-4 text-[11px] font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          İçine Gir
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export function ProjectsListPage() {
  const projects = useProjectsStore((s) => s.projects);
  const analyses = useAnalysesStore((s) => s.analyses);
  const loading = useProjectsStore((s) => s.loading);
  const deleteProjectFn = useProjectsStore((s) => s.deleteProject);
  const [showModal, setShowModal] = useState(false);

  function handleDelete(id: string) {
    deleteProjectFn(id);
    toast.success("Karar Odası silindi.");
  }

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border" />
        <div className="mx-auto max-w-3xl px-4 py-12 grid gap-4 sm:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={() => {}}
        />
      )}

      <PlatformNav />

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="mb-8 flex justify-end">
          <Button
            onClick={() => setShowModal(true)}
            className="h-10 rounded-xl bg-[#adff41] px-6 text-[#0a0a0f] font-bold hover:bg-[#9aef30] shadow-sm shadow-[#adff41]/20 transition-transform hover:scale-105"
          >
            <Plus className="mr-1.5 size-4" />
            Yeni Oda Oluştur
          </Button>
        </div>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="group relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-muted/50 to-background p-12 text-center hover:border-[#adff41]/30 transition-all max-w-lg mx-auto mt-12">
            <div className="absolute -right-10 -top-10 size-48 rounded-full bg-[#adff41]/10 blur-3xl group-hover:bg-[#adff41]/20 transition-colors" />
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-background border border-border text-foreground mb-6 shadow-sm relative z-10">
               <FolderOpen className="size-6" />
            </div>
            <h3 className="text-lg font-black text-foreground relative z-10">Henüz Oda Yok</h3>
            <p className="mt-2 text-sm text-muted-foreground/80 relative z-10">
              "Yeni Bilgisayar", "Ev İhtiyaçları" gibi odalar oluşturup analizleri içinde topla.
            </p>
          </div>
        )}

        {/* Project cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                allAnalyses={analyses}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
