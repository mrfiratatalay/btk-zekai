"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ArbiterReviewProgress({
  steps,
  onComplete,
}: {
  steps: string[];
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= steps.length) {
      const timer = window.setTimeout(onComplete, 450);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => index + 1);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [currentIndex, onComplete, steps.length]);

  const progress = useMemo(
    () => Math.min((currentIndex / steps.length) * 100, 100),
    [currentIndex, steps.length],
  );

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
        Hakem incelemesi hazırlanıyor
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
        Alıcı iddiası, satıcı itirazı, kanıtlar ve zaman çizelgesi tarafsız
        şekilde değerlendiriliyor.
      </p>

      <Progress value={progress} className="mt-6 h-2 bg-[#EEF2F7]" />

      <div className="mt-6 grid gap-3">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex && currentIndex < steps.length;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4",
                completed && "border-[#BBF7D0] bg-[#F0FDF4]",
                active && "border-[#C4B5FD] bg-[#F5F3FF]",
                !completed && !active && "border-[#E5E7EB] bg-white",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  completed && "bg-[#16A34A] text-white",
                  active && "bg-[#5B2EFF] text-white",
                  !completed && !active && "bg-[#F3F4F6] text-[#9CA3AF]",
                )}
              >
                {completed ? (
                  <CheckCircle2 className="size-5" />
                ) : active ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Circle className="size-4" />
                )}
              </span>
              <p className="font-extrabold text-[#111827]">{step}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
