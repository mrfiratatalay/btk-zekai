"use client";

import { cn } from "@/lib/utils";

export function getHealthConfig(score: number) {
  if (score <= 40) {
    return {
      label: "Kritik",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
      border: "border-red-100 dark:border-red-500/20",
      bar: "bg-red-500",
    };
  }

  if (score <= 70) {
    return {
      label: "İyileştirilebilir",
      text: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-500/20",
      bar: "bg-amber-500",
    };
  }

  return {
    label: "Sağlıklı",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-100 dark:border-green-500/20",
    bar: "bg-green-500",
  };
}

export function HealthScoreBadge({ score, className }: { score: number; className?: string }) {
  const config = getHealthConfig(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        config.bg,
        config.border,
        config.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.bar)} />
      {score}/100 · {config.label}
    </span>
  );
}
