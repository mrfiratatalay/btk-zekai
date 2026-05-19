"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKombinStore } from "@/lib/kombin-store";
import { useAnalysesStore, useProjectsStore } from "@/lib/buyer-store";
import { Step1Goal } from "./Step1Goal";
import { Step2Place } from "./Step2Place";
import { Step3Analysis } from "./Step3Analysis";

const STEPS = [
  { id: 1, label: "Amaç" },
  { id: 2, label: "Yerleştir" },
  { id: 3, label: "Analiz" },
] as const;

const STEP_SUBTITLES: Record<number, string> = {
  1: "Alıcı Modülü",
  2: "Alıcı Modülü",
  3: "Analiz Sonuçları",
};

const PAGE_TITLES: Record<number, string> = {
  1: "Kombin Danışmanı",
  2: "Kombin Danışmanı",
  3: "Kombin Analizi",
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, idx) => {
        const state = current === step.id ? "active" : current > step.id ? "done" : "idle";
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all",
                state === "active" && "bg-[#adff41] text-[#1a2e00]",
                state === "done" && "bg-muted text-muted-foreground",
                state === "idle" && "border border-border text-muted-foreground bg-transparent",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[10px] font-black",
                  state === "active" && "bg-[#1a2e00] text-[#adff41]",
                  state === "done" && "bg-muted-foreground/30 text-muted-foreground",
                  state === "idle" && "border border-current",
                )}
              >
                {step.id}
              </span>
              {step.label}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn("h-px w-3 transition-colors", current > step.id ? "bg-[#adff41]/40" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function KombinFlow() {
  const step = useKombinStore((s) => s.step);
  const prevStep = useKombinStore((s) => s.prevStep);
  const loadAnalyses = useAnalysesStore((s) => s.load);
  const loadProjects = useProjectsStore((s) => s.load);

  useEffect(() => {
    loadAnalyses();
    loadProjects();
  }, [loadAnalyses, loadProjects]);

  // Step 2 gets the full-screen split layout on desktop
  if (step === 2) {
    return <Step2Place fullscreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => (step > 1 ? prevStep() : window.history.back())}
              className="cursor-pointer flex items-center gap-1.5 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="text-center">
              <h1 className="text-base font-black text-foreground">{PAGE_TITLES[step]}</h1>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-[#adff41] inline-block" />
                {STEP_SUBTITLES[step]}
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl border border-[#adff41]/30 bg-[#adff41]/10">
              <span className="text-xs font-black text-[#adff41]">Z</span>
            </div>
          </div>
          <StepIndicator current={step} />
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 1 && <Step1Goal key="step1" />}
          {step === 3 && <Step3Analysis key="step3" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
