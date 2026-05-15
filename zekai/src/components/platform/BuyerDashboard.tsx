"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookmarkCheck,
  FolderOpen,
  GitCompare,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Clock,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getBuyerProfile,
  getSavedAnalyses,
  getProjects,
  getCompareQueue,
  STATUS_LABELS,
} from "@/lib/buyer-store";
import type { BuyerProfile, SavedAnalysis, ShoppingProject } from "@/types/analysis";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { QuickAnalyzeBar } from "@/components/platform/QuickAnalyzeBar";
import { BuyerOnboarding } from "@/components/platform/BuyerOnboarding";

/* ─── Recommendation level helpers ──────────────────────────────────────── */
const LEVEL_CONFIG = {
  safe: {
    label: "Güvenli",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: ShieldCheck,
  },
  caution: {
    label: "Dikkat",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: AlertTriangle,
  },
  risky: {
    label: "Riskli",
    chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot: "bg-red-500",
    icon: XCircle,
  },
} as const;

/* ─── Analysis Card (Premium) ───────────────────────────────────────────── */
function AnalysisCard({ analysis }: { analysis: SavedAnalysis }) {
  const lv = LEVEL_CONFIG[analysis.recommendationLevel];
  const Icon = lv.icon;

  return (
    <Link href={`/platform/analysis/${analysis.id}`} className="block w-[240px] shrink-0 snap-start">
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-border/50 bg-card p-4 shadow-sm hover:shadow-xl hover:shadow-[#adff41]/10 transition-all"
        style={{ height: "280px" }}
      >
        <div className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50">
           <Icon className={cn("size-4", lv.chip.split(" ")[1])} />
        </div>
        
        <div className="relative h-32 w-full rounded-2xl bg-muted/30 p-2 mb-3">
          <Image src={analysis.productImage} alt={analysis.productTitle} fill sizes="200px" className="object-contain p-2" />
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-snug">{analysis.productTitle}</h3>
          
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
            <span className="text-sm font-black text-foreground">{analysis.productPrice}</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold", lv.chip)}>
              {lv.label}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Project Card (compact) ────────────────────────────────────────────── */
function ProjectCard({
  project,
  analysisCount,
  bestTitle,
}: {
  project: ShoppingProject;
  analysisCount: number;
  bestTitle?: string;
}) {
  return (
    <Link href={`/platform/projects/${project.id}`}>
      <motion.div
        whileHover={{ x: 2 }}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-[#adff41]/30 hover:bg-[#adff41]/[0.02] transition-all cursor-pointer"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#adff41]/10 border border-[#adff41]/20">
          <FolderOpen className="size-5 text-[#5a8a00] dark:text-[#adff41]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">{project.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {analysisCount} ürün{bestTitle ? ` · En iyi: ${bestTitle}` : ""}
          </p>
        </div>

        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
           <ArrowRight className="size-4 shrink-0" />
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
export function BuyerDashboard() {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [projects, setProjects] = useState<ShoppingProject[]>([]);
  const [compareCount, setCompareCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = getBuyerProfile();
    setProfile(p);
    if (!p.onboarded) {
      setShowOnboarding(true);
    }
    setSavedAnalyses(getSavedAnalyses());
    setProjects(getProjects());
    setCompareCount(getCompareQueue().length);
    setMounted(true);

    function refresh() {
      setSavedAnalyses(getSavedAnalyses());
      setProjects(getProjects());
      setCompareCount(getCompareQueue().length);
    }
    window.addEventListener("zekai-store-update", refresh);
    return () => window.removeEventListener("zekai-store-update", refresh);
  }, []);

  function handleOnboardingComplete(p: BuyerProfile) {
    setProfile(p);
    setShowOnboarding(false);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border" />
      </div>
    );
  }

  const firstName = profile?.name?.split(" ")[0] || "Alıcı";
  const recentAnalyses = savedAnalyses.slice(0, 3);
  const recentProjects = projects.slice(0, 2);

  const greetings = [
    `Merhaba ${firstName} 👋`,
    `Hoş geldin ${firstName}!`,
    `Ne alacağız bugün, ${firstName}?`,
  ];
  const greeting = greetings[new Date().getHours() % greetings.length];

  return (
    <div className="min-h-screen bg-background">
      {showOnboarding && (
        <BuyerOnboarding onComplete={handleOnboardingComplete} />
      )}

      <PlatformNav />

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 mt-6 text-center"
        >
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            {greeting}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Alışveriş karar merkezine hoş geldin.
          </p>
        </motion.div>

        {/* Quick Analyze Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-16"
        >
          <QuickAnalyzeBar />
        </motion.div>

        {/* Recent Analyses */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-foreground">Karar Hafızası</h2>
            {savedAnalyses.length > 0 && (
              <Link
                href="/platform/saved"
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
              >
                Tümünü Gör
              </Link>
            )}
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                 <BookmarkCheck className="size-6" />
              </div>
              <p className="text-base font-bold text-foreground">Henüz analiz yapılmadı</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-[250px] mx-auto">
                Yukarıdan bir ürün linki yapıştırarak ilk alışveriş kararını incele.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {recentAnalyses.map((a) => (
                <AnalysisCard key={a.id} analysis={a} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Recent Projects */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-foreground">Karar Odaları</h2>
            <Link
              href="/platform/projects"
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition-colors"
            >
              Tümünü Gör
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="group relative overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-muted/50 to-background p-8 text-center hover:border-[#adff41]/30 transition-all">
              <div className="absolute -right-4 -top-4 size-32 rounded-full bg-[#adff41]/10 blur-3xl group-hover:bg-[#adff41]/20 transition-colors" />
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-background border border-border text-foreground mb-4 shadow-sm relative z-10">
                 <FolderOpen className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground relative z-10">Yeni Karar Odası</h3>
              <p className="mt-1.5 text-sm text-muted-foreground/80 max-w-[280px] mx-auto relative z-10">
                Birden fazla ürün arasında en mantıklı seçimi bulmak için akıllı bir proje başlat.
              </p>
              <Link
                href="/platform/projects"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-bold text-background hover:bg-foreground/90 transition-transform hover:scale-105 relative z-10"
              >
                <Plus className="size-4 mr-1.5" />
                Oda Oluştur
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentProjects.map((p) => {
                const projectAnalyses = savedAnalyses.filter((a) =>
                  p.savedAnalysisIds.includes(a.id)
                );
                const best = projectAnalyses.sort(
                  (a, b) => a.overallRiskPercent - b.overallRiskPercent
                )[0];
                return (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    analysisCount={p.savedAnalysisIds.length}
                    bestTitle={best?.productTitle}
                  />
                );
              })}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
