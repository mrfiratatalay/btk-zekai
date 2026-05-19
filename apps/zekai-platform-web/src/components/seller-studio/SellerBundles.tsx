"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, Package, PackagePlus, Pencil, Sparkles, Trash2, X } from "lucide-react";
import type { ProductDetail } from "@/lib/api/products";
import {
  archiveProductBundle,
  createProductBundle,
  publishProductBundle,
  updateProductBundle,
  type BundleRecommendation,
  type BundleRecommendationResponse,
  type CreateProductBundlePayload,
  type ProductBundle,
  type UpdateProductBundlePayload,
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
  onGenerate: (force?: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<BundleRecommendation | null>(null);
  const [editingBundle, setEditingBundle] = useState<ProductBundle | null>(null);
  const [bundleTab, setBundleTab] = useState<"drafts" | "published">("drafts");
  const [packageManagerOpen, setPackageManagerOpen] = useState(false);

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
  const updateMutation = useMutation({
    mutationFn: ({ bundleId, payload }: { bundleId: string; payload: UpdateProductBundlePayload }) =>
      updateProductBundle(product.id, bundleId, payload),
    onSuccess: () => {
      setEditingBundle(null);
      queryClient.invalidateQueries({ queryKey: ["seller-bundles", product.id] });
    },
    onError: (err: Error) => alert(`Taslak güncellenemedi: ${err.message}`),
  });
  const updateAndPublishMutation = useMutation({
    mutationFn: async ({ bundleId, payload }: { bundleId: string; payload: UpdateProductBundlePayload }) => {
      await updateProductBundle(product.id, bundleId, payload);
      return publishProductBundle(product.id, bundleId, true);
    },
    onSuccess: () => {
      setEditingBundle(null);
      queryClient.invalidateQueries({ queryKey: ["seller-bundles", product.id] });
    },
    onError: (err: Error) => alert(`Taslak yayınlanamadı: ${err.message}`),
  });
  const archiveMutation = useMutation({
    mutationFn: (bundleId: string) => archiveProductBundle(product.id, bundleId),
    onSuccess: () => {
      setEditingBundle(null);
      queryClient.invalidateQueries({ queryKey: ["seller-bundles", product.id] });
    },
  });

  const recs = recommendations?.recommendations ?? [];
  const suggestedProductIdeas = recommendations?.missingOpportunity?.suggestedProductIdeas ?? [];
  const hasGeneratedRecommendations = Boolean(recommendations);
  const draftBundles = bundles.filter((bundle) => bundle.status === "Draft");
  const publishedBundles = bundles.filter((bundle) => bundle.status === "Published");
  const visibleBundles = bundleTab === "drafts" ? draftBundles : publishedBundles;

  function handleGenerateClick() {
    if (!hasGeneratedRecommendations) {
      onGenerate(false);
      return;
    }

    if (window.confirm("Gemini'ye yeni istek atılacak. Mevcut cache yerine yeniden üretmek istiyor musun?")) {
      onGenerate(true);
    }
  }

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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Birlikte Sat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Bu ürünle birlikte satılabilecek paketleri hazırla.</p>
        </div>
        <button
          type="button"
          onClick={() => setPackageManagerOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-black text-foreground shadow-sm hover:bg-muted"
        >
          <Package className="size-4 text-lime-700 dark:text-lime-300" />
          Paketlerim ({bundles.length})
        </button>
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
            onClick={handleGenerateClick}
            disabled={recommendationsLoading}
            className="mt-5 h-11 w-full rounded-xl bg-lime-400 text-sm font-black text-gray-950 hover:bg-lime-300 disabled:opacity-60"
          >
            {recommendationsLoading
              ? "Öneriler üretiliyor..."
              : hasGeneratedRecommendations
              ? "Yeniden Üret"
              : "Gemini ile Paket Önerisi Üret"}
          </button>
        </div>
      </section>

      {recommendations?._mock && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            AI limiti aşıldı — öneriler demo modda üretildi. Gerçek analiz için API key'ini yenile.
          </p>
        </div>
      )}

      {recommendations && (
        <section className="space-y-3">
          <h2 className="text-lg font-black text-foreground">Önerilen Paketler</h2>
          {recs.length > 0 ? (
            <div className="grid items-stretch gap-4 lg:grid-cols-3">
              {recs.map((rec) => (
                <div key={rec.complementaryProduct.id} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                  <div className="grid min-h-[136px] grid-cols-1 items-start gap-4 sm:grid-cols-[184px_1fr]">
                    <div className="flex h-20 items-center gap-4">
                      <ProductThumb image={rec.primaryProduct.image} title={rec.primaryProduct.title} />
                      <span className="shrink-0 text-2xl font-light text-lime-600">+</span>
                      <ProductThumb image={rec.complementaryProduct.image} title={rec.complementaryProduct.title} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="line-clamp-3 text-base font-black leading-6 text-foreground">{rec.suggestedTitle}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{rec.recommendationReason}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <span className="text-sm text-muted-foreground">Paket Değeri</span>
                    <span className="font-black text-foreground">{formatSellerPrice(rec.bundleTotal)}</span>
                  </div>
                  <button onClick={() => setSelected(rec)} className="mt-4 h-11 w-full rounded-xl bg-lime-400 text-sm font-black text-gray-950 hover:bg-lime-300">
                    Paketi Hazırla
                  </button>
                </div>
              ))}
            </div>
          ) : recommendations.missingOpportunity ? (
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
            <div className="rounded-2xl border border-dashed border-border py-10 text-center">
              <PackagePlus className="mx-auto mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-muted-foreground">Bu ürün için uygun paket önerisi bulunamadı.</p>
            </div>
          )}
        </section>
      )}

      {packageManagerOpen && (
        <PackageManagerSheet
          bundleTab={bundleTab}
          draftBundles={draftBundles}
          publishedBundles={publishedBundles}
          visibleBundles={visibleBundles}
          statusLabels={STATUS_LABELS}
          statusStyles={STATUS_STYLES}
          onTabChange={setBundleTab}
          onClose={() => setPackageManagerOpen(false)}
          onEdit={(bundle) => {
            setPackageManagerOpen(false);
            setEditingBundle(bundle);
          }}
          onPublish={(bundleId) => publishMutation.mutate(bundleId)}
          onDelete={(bundleId) => {
            if (window.confirm("Bu paketi silmek istiyor musun?")) archiveMutation.mutate(bundleId);
          }}
        />
      )}

      <BundleSetupSheet
        recommendation={selected}
        loading={createMutation.isPending}
        onClose={() => setSelected(null)}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
      <BundleDraftEditSheet
        bundle={editingBundle}
        loading={updateMutation.isPending || updateAndPublishMutation.isPending || archiveMutation.isPending}
        onClose={() => setEditingBundle(null)}
        onSave={(bundleId, payload) => updateMutation.mutate({ bundleId, payload })}
        onPublish={(bundleId, payload) => updateAndPublishMutation.mutate({ bundleId, payload })}
        onDelete={(bundleId) => {
          if (window.confirm("Bu taslağı silmek istiyor musun?")) archiveMutation.mutate(bundleId);
        }}
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

function PackageManagerSheet({
  bundleTab,
  draftBundles,
  publishedBundles,
  visibleBundles,
  statusLabels,
  statusStyles,
  onTabChange,
  onClose,
  onEdit,
  onPublish,
  onDelete,
}: {
  bundleTab: "drafts" | "published";
  draftBundles: ProductBundle[];
  publishedBundles: ProductBundle[];
  visibleBundles: ProductBundle[];
  statusLabels: Record<string, string>;
  statusStyles: Record<string, string>;
  onTabChange: (tab: "drafts" | "published") => void;
  onClose: () => void;
  onEdit: (bundle: ProductBundle) => void;
  onPublish: (bundleId: string) => void;
  onDelete: (bundleId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Paketlerimi kapat" onClick={onClose} />
      <aside className="relative h-full w-full max-w-4xl overflow-y-auto bg-card p-6 shadow-2xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-lime-700 dark:text-lime-300">Paket Yönetimi</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">Paketlerim</h2>
          </div>
          <button onClick={onClose} className="self-start rounded-xl p-2 text-muted-foreground hover:bg-muted" aria-label="Kapat">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => onTabChange("drafts")}
            className={`rounded-xl px-4 py-3 text-sm font-black transition ${
              bundleTab === "drafts"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Taslaklar ({draftBundles.length})
          </button>
          <button
            type="button"
            onClick={() => onTabChange("published")}
            className={`rounded-xl px-4 py-3 text-sm font-black transition ${
              bundleTab === "published"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yayındaki Paketler ({publishedBundles.length})
          </button>
        </div>

        {visibleBundles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <Package className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">
              {bundleTab === "drafts" ? "Henüz taslak paket yok." : "Henüz yayında paket yok."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {visibleBundles.map((bundle) => (
              <BundleRow
                key={bundle.id}
                bundle={bundle}
                statusLabel={statusLabels[bundle.status] ?? bundle.status}
                statusClassName={statusStyles[bundle.status] ?? "bg-muted text-muted-foreground"}
                onEdit={() => onEdit(bundle)}
                onPublish={() => onPublish(bundle.id)}
                onDelete={() => onDelete(bundle.id)}
              />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function BundleRow({
  bundle,
  statusLabel,
  statusClassName,
  onEdit,
  onPublish,
  onDelete,
}: {
  bundle: ProductBundle;
  statusLabel: string;
  statusClassName: string;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
}) {
  return (
    <button
      type="button"
      onClick={bundle.status === "Draft" ? onEdit : undefined}
      className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-lime-500/30 hover:bg-lime-500/5 lg:flex-row lg:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <ProductThumb image={bundle.primaryProduct.image} title={bundle.primaryProduct.title} />
        <span className="text-2xl font-light text-lime-600">+</span>
        <ProductThumb image={bundle.complementaryProduct.image} title={bundle.complementaryProduct.title} />
        <div className="min-w-0">
          <p className="font-black text-foreground">{bundle.title}</p>
          <p className="line-clamp-1 text-sm text-muted-foreground">{bundle.campaignText}</p>
          <p className="mt-1 text-sm font-bold text-lime-700 dark:text-lime-300">
            {formatSellerPrice(bundle.bundleTotal)} · %{bundle.discountPercent} indirim
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClassName}`}>{statusLabel}</span>
        {bundle.status === "Draft" && (
          <>
            <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-black text-foreground hover:bg-muted">
              <Pencil className="size-3.5" />
              Düzenle
            </button>
            <button onClick={onPublish} className="rounded-xl bg-lime-400 px-4 py-2 text-xs font-black text-gray-950">
              Yayınla
            </button>
          </>
        )}
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-black text-muted-foreground hover:bg-muted">
          <Trash2 className="size-3.5" />
          Sil
        </button>
      </div>
    </button>
  );
}

function BundleDraftEditSheet({
  bundle,
  loading,
  onClose,
  onSave,
  onPublish,
  onDelete,
}: {
  bundle: ProductBundle | null;
  loading: boolean;
  onClose: () => void;
  onSave: (bundleId: string, payload: UpdateProductBundlePayload) => void;
  onPublish: (bundleId: string, payload: UpdateProductBundlePayload) => void;
  onDelete: (bundleId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [campaignText, setCampaignText] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Paketi Sepete Ekle");
  const [discountPercent, setDiscountPercent] = useState(5);

  useEffect(() => {
    if (!bundle) return;
    setTitle(bundle.title);
    setShortDescription(bundle.shortDescription);
    setCampaignText(bundle.campaignText);
    setCtaLabel(bundle.ctaLabel);
    setDiscountPercent(bundle.discountPercent);
  }, [bundle]);

  if (!bundle) return null;

  const payload: UpdateProductBundlePayload = {
    title,
    shortDescription,
    campaignText,
    ctaLabel,
    discountPercent,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-lime-700 dark:text-lime-300">Taslağı Düzenle</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{bundle.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted" aria-label="Kapat">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-muted p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="flex items-center gap-3">
              <ProductThumb image={bundle.primaryProduct.image} title={bundle.primaryProduct.title} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-foreground">{bundle.primaryProduct.title}</p>
                <p className="text-sm font-black text-lime-700 dark:text-lime-300">{formatSellerPrice(bundle.primaryProduct.price)}</p>
              </div>
            </div>
            <span className="hidden text-2xl font-light text-lime-600 sm:block">+</span>
            <div className="flex items-center gap-3">
              <ProductThumb image={bundle.complementaryProduct.image} title={bundle.complementaryProduct.title} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold text-foreground">{bundle.complementaryProduct.title}</p>
                <p className="text-sm font-black text-lime-700 dark:text-lime-300">{formatSellerPrice(bundle.complementaryProduct.price)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background px-4 py-3">
            <span className="text-sm text-muted-foreground">Paket toplamı</span>
            <div className="text-right">
              <p className="text-xs text-muted-foreground line-through">{formatSellerPrice(bundle.originalTotal)}</p>
              <p className="text-lg font-black text-foreground">{formatSellerPrice(bundle.bundleTotal)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <EditableField label="Paket Adı" value={title} onChange={setTitle} />
          <EditableField label="İndirim (%)" type="number" value={String(discountPercent)} onChange={(value) => setDiscountPercent(Number(value))} />
          <EditableField label="Kısa Açıklama" value={shortDescription} onChange={setShortDescription} wide />
          <EditableField label="Kampanya Metni" value={campaignText} onChange={setCampaignText} wide />
          <EditableField label="CTA Butonu" value={ctaLabel} onChange={setCtaLabel} wide />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <button
            disabled={loading}
            onClick={() => onSave(bundle.id, payload)}
            className="h-12 rounded-xl border border-border text-sm font-black text-foreground hover:bg-muted disabled:opacity-60"
          >
            Taslağı Güncelle
          </button>
          <button
            disabled={loading}
            onClick={() => onPublish(bundle.id, payload)}
            className="h-12 rounded-xl bg-lime-400 px-5 text-sm font-black text-gray-950 hover:bg-lime-300 disabled:opacity-60"
          >
            Güncelle ve Yayınla
          </button>
          <button
            disabled={loading}
            onClick={() => onDelete(bundle.id)}
            className="h-12 rounded-xl border border-red-500/30 px-5 text-sm font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60"
          >
            Sil
          </button>
        </div>
      </aside>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = "text",
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        max={type === "number" ? 50 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-lime-500"
      />
    </label>
  );
}
