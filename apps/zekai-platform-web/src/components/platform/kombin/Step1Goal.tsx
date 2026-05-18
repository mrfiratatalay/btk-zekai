"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKombinStore } from "@/lib/kombin-store";
import type { KombinGoal } from "@/types/kombin";
import { formatPrice } from "@/lib/kombin-utils";

const USE_CASES = ["Günlük", "Spor", "Ofis", "Seyahat"];
const PRIORITIES = ["Rahatlık", "Fiyat/Performans", "Premium", "Minimal"];
const STYLES = ["Sade", "Sportif", "Teknolojik", "Renkli"];

const BUDGET_MIN = 500;
const BUDGET_MAX = 15000;
const BUDGET_PRESETS = [1500, 3000, 5000, 10000];

function ChipGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(item: string) {
    onChange(selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item]);
  }
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition-all",
              selected.includes(opt)
                ? "border-[#adff41] bg-[#adff41]/10 text-[#adff41]"
                : "border-border bg-transparent text-muted-foreground hover:border-[#adff41]/50 hover:text-foreground",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Step1Goal() {
  const { goal, setGoal, nextStep } = useKombinStore();

  const [local, setLocal] = useState<KombinGoal>({
    goalText: goal.goalText,
    budget: goal.budget,
    useCases: goal.useCases,
    priorities: goal.priorities,
    style: goal.style,
  });

  function update<K extends keyof KombinGoal>(key: K, val: KombinGoal[K]) {
    setLocal((prev) => ({ ...prev, [key]: val }));
  }

  function handleContinue() {
    setGoal(local);
    nextStep();
  }

  const canContinue = local.goalText.trim().length >= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#adff41]/10">
          <Target className="size-5 text-[#adff41]" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">Nasıl bir kombin kurmak istiyorsun?</h2>
          <p className="text-sm text-muted-foreground">Hedefini, bütçeni ve önceliklerini belirt.</p>
        </div>
      </div>

      {/* Goal text */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Hedefini anlat
        </p>
        <div className="relative">
          <textarea
            value={local.goalText}
            onChange={(e) => update("goalText", e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Kampüste günlük kullanım için rahat, sade ve teknolojik bir kombin istiyorum."
            className="w-full resize-none rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#adff41]/60 focus:outline-none focus:ring-1 focus:ring-[#adff41]/30 transition-colors"
          />
          <span className="absolute bottom-2.5 right-3 text-xs text-muted-foreground/50">
            {local.goalText.length}/300
          </span>
        </div>
      </div>

      {/* Budget slider */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bütçe</p>
          <span className="rounded-lg bg-[#adff41]/10 px-3 py-1 text-sm font-black text-[#adff41]">
            {formatPrice(local.budget)}
          </span>
        </div>
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={100}
          value={local.budget}
          onChange={(e) => update("budget", Number(e.target.value))}
          className="w-full accent-[#adff41]"
        />
        <div className="mt-2 flex justify-between gap-2">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => update("budget", preset)}
              className={cn(
                "cursor-pointer flex-1 rounded-lg border py-1 text-xs font-semibold transition-all",
                local.budget === preset
                  ? "border-[#adff41] bg-[#adff41]/10 text-[#adff41]"
                  : "border-border text-muted-foreground hover:border-[#adff41]/40",
              )}
            >
              {formatPrice(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Chip selects */}
      <ChipGroup
        label="Kullanım Amacı"
        options={USE_CASES}
        selected={local.useCases}
        onChange={(v) => update("useCases", v)}
      />
      <ChipGroup
        label="Önceliklerin"
        options={PRIORITIES}
        selected={local.priorities}
        onChange={(v) => update("priorities", v)}
      />
      <ChipGroup
        label="Tarz"
        options={STYLES}
        selected={local.style}
        onChange={(v) => update("style", v)}
      />

      {/* AI info footer */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[#adff41]/20 bg-[#adff41]/5 px-4 py-3">
        <Sparkles className="size-4 shrink-0 text-[#adff41]" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-[#adff41]">ZekAI</span> bu bilgilere göre kombinini 5 farklı ajanla analiz edecek.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        disabled={!canContinue}
        onClick={handleContinue}
        className={cn(
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-base font-black transition-all",
          canContinue
            ? "bg-[#adff41] text-[#1a2e00] hover:bg-[#9ee833] active:scale-[0.98]"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        Devam Et
        <ChevronRight className="size-5" />
      </button>
    </motion.div>
  );
}
