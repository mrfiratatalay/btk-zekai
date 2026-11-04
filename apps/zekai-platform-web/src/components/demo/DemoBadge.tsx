"use client";

import { useState } from "react";
import { FlaskConical, RotateCcw, X } from "lucide-react";
import { isDemoMode } from "@/lib/api/transport";

/**
 * Floating notice on every screen of the demo build. It stays out of the page flow because
 * the seller studio uses a full-height layout with a fixed mobile tab bar; on phones it
 * collapses to a small button so it never covers a screen's own bottom actions.
 */
export function DemoBadge() {
  const [open, setOpen] = useState(false);
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
    <div className="fixed bottom-40 right-3 z-50 md:bottom-4">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Canlı demo bilgisini aç"
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card/95 shadow-lg backdrop-blur md:hidden"
        >
          <FlaskConical className="size-4 text-[#86c820] dark:text-[#ADFF41]" />
        </button>
      )}
      <div className={`${open ? "flex" : "hidden"} max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-border bg-card/95 py-1.5 pl-3 pr-1.5 text-xs shadow-lg backdrop-blur md:flex`}>
        <FlaskConical className="size-3.5 shrink-0 text-[#86c820] dark:text-[#ADFF41]" />
        <span className="font-semibold text-foreground">Canlı demo</span>
        <span className="hidden text-muted-foreground lg:inline">· veriler bu tarayıcıda, AI cevapları kural tabanlı demo motorundan</span>
        <button
          type="button"
          onClick={reset}
          disabled={resetting}
          className="ml-1 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-semibold text-foreground transition-colors hover:bg-muted/70 disabled:opacity-60"
        >
          <RotateCcw className="size-3" />
          {resetting ? "Sıfırlanıyor…" : "Demoyu sıfırla"}
        </button>
        <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="rounded-full p-1 text-muted-foreground md:hidden">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
