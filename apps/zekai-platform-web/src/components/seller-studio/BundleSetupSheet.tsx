"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { BundleRecommendation, CreateProductBundlePayload } from "@/lib/api/seller";
import { formatSellerPrice } from "@/lib/format";

export function BundleSetupSheet({
  recommendation,
  loading,
  onClose,
  onSubmit,
}: {
  recommendation: BundleRecommendation | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductBundlePayload) => void;
}) {
  if (!recommendation) return null;

  function submit(publish: boolean) {
    if (!recommendation) return;
    onSubmit({
      complementaryProductId: recommendation.complementaryProduct.id,
      title: recommendation.suggestedTitle,
      shortDescription: recommendation.suggestedShortDescription,
      campaignText: recommendation.suggestedCampaignText,
      ctaLabel: recommendation.suggestedCtaLabel,
      discountPercent: recommendation.suggestedDiscountPercent,
      recommendationReason: recommendation.recommendationReason,
      score: recommendation.score,
      publish,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-lime-700 dark:text-lime-300">Paketi Hazırla</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{recommendation.suggestedTitle}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-muted p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            {[recommendation.primaryProduct, recommendation.complementaryProduct].map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="relative size-16 overflow-hidden rounded-xl bg-background">
                  {product.image && <Image src={product.image} alt={product.title} fill sizes="64px" className="object-contain p-2" />}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold text-foreground">{product.title}</p>
                  <p className="text-sm font-black text-lime-700 dark:text-lime-300">{formatSellerPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background px-4 py-3">
            <span className="text-sm text-muted-foreground">Paket toplamı</span>
            <div className="text-right">
              <p className="text-xs text-muted-foreground line-through">{formatSellerPrice(recommendation.originalTotal)}</p>
              <p className="text-lg font-black text-foreground">{formatSellerPrice(recommendation.bundleTotal)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ReadonlyField label="Paket Adı" value={recommendation.suggestedTitle} />
          <ReadonlyField label="İndirim" value={`%${recommendation.suggestedDiscountPercent}`} />
          <ReadonlyField label="Kısa Açıklama" value={recommendation.suggestedShortDescription} wide />
          <ReadonlyField label="Kampanya Metni" value={recommendation.suggestedCampaignText} wide />
          <ReadonlyField label="CTA Butonu" value={recommendation.suggestedCtaLabel} wide />
          <ReadonlyField label="Öneri Nedeni" value={recommendation.recommendationReason} wide />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            disabled={loading}
            onClick={() => submit(false)}
            className="h-12 rounded-xl border border-border text-sm font-black text-foreground hover:bg-muted disabled:opacity-60"
          >
            Taslak Kaydet
          </button>
          <button
            disabled={loading}
            onClick={() => submit(true)}
            className="h-12 rounded-xl bg-lime-400 text-sm font-black text-gray-950 hover:bg-lime-300 disabled:opacity-60"
          >
            Mağazada Yayınla
          </button>
        </div>
      </aside>
    </div>
  );
}

function ReadonlyField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-background px-4 py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</p>
    </div>
  );
}
