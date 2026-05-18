"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, Package, PackagePlus, Sparkles } from "lucide-react";
import type { ProductDetail } from "@/lib/api/products";
import {
  archiveProductBundle,
  createProductBundle,
  publishProductBundle,
  type BundleRecommendation,
  type BundleRecommendationResponse,
  type CreateProductBundlePayload,
  type ProductBundle,
} from "@/lib/api/seller";
import { formatSellerPrice } from "@/lib/format";
import { BundleSetupSheet } from "./BundleSetupSheet";

export function SellerBundles({
  product,
  bundles,
  recommendations,
  recommendationsLoading,
  onGenerate,
}: {
  product: ProductDetail;
  bundles: ProductBundle[];
  recommendations?: BundleRecommendationResponse;
  recommendationsLoading: boolean;
  onGenerate: () => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<BundleRecommendation | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductBundlePayload) => createProductBundle(product.id, payload),
    onSuccess: () => {
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["seller-bundles", product.id] });
    },
  });
  const publishMutation = useMutation({
    mutationFn: (bundleId: string) => publishProductBundle(product.id, bundleId, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-bundles", product.id] }),
    onError: (err: Error) => alert(`Yayınlama başarısız: ${err.message}`),
  });
  const archiveMutation = useMutation({
    mutationFn: (bundleId: string) => archiveProductBundle(product.id, bundleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-bundles", product.id] }),
  });

  const recs = recommendations?.recommendations ?? [];
  const suggestedProductIdeas = recommendations?.missingOpportunity?.suggestedProductIdeas ?? [];

  const STATUS_LABELS: Record<string, string> = {
    Draft: "Taslak",
    Published: "Yayında",
    Archived: "Arşivlendi",
  };
  const STATUS_STYLES: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    Published: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
    Archived: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/seller/products" className="hover:text-foreground">Ürünlerim</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${product.id}`} className="hover:text-foreground">{product.title}</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Birlikte Sat</span>
      </nav>

      <div>
        <h1 className="text-3xl font-black text-foreground">Birlikte Sat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bu ürünle birlikte satılabilecek paketleri hazırla.</p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
          <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {(product.images[0] || product.primaryImage) && (
              <Image src={product.images[0] ?? product.primaryImage} alt={product.title} fill sizes="128px" className="object-contain p-3" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-xl font-black text-foreground">{product.title}</h2>
            <p className="mt-2 text-2xl font-black text-lime-700 dark:text-lime-300">{formatSellerPrice(product.price)}</p>
            <p className="mt-2 text-sm text-muted-foreground">{product.stock} stok · {product.category}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-lime-500/20 bg-lime-500/8 p-5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-700 dark:text-lime-300">
            <Sparkles className="size-6" />
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-foreground">
            Mağazandaki tamamlayıcı ürünler kategori, fiyat ve stok verilerine göre eşleştirilir.
          </p>
          <button
            onClick={onGenerate}
            disabled={recommendationsLoading}
            className="mt-5 h-11 w-full rounded-xl bg-lime-400 text-sm font-black text-gray-950 hover:bg-lime-300 disabled:opacity-60"
          >
            {recommendationsLoading ? "Öneriler üretiliyor..." : "Paket Önerisi Üret"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">Mevcut Paketler</h2>
          <span className="text-sm text-muted-foreground">{bundles.length} paket</span>
        </div>
        {bundles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <Package className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Henüz paket oluşturulmadı.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-4">
                  <ProductThumb image={bundle.primaryProduct.image} title={bundle.primaryProduct.title} />
                  <span className="text-2xl font-light text-lime-600">+</span>
                  <ProductThumb image={bundle.complementaryProduct.image} title={bundle.complementaryProduct.title} />
                  <div className="min-w-0">
                    <p className="font-black text-foreground">{bundle.title}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{bundle.campaignText}</p>
                    <p className="mt-1 text-sm font-bold text-lime-700 dark:text-lime-300">{formatSellerPrice(bundle.bundleTotal)} · %{bundle.discountPercent} indirim</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[bundle.status] ?? "bg-muted text-muted-foreground"}`}>{STATUS_LABELS[bundle.status] ?? bundle.status}</span>
                  {bundle.status === "Draft" && (
                    <button onClick={() => publishMutation.mutate(bundle.id)} className="rounded-xl bg-lime-400 px-4 py-2 text-xs font-black text-gray-950">Yayınla</button>
                  )}
                  <button onClick={() => archiveMutation.mutate(bundle.id)} className="rounded-xl border border-border px-4 py-2 text-xs font-black text-muted-foreground">Arşivle</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {recommendations?._mock && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            AI limiti aşıldı — öneriler demo modda üretildi. Gerçek analiz için API key'ini yenile.
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-black text-foreground">Önerilen Paketler</h2>
        {recs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recs.map((rec) => (
              <div key={rec.complementaryProduct.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                  <ProductThumb image={rec.primaryProduct.image} title={rec.primaryProduct.title} />
                  <span className="text-2xl font-light text-lime-600">+</span>
                  <ProductThumb image={rec.complementaryProduct.image} title={rec.complementaryProduct.title} />
                  <div className="min-w-0">
                    <p className="font-black text-foreground">{rec.suggestedTitle}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{rec.recommendationReason}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                  <span className="text-sm text-muted-foreground">Paket Değeri</span>
                  <span className="font-black text-foreground">{formatSellerPrice(rec.bundleTotal)}</span>
                </div>
                <button onClick={() => setSelected(rec)} className="mt-4 h-11 w-full rounded-xl bg-lime-400 text-sm font-black text-gray-950 hover:bg-lime-300">
                  Paketi Hazırla
                </button>
              </div>
            ))}
          </div>
        ) : recommendations?.missingOpportunity ? (
          <div className="rounded-2xl border border-lime-500/20 bg-lime-500/8 p-6">
            <PackagePlus className="mb-3 size-8 text-lime-700 dark:text-lime-300" />
            <p className="font-black text-foreground">{recommendations.missingOpportunity.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{recommendations.missingOpportunity.message}</p>
            {suggestedProductIdeas.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedProductIdeas.map((idea) => (
                  <span key={idea} className="rounded-full bg-card px-3 py-1 text-xs font-bold text-lime-700 dark:text-lime-300">{idea}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Önerileri görmek için paket önerisi üret.</p>
        )}
      </section>

      <BundleSetupSheet
        recommendation={selected}
        loading={createMutation.isPending}
        onClose={() => setSelected(null)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
    </div>
  );
}

function ProductThumb({ image, title }: { image: string; title: string }) {
  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
      {image
        ? <Image src={image} alt={title} fill sizes="64px" className="object-contain p-2" />
        : <Package className="m-5 size-6 text-muted-foreground/40" />
      }
    </div>
  );
}
