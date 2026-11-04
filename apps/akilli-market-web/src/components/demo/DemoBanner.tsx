"use client";

import { useState } from "react";
import { Info, RotateCcw } from "lucide-react";
import { isDemoMode } from "@/lib/api/transport";

/** Tells every visitor this is a demo and lets them return to the original seed data. */
export function DemoBanner() {
  const [resetting, setResetting] = useState(false);
  if (!isDemoMode) return null;

  async function reset() {
    setResetting(true);
    // The build-time check lets API builds drop the demo module entirely.
    if (process.env.NEXT_PUBLIC_DATA_MODE !== "api") {
      const { resetDemoData } = await import("@/demo/db");
      resetDemoData();
    }
    window.location.href = "/login";
  }

  return (
    <div className="border-b border-orange-200 bg-orange-50 text-[13px] text-[#7C2D12]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
        <Info className="size-4 shrink-0 text-[#FF6000]" />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">Canlı demo.</span> Değişiklikler yalnızca bu tarayıcıda saklanır;
          gerçek ödeme ya da kargo yoktur.
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={resetting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-2.5 py-1 font-semibold text-[#9A3412] hover:bg-orange-100 disabled:opacity-60"
        >
          <RotateCcw className="size-3.5" />
          {resetting ? "Sıfırlanıyor…" : "Demoyu sıfırla"}
        </button>
      </div>
    </div>
  );
}
