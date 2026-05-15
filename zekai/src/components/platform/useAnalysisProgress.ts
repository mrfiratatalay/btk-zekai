"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentStep } from "@/types/analysis";

export function useAnalysisProgress(
  agentSteps: AgentStep[],
  onComplete: () => void,
  options?: {
    completedOverride?: number;
    disableTimer?: boolean;
  }
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const effectiveIndex = options?.completedOverride ?? currentIndex;

  useEffect(() => {
    if (options?.disableTimer) return;

    if (currentIndex >= agentSteps.length) {
      const t = window.setTimeout(onComplete, 700);
      return () => window.clearTimeout(t);
    }
    const duration = agentSteps[currentIndex]?.durationMs ?? 850;
    const t = window.setTimeout(() => setCurrentIndex((i) => i + 1), duration);
    return () => window.clearTimeout(t);
  }, [agentSteps, currentIndex, onComplete, options?.disableTimer]);

  const completed = Math.min(effectiveIndex, agentSteps.length);
  const progress = Math.round((completed / agentSteps.length) * 100);
  const activeStep = agentSteps[Math.min(effectiveIndex, agentSteps.length - 1)];
  const isDone = effectiveIndex >= agentSteps.length;

  const agentNodeStates = useMemo(
    () =>
      agentSteps.map((_, i) =>
        i < effectiveIndex ? "completed" : i === effectiveIndex ? "active" : "pending"
      ),
    [agentSteps, effectiveIndex]
  );

  return { completed, progress, activeStep, isDone, agentNodeStates };
}
