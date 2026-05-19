"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { AnalysisLoadingView } from "@/components/platform/AnalysisLoadingView";
import { AnalysisResultView } from "@/components/platform/AnalysisResultView";
import { useAnalysesStore } from "@/lib/buyer-store";
import {
  applyVerifiedReport,
  extractVerifiedReport,
  runBuyerAgentStream,
} from "@/lib/adk/buyer-agent";

const LIVE_AGENT_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADK_AGENT !== "false";
const REPORT_REVEAL_DELAY_MS = 8_000;

// Bir adım YALNIZCA kendi sonuç verisi (state_delta) geldiğinde tamamlandı sayılır.
// Backend her agent için önce düz metin "başlıyor" mesajı yolluyor — o mesaj
// adımı tamamlamaz, sadece canlı feed'e düşer.
const STATE_KEY_TO_STEPS: Record<string, string[]> = {
  advisor_raporu:   ["advisor-agent"],
  piyasa_kontrolu:  ["market-agent"],
  final_rapor:      ["market-agent", "decision-agent"],
};

function getCacheKey(analysis: BuyerAnalysis, product?: Product) {
  if (!product) return undefined;
  return `zekai:buyer-analysis:v3:${product.id}:${analysis.userNeedText}`;
}

export function BuyerAnalysisExperience({
  analysis,
  product,
}: {
  analysis: BuyerAnalysis;
  product?: Product;
}) {
  const isSaved = useAnalysesStore((s) => s.analyses.some((a) => a.id === analysis.analysisId));
  const [status, setStatus] = useState<"running" | "completed" | "error">(() =>
    isSaved ? "completed" : "running"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isSaved) setStatus("completed");
  }, [isSaved]);

  const [liveAnalysis, setLiveAnalysis] = useState(analysis);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(() => new Set());
  const [useLiveAgent, setUseLiveAgent] = useState(Boolean(product) && LIVE_AGENT_ENABLED);
  const [streamFindings, setStreamFindings] = useState<string[]>([]);

  // startedRef: StrictMode'da cleanup sonrası false'a döner → ikinci çalışma bloklenmez
  const startedRef = useRef(false);
  const finalReportReceivedRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);

  const handleComplete = useCallback(() => setStatus("completed"), []);

  const agentStepIdsRef = useRef(analysis.agentSteps.map((s) => s.id));
  useEffect(() => {
    if (!product || startedRef.current || !LIVE_AGENT_ENABLED) return;

    startedRef.current = true;
    finalReportReceivedRef.current = false;
    let cancelled = false;
    const controller = new AbortController();
    const cacheKey = getCacheKey(analysis, product);

    // Demo cache'i atla — gerçek AI verisi istiyoruz
    if (cacheKey) {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        try {
          const cached = JSON.parse(raw) as BuyerAnalysis;
          setLiveAnalysis(cached);
          setCompletedStepIds(new Set(agentStepIdsRef.current));
          setStatus("completed");
          return;
        } catch {
          window.localStorage.removeItem(cacheKey);
        }
      }
    }

    runBuyerAgentStream({
      product,
      buyerNeed: analysis.userNeedText,
      analysisId: analysis.analysisId,
      signal: controller.signal,
      onEvent(event) {
        if (cancelled) return;

        // Adımı SADECE kendi sonuç verisi geldiğinde tamamla
        const delta = event.actions?.state_delta;
        if (delta) {
          const doneSteps: string[] = [];
          for (const key of Object.keys(delta)) {
            const steps = STATE_KEY_TO_STEPS[key];
            if (steps) doneSteps.push(...steps);
          }
          if (doneSteps.length) {
            setCompletedStepIds((prev) => new Set([...prev, ...doneSteps]));
          }
        }

        // Düz metin "başlıyor" mesajları → canlı feed (adımı tamamlamaz)
        const rawText = event.content?.parts?.find((p) => p.text)?.text;
        if (rawText && !rawText.trimStart().startsWith("{") && rawText.trim().length > 8) {
          setStreamFindings((prev) =>
            prev.includes(rawText) ? prev : [...prev, rawText]
          );
        }

        // Ekran YALNIZCA gerçek final_rapor geldiğinde rapora geçer
        const report = extractVerifiedReport(event);
        if (report) {
          finalReportReceivedRef.current = true;
          const nextAnalysis = applyVerifiedReport(analysis, product, report);
          setLiveAnalysis(nextAnalysis);
          setCompletedStepIds(new Set(agentStepIdsRef.current));
          if (cacheKey) {
            window.localStorage.setItem(cacheKey, JSON.stringify(nextAnalysis));
          }
          if (revealTimerRef.current) {
            window.clearTimeout(revealTimerRef.current);
          }
          revealTimerRef.current = window.setTimeout(() => {
            if (!cancelled) {
              setUseLiveAgent(false);
              setStatus("completed");
            }
          }, REPORT_REVEAL_DELAY_MS);
        }
      },
    })
      .then(() => {
        if (!cancelled) {
          if (!finalReportReceivedRef.current) {
            setUseLiveAgent(false);
            setErrorMessage("Analiz tamamlanmadan bağlantı kapandı. Lütfen tekrar deneyin.");
            setStatus("error");
          }
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn("Buyer analysis stream error.", err);
        if (!cancelled) {
          setUseLiveAgent(false);
          setErrorMessage(err instanceof Error ? err.message : "AI analizi tamamlanamadı.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      controller.abort();
      startedRef.current = false;
    };
  }, [analysis, product]);

  const completedOverride = useMemo(() => {
    if (!useLiveAgent) return undefined;
    let count = 0;
    for (const step of analysis.agentSteps) {
      if (completedStepIds.has(step.id)) count += 1;
    }
    return count;
  }, [analysis.agentSteps, completedStepIds, useLiveAgent]);

  const liveFindings: string[] = streamFindings.length > 0
    ? streamFindings
    : [
        liveAnalysis.trustAnalysis.signals[1]?.description ?? null,
        liveAnalysis.priceAnalysis.warning || null,
      ].filter(Boolean) as string[];

  if (status === "running") {
    return (
      <AnalysisLoadingView
        agentSteps={liveAnalysis.agentSteps}
        userNeedText={liveAnalysis.userNeedText}
        liveFindings={liveFindings}
        product={product}
        analysisId={liveAnalysis.analysisId}
        onComplete={handleComplete}
        completedOverride={completedOverride}
        disableTimer={useLiveAgent}
      />
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-black text-foreground">Analiz tamamlanamadı</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {errorMessage || "Gemini yanıtı alınamadı. Lütfen biraz sonra tekrar dene."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

  return <AnalysisResultView analysis={liveAnalysis} product={product} />;
}
