"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getReturns, type ReturnRequest } from "@/lib/api/buyer";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SellerReview: {
    label: "Satıcı İnceliyor",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  SellerDisputed: {
    label: "Satıcı İtiraz Etti",
    color: "bg-orange-100 text-orange-700",
    icon: RotateCcw,
  },
  ArbiterReview: {
    label: "Hakem İncelemesinde",
    color: "bg-blue-100 text-blue-700",
    icon: ShieldCheck,
  },
  ResolutionProposed: {
    label: "Çözüm Önerildi",
    color: "bg-purple-100 text-purple-700",
    icon: CheckCircle2,
  },
  Resolved: {
    label: "Çözümlendi",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
};

const REASON_LABELS: Record<string, string> = {
  Damaged: "Hasarlı / Kırık ürün",
  NotAsExpected: "Beklentiyi karşılamadı",
  WrongProduct: "Yanlış ürün gönderildi",
  LowQuality: "Düşük kalite",
  Other: "Diğer",
};

function formatPrice(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
}

export function BuyerReturns() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReturns()
      .then(setReturns)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#FF6000]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500">{error}</p>
        <Link href="/login" className="text-sm font-semibold text-[#FF6000] hover:underline">
          Giriş Yap →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">İadelerim</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{returns.length} iade talebi</p>
      </div>

      {returns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] py-24">
          <Package className="mb-3 size-10 text-gray-200" />
          <p className="text-sm text-[#6B7280]">Henüz iade talebiniz yok.</p>
          <Link href="/orders" className="mt-3 text-sm font-semibold text-[#FF6000] hover:underline">
            Siparişlere Dön →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => {
            const cfg = STATUS_CONFIG[ret.status] ?? STATUS_CONFIG.SellerReview;
            const Icon = cfg.icon;
            return (
              <div key={ret.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <RotateCcw className="size-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#111827]">
                      {REASON_LABELS[ret.reason] ?? ret.reason}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      {new Date(ret.requestedAt).toLocaleDateString("tr-TR")} · {formatPrice(ret.amount)}
                    </p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", cfg.color)}>
                    <Icon className="size-3" />
                    {cfg.label}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-[#6B7280]">İddia</p>
                    <p className="text-sm text-[#111827]">{ret.buyerClaim}</p>
                  </div>

                  {ret.sellerResponse && (
                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-green-700">Satıcı Yanıtı</p>
                      <p className="text-sm text-[#111827]">{ret.sellerResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center">
        <Link
          href="/orders"
          className="text-sm font-semibold text-[#FF6000] hover:underline"
        >
          ← Siparişlerime Dön
        </Link>
      </div>
    </div>
  );
}
