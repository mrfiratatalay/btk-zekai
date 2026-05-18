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
import { useMockStore } from "@/lib/store/mock-store";

const LIVE_AGENT_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADK_AGENT !== "false";

// Bir adım YALNIZCA kendi sonuç verisi (state_delta) geldiğinde tamamlandı sayılır.
// Backend her agent için önce düz metin "başlıyor" mesajı yolluyor — o mesaj
// adımı tamamlamaz, sadece canlı feed'e düşer.
const STATE_KEY_TO_STEPS: Record<string, string[]> = {
  ihtiyac_profili:    ["need-agent"],
  fiyat_analizi:      ["price-agent"],
  yorum_analizi:      ["review-agent"],
  alternatif_urunler: ["alternative-agent"],
  final_rapor:        ["synthesis-agent", "verification-agent"],
};

function getCacheKey(analysis: BuyerAnalysis, product?: Product) {
  if (!product) return undefined;
  return `zekai:buyer-analysis:v2:${product.id}:${analysis.userNeedText}`;
}

export function BuyerAnalysisExperience({
  analysis,
  product,
}: {
  analysis: BuyerAnalysis;
  product?: Product;
}) {
  const isSaved = useAnalysesStore((s) => s.analyses.some((a) => a.id === analysis.analysisId));
  const [status, setStatus] = useState<"running" | "completed">(() =>
    isSaved ? "completed" : "running"
  );

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

  const handleComplete = useCallback(() => setStatus("completed"), []);

  // agentStepIds ref'te tutulur — completeWithLocalFallback bağımlılık zincirini kırar
  const agentStepIdsRef = useRef(analysis.agentSteps.map((s) => s.id));
  const completeWithLocalFallback = useCallback(() => {
    useMockStore.getState().triggerMockMode();
    setCompletedStepIds(new Set(agentStepIdsRef.current));
    setUseLiveAgent(false);
    setStatus("completed");
  }, []);

  useEffect(() => {
    if (!product || startedRef.current || !LIVE_AGENT_ENABLED) return;

    startedRef.current = true;
    finalReportReceivedRef.current = false;
    // Önceki demo session'dan kalan flag'i sıfırla
    useMockStore.getState().resetMockMode();
    let cancelled = false;
    const cacheKey = getCacheKey(analysis, product);

    // Demo cache'i atla — gerçek AI verisi istiyoruz
    if (cacheKey) {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        try {
          const cached = JSON.parse(raw) as BuyerAnalysis & { _fromMock?: boolean };
          // Mock verisiyle doldurulmuş cache'i yok say, sil
          if (!cached._fromMock) {
            setLiveAnalysis(cached);
            setCompletedStepIds(new Set(agentStepIdsRef.current));
            setStatus("completed");
            return;
          }
          window.localStorage.removeItem(cacheKey);
        } catch {
          window.localStorage.removeItem(cacheKey);
        }
      }
    }

    // 170s: backend en kötü ihtimalle ~75s + Google Search grounding payı.
    // Bu süreden ÖNCE demo'ya düşersek ücretli analizi çöpe atmış oluruz.
    // Backend zaten rate-limit/hata durumunda kendi hızlı mock'unu yolluyor.
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) completeWithLocalFallback();
    }, 170_000);

    runBuyerAgentStream({
      product,
      buyerNeed: analysis.userNeedText,
      analysisId: analysis.analysisId,
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
          if (cacheKey && !useMockStore.getState().isMockMode) {
            window.localStorage.setItem(cacheKey, JSON.stringify(nextAnalysis));
          }
          setStatus("completed");
        }
      },
    })
      .then(() => {
        if (!cancelled) {
          window.clearTimeout(fallbackTimer);
          setUseLiveAgent(false);
          if (!finalReportReceivedRef.current) {
            completeWithLocalFallback();
          }
        }
      })
      .catch((err) => {
        console.warn("ADK stream error, falling back to demo.", err);
        if (!cancelled) {
          window.clearTimeout(fallbackTimer);
          completeWithLocalFallback();
        }
      });

    return () => {
      cancelled = true;
      // StrictMode: cleanup sonrası startedRef sıfırlanır → ikinci effect çalışabilir
      startedRef.current = false;
      window.clearTimeout(fallbackTimer);
    };
  }, [analysis, product, completeWithLocalFallback]);

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

  return <AnalysisResultView analysis={liveAnalysis} product={product} />;
}
