"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSellerReturns,
  respondToReturn,
  type SellerReturn,
} from "@/lib/api/seller";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  SellerReview: {
    label: "Yanıt Bekliyor",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    icon: Clock,
  },
  SellerDisputed: {
    label: "İtiraz Edildi",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
    icon: AlertTriangle,
  },
  ArbiterReview: {
    label: "Hakem İncelemesinde",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    icon: ShieldCheck,
  },
  ResolutionProposed: {
    label: "Çözüm Önerildi",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
    icon: CheckCircle2,
  },
  Resolved: {
    label: "Çözümlendi",
    color: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    icon: CheckCircle2,
  },
};

const REASON_LABELS: Record<string, string> = {
  Damaged: "Hasarlı / Kırık ürün",
  NotAsExpected: "Beklentiyi karşılamadı",
  WrongProduct: "Yanlış ürün",
  LowQuality: "Düşük kalite",
  Other: "Diğer",
};

function ReturnCard({ ret, onUpdate }: { ret: SellerReturn; onUpdate: (updated: SellerReturn) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [responding, setResponding] = useState<"accept" | "dispute" | null>(null);
  const [disputeText, setDisputeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[ret.status] ?? STATUS_CONFIG.SellerReview;
  const Icon = cfg.icon;
  const canRespond = ret.status === "SellerReview";

  async function handleRespond(action: "accept" | "dispute") {
    if (action === "dispute" && disputeText.trim().length < 10) {
      setError("İtiraz açıklaması en az 10 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await respondToReturn(
        ret.id,
        action,
        action === "dispute" ? disputeText.trim() : undefined,
      );
      onUpdate(updated);
      setResponding(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10">
          <RotateCcw className="size-4 text-red-500" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {ret.productTitle}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span>{ret.orderNumber}</span>
            <span>·</span>
            <span>{REASON_LABELS[ret.reason] ?? ret.reason}</span>
            <span>·</span>
            <span>
              {new Date(ret.requestedAt).toLocaleDateString("tr-TR")}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-red-500">
            -{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(ret.amount)}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
              cfg.color,
            )}
          >
            <Icon className="size-3" />
            {cfg.label}
          </span>
        </div>

        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-gray-300" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-gray-300" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-white/8">
          {/* Buyer claim */}
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <p className="mb-1 text-xs font-semibold text-gray-400">Alıcı İddiası</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{ret.buyerClaim}</p>
          </div>

          {/* Seller response if exists */}
          {ret.sellerResponse && (
            <div className="mt-3 rounded-xl bg-green-50 p-4 dark:bg-green-500/10">
              <p className="mb-1 text-xs font-semibold text-green-600 dark:text-green-400">
                Satıcı Yanıtı
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{ret.sellerResponse}</p>
            </div>
          )}

          {/* Action buttons — only if SellerReview */}
          {canRespond && (
            <div className="mt-4">
              {responding === null && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setResponding("accept")}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle2 className="size-4" />
                    İadeyi Kabul Et
                  </button>
                  <button
                    onClick={() => setResponding("dispute")}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-orange-300 bg-orange-50 text-sm font-bold text-orange-700 hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 transition-colors"
                  >
                    <XCircle className="size-4" />
                    İtiraz Et
                  </button>
                </div>
              )}

              {responding === "accept" && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    İadeyi kabul edeceksiniz. Bu işlem geri alınamaz.
                  </p>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond("accept")}
                      disabled={loading}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : "Onayla"}
                    </button>
                    <button
                      onClick={() => setResponding(null)}
                      disabled={loading}
                      className="flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 dark:border-white/10"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {responding === "dispute" && (
                <div className="space-y-3">
                  <textarea
                    value={disputeText}
                    onChange={(e) => setDisputeText(e.target.value)}
                    placeholder="İtiraz gerekçenizi açıklayın... (en az 10 karakter)"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond("dispute")}
                      disabled={loading}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-orange-300 bg-orange-50 text-sm font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-60 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : "İtirazı Gönder"}
                    </button>
                    <button
                      onClick={() => { setResponding(null); setError(null); }}
                      disabled={loading}
                      className="flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 dark:border-white/10"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SellerReturns() {
  const [returns, setReturns] = useState<SellerReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSellerReturns()
      .then(setReturns)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(updated: SellerReturn) {
    setReturns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  const pending = returns.filter((r) => r.status === "SellerReview").length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İade Talepleri</h1>
          <p className="mt-1 text-sm text-gray-400">
            {returns.length} toplam iade
            {pending > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                {pending} yanıt bekliyor
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Toplam", value: returns.length, color: "text-gray-900 dark:text-white" },
          { label: "Yanıt Bekliyor", value: returns.filter((r) => r.status === "SellerReview").length, color: "text-amber-600 dark:text-amber-400" },
          { label: "İncelemede", value: returns.filter((r) => r.status === "ArbiterReview").length, color: "text-blue-600 dark:text-blue-400" },
          { label: "Çözümlendi", value: returns.filter((r) => r.status === "Resolved").length, color: "text-green-600 dark:text-green-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#111]">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={cn("mt-1 text-2xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Return list */}
      {returns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-24 dark:border-white/10">
          <Package className="mb-3 size-10 text-gray-200 dark:text-white/10" />
          <p className="text-sm text-gray-400">Henüz iade talebi yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => (
            <ReturnCard key={ret.id} ret={ret} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
