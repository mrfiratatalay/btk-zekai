"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgentStep } from "@/types/analysis";

export function useAnalysisProgress(
  agentSteps: AgentStep[],
  onComplete: () => void
) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= agentSteps.length) {
      const t = window.setTimeout(onComplete, 700);
      return () => window.clearTimeout(t);
    }
    const duration = agentSteps[currentIndex]?.durationMs ?? 850;
    const t = window.setTimeout(() => setCurrentIndex((i) => i + 1), duration);
    return () => window.clearTimeout(t);
  }, [agentSteps, currentIndex, onComplete]);

  const completed = Math.min(currentIndex, agentSteps.length);
  const progress = Math.round((completed / agentSteps.length) * 100);
  const activeStep = agentSteps[Math.min(currentIndex, agentSteps.length - 1)];
  const isDone = currentIndex >= agentSteps.length;

  const agentNodeStates = useMemo(
    () =>
      agentSteps.map((_, i) =>
        i < currentIndex ? "completed" : i === currentIndex ? "active" : "pending"
      ),
    [agentSteps, currentIndex]
  );

  return { completed, progress, activeStep, isDone, agentNodeStates };
}
