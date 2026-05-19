"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, FileStack, ImageIcon, Loader2, Megaphone, Package, Pencil, Send, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  createProductBundle,
  getAllDrafts,
  publishDraft,
  deleteDraft,
  getAllSocialDrafts,
  deleteSocialDraft,
  activateSocialDraft,
  getAllAiArtifacts,
  deleteAiArtifact,
  type ProductDraft,
  type SocialDraft,
  type SellerAiArtifact,
  type SellerAiArtifactType,
  type BundleProduct,
  type BundleRecommendation,
  type CreateProductBundlePayload,
} from "@/lib/api/seller";
import { resolveCommerceImage } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function socialPlatformLabels(platforms: string[]) {
  const labels: Record<string, string> = {
    instagram: "Instagram",
    tiktok: "TikTok / Reels",
    twitter: "X",
  };
  return platforms.map((platform) => labels[platform] ?? platform).join(", ") || "Platform yok";
}

function socialDraftHeadline(draft: SocialDraft) {
  if (draft.content.instagram?.caption) return draft.content.instagram.caption;
  if (draft.content.tiktok?.hook) return draft.content.tiktok.hook;
  if (draft.content.twitter?.post) return draft.content.twitter.post;
  return "Sosyal medya içeriği hazır.";
}

function socialDraftMeta(draft: SocialDraft) {
  const tone = draft.tone || "Ton yok";
  const purpose = draft.purpose || "Amaç yok";
  return `${tone} · ${purpose} · ${socialPlatformLabels(draft.platforms ?? [])}`;
}

type Tab = "content" | "social" | "simulation" | "bundle" | "image";
type PreviewItem =
  | { type: "content"; item: ProductDraft }
  | { type: "social"; item: SocialDraft }
  | { type: "artifact"; item: SellerAiArtifact };

export function SellerDrafts() {
  const [tab, setTab] = useState<Tab>("content");
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [socialDrafts, setSocialDrafts] = useState<SocialDraft[]>([]);
  const [artifacts, setArtifacts] = useState<SellerAiArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewItem | null>(null);

  useEffect(() => {
    Promise.all([
      getAllDrafts().catch(() => []),
      getAllSocialDrafts().catch(() => []),
      getAllAiArtifacts().catch(() => []),
    ])
      .then(([d, s, a]) => {
        setDrafts(d);
        setSocialDrafts(s);
        setArtifacts(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const contentGroups = useMemo(() => {
    const map = new Map<string, ProductDraft[]>();
    for (const d of drafts) {
      const arr = map.get(d.commerceProductId) ?? [];
      arr.push(d);
      map.set(d.commerceProductId, arr);
    }
    return [...map.entries()];
  }, [drafts]);

  const socialGroups = useMemo(() => {
    const map = new Map<string, SocialDraft[]>();
    for (const d of socialDrafts) {
      const arr = map.get(d.commerceProductId) ?? [];
      arr.push(d);
      map.set(d.commerceProductId, arr);
    }
    return [...map.entries()];
  }, [socialDrafts]);

  async function handlePublish(d: ProductDraft) {
    setBusyId(d.id);
    try {
      await publishDraft(d.id, d.commerceProductId);
      toast.success("İçerik Akıllı Market'e yayınlandı");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yayınlama başarısız.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await deleteDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Kayıt silindi");
    } catch {
      toast.error("Silinemedi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleActivateSocial(id: string) {
    setBusyId(id);
    try {
      await activateSocialDraft(id);
      setSocialDrafts((prev) =>
        prev.map((d) => {
          const target = prev.find((x) => x.id === id);
          if (!target) return d;
          if (d.commerceProductId !== target.commerceProductId) return d;
          return { ...d, isActive: d.id === id };
        }),
      );
      toast.success("Aktif içerik güncellendi");
    } catch {
      toast.error("İşlem başarısız.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteSocial(id: string) {
    setBusyId(id);
    try {
      await deleteSocialDraft(id);
      setSocialDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Kayıt silindi");
    } catch {
      toast.error("Silinemedi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteArtifact(id: string) {
    setBusyId(id);
    try {
      await deleteAiArtifact(id);
      setArtifacts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Kayıt arşivlendi");
    } catch {
      toast.error("Silinemedi.");
    } finally {
      setBusyId(null);
    }
  }

  function handleUseSimulationArtifact(artifact: SellerAiArtifact) {
    saveSimulationArtifactForEdit(artifact);
  }

  async function handleApplyBundleRecommendation(
    artifact: SellerAiArtifact,
    recommendation: BundleRecommendation,
    publish: boolean,
  ) {
    const busyKey = `${artifact.id}:${recommendation.complementaryProduct.id}:${publish ? "publish" : "save"}`;
    setBusyId(busyKey);
    try {
      await createProductBundle(artifact.commerceProductId, bundleRecommendationPayload(recommendation, publish));
      toast.success(
        publish
          ? "Birlikte satış kampanyası mağazada yayına alındı."
          : "Birlikte satış kampanyası taslaklara kaydedildi.",
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kampanya uygulanamadı.";
      toast.error(message.includes("aktif bir paket zaten var") ? "Bu iki ürün için kampanya zaten var. Birlikte Sat ekranından düzenleyebilirsin." : message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const artifactByType = (type: SellerAiArtifactType) => artifacts.filter((a) => a.artifactType === type);
  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "content", label: "Ürün İçerikleri", count: drafts.length },
    { key: "social", label: "Sosyal İçerikler", count: socialDrafts.length },
    { key: "simulation", label: "Müşteri Simülasyonları", count: artifactByType("simulation").length },
    { key: "bundle", label: "Kampanya Önerileri", count: artifactByType("bundle_recommendation").length },
    { key: "image", label: "AI Görseller", count: artifactByType("image_generation").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <FileStack className="size-6 text-green-500" /> Kayıtlarım
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Hazırladığın ürün metinlerini, sosyal içerikleri, müşteri analizlerini ve görselleri buradan tekrar açıp kullanabilirsin.
        </p>
      </div>

      {/* Segmented tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-green-500 text-white"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            {t.key === "content" ? <FileStack className="size-4" /> :
              t.key === "social" ? <Megaphone className="size-4" /> :
              t.key === "simulation" ? <Bot className="size-4" /> :
              t.key === "bundle" ? <Package className="size-4" /> :
              <ImageIcon className="size-4" />}
            {t.label}
            <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.key ? "bg-white/20" : "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── İÇERİK & GÖRSEL ── */}
      {tab === "content" && (
        contentGroups.length === 0 ? (
          <EmptyState
            text="Henüz kayıtlı ürün içeriği yok. AI ile Düzenle ekranında içerik ürettiğinde burada görünür."
          />
        ) : (
          contentGroups.map(([productId, items]) => (
            <div key={productId} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold text-gray-700 dark:text-gray-200">{items[0].title || productId}</h2>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-400">
                  {items.length} kayıt
                </span>
                <Link
                  href={`/seller/product/${productId}/ai-edit`}
                  className="ml-auto flex cursor-pointer items-center gap-1 text-xs font-semibold text-gray-400 transition-colors hover:text-green-500"
                >
                  <Pencil className="size-3.5" /> Düzenle
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {items.map((d) => {
                  const thumb = d.images[0]?.url ? resolveCommerceImage(d.images[0].url) : null;
                  const busy = busyId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setPreview({ type: "content", item: d })}
                      className="flex cursor-pointer gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-green-500/30 hover:bg-green-500/5"
                    >
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (thumb) setLightboxSrc(thumb);
                        }}
                        className={`relative size-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-white/8 dark:bg-white/5 ${thumb ? "cursor-zoom-in" : ""}`}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={d.label} className="size-full object-contain p-1.5" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[10px] text-gray-300">Görsel yok</span>
                        )}
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{d.label}</span>
                          <span className="ml-auto shrink-0 text-[10px] text-gray-400">{formatDate(d.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{d.shortDescription || d.description}</p>
                        <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{formatPrice(d.price)}</p>

                        <div className="mt-auto flex gap-2 pt-3">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePublish(d);
                            }}
                            disabled={busy}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
                          >
                            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                            Yayınla
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(d.id);
                            }}
                            disabled={busy}
                            className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60 dark:border-white/10"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )
      )}

      {/* ── SOSYAL MEDYA ── */}
      {tab === "social" && (
        socialGroups.length === 0 ? (
          <EmptyState text="Henüz kayıtlı sosyal medya içeriği yok. Sosyal Medya İçeriği ekranında içerik ürettiğinde burada görünür." />
        ) : (
          socialGroups.map(([productId, items]) => (
            <div key={productId} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-green-500/10 text-green-700 dark:text-green-400">
                  <Megaphone className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-black text-foreground">{items[0].label || productId}</h2>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{productId}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-500/15 dark:text-green-400">
                  {items.length} kayıt
                </span>
                <Link
                  href={`/seller/product/${productId}/social`}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-black text-muted-foreground transition-colors hover:border-green-500/40 hover:text-green-600"
                >
                  <Pencil className="size-3.5" /> Aracı Aç
                </Link>
              </div>

              <div className="grid gap-4 p-5 xl:grid-cols-3">
                {items.map((d) => {
                  const busy = busyId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setPreview({ type: "social", item: d })}
                      className={`flex min-h-48 cursor-pointer flex-col rounded-2xl border p-4 transition hover:border-green-500/30 hover:bg-green-500/5 ${d.isActive ? "border-green-500 bg-green-500/5" : "border-border bg-background"}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                          <Megaphone className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-foreground">{d.label}</span>
                          <span className="mt-0.5 block text-[10px] font-bold uppercase text-muted-foreground">{formatDate(d.createdAt)}</span>
                        </div>
                        {d.isActive && (
                          <span className="shrink-0 rounded-full bg-green-500 px-2 py-1 text-[10px] font-black text-white">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{socialDraftHeadline(d)}</p>
                      <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">{socialDraftMeta(d)}</p>
                      <div className="mt-auto flex gap-2 pt-2">
                        {!d.isActive && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleActivateSocial(d.id);
                            }}
                            disabled={busy}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-green-500 px-3 py-2 text-xs font-black text-green-700 transition-colors hover:bg-green-500/10 disabled:opacity-60 dark:text-green-400"
                          >
                            {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                            Aktif Et
                          </button>
                        )}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteSocial(d.id);
                          }}
                          disabled={busy}
                          className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60 dark:border-white/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )
      )}

      {tab === "simulation" && (
        <ArtifactGrid
          artifacts={artifactByType("simulation")}
          emptyText="Henüz müşteri simülasyonu kaydı yok. Bir ürünün simülasyon ekranını çalıştırınca sonuç burada tekrar kullanım için saklanır."
          busyId={busyId}
          onDelete={handleDeleteArtifact}
          onOpen={(item) => setPreview({ type: "artifact", item })}
          onUseSimulation={handleUseSimulationArtifact}
        />
      )}

      {tab === "bundle" && (
        <ArtifactGrid
          artifacts={artifactByType("bundle_recommendation")}
          emptyText="Henüz kayıtlı birlikte satış kampanyası yok. Birlikte Sat ekranında öneri ürettiğinde burada anlaşılır kampanya kayıtları olarak görünür."
          busyId={busyId}
          onDelete={handleDeleteArtifact}
          onOpen={(item) => setPreview({ type: "artifact", item })}
          onUseSimulation={handleUseSimulationArtifact}
        />
      )}

      {tab === "image" && (
        <ArtifactGrid
          artifacts={artifactByType("image_generation")}
          emptyText="Henüz AI görsel kaydı yok. AI ile Düzenle ekranında görsel ürettiğinde burada saklanır."
          busyId={busyId}
          onDelete={handleDeleteArtifact}
          onPreview={setLightboxSrc}
          onOpen={(item) => setPreview({ type: "artifact", item })}
          onUseSimulation={handleUseSimulationArtifact}
        />
      )}

      <PreviewSheet
        preview={preview}
        busyId={busyId}
        onClose={() => setPreview(null)}
        onPublish={handlePublish}
        onDeleteContent={handleDelete}
        onActivateSocial={handleActivateSocial}
        onDeleteSocial={handleDeleteSocial}
        onDeleteArtifact={handleDeleteArtifact}
        onImagePreview={setLightboxSrc}
        onUseSimulation={handleUseSimulationArtifact}
        onApplyBundleRecommendation={handleApplyBundleRecommendation}
      />

      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute right-5 top-5 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Önizleme"
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

function payloadRecord(artifact: SellerAiArtifact): Record<string, unknown> {
  return typeof artifact.payload === "object" && artifact.payload !== null
    ? artifact.payload as Record<string, unknown>
    : {};
}

function arrayValue(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null) : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function bundleProductValue(value: unknown): BundleProduct {
  const record = recordValue(value);
  return {
    id: stringValue(record.id, ""),
    title: stringValue(record.title, "Ürün"),
    brand: stringValue(record.brand, ""),
    category: stringValue(record.category, ""),
    price: numberValue(record.price),
    stock: numberValue(record.stock),
    image: stringValue(record.image, ""),
  };
}

function bundleRecommendationValue(value: unknown): BundleRecommendation | null {
  const record = recordValue(value);
  const primaryProduct = bundleProductValue(record.primaryProduct);
  const complementaryProduct = bundleProductValue(record.complementaryProduct);
  if (!primaryProduct.id || !complementaryProduct.id) return null;

  return {
    primaryProduct,
    complementaryProduct,
    suggestedTitle: stringValue(record.suggestedTitle, "Birlikte Sat Kampanyası"),
    suggestedShortDescription: stringValue(record.suggestedShortDescription, "Bu iki ürün birlikte sunulabilir."),
    suggestedCampaignText: stringValue(record.suggestedCampaignText, "İkisini birlikte al, avantajlı fiyatı yakala."),
    suggestedCtaLabel: stringValue(record.suggestedCtaLabel, "Paketi Sepete Ekle"),
    suggestedDiscountPercent: numberValue(record.suggestedDiscountPercent, 5),
    recommendationReason: stringValue(record.recommendationReason, "Ürünler aynı alışveriş ihtiyacını tamamlıyor."),
    score: numberValue(record.score),
    originalTotal: numberValue(record.originalTotal, primaryProduct.price + complementaryProduct.price),
    discountAmount: numberValue(record.discountAmount),
    bundleTotal: numberValue(record.bundleTotal, primaryProduct.price + complementaryProduct.price),
  };
}

function bundleRecommendations(artifact: SellerAiArtifact) {
  return arrayValue(payloadRecord(artifact).recommendations)
    .map(bundleRecommendationValue)
    .filter((item): item is BundleRecommendation => item !== null);
}

function bundleRecommendationPayload(
  recommendation: BundleRecommendation,
  publish: boolean,
): CreateProductBundlePayload {
  return {
    complementaryProductId: recommendation.complementaryProduct.id,
    title: recommendation.suggestedTitle,
    shortDescription: recommendation.suggestedShortDescription,
    campaignText: recommendation.suggestedCampaignText,
    ctaLabel: recommendation.suggestedCtaLabel,
    discountPercent: recommendation.suggestedDiscountPercent,
    recommendationReason: recommendation.recommendationReason,
    score: recommendation.score,
    publish,
  };
}

function simulationPersonas(artifact: SellerAiArtifact) {
  return arrayValue(payloadRecord(artifact).personas);
}

function simulationCounts(personas: Record<string, unknown>[]) {
  return {
    buy: personas.filter((p) => p.decision === "buy").length,
    skip: personas.filter((p) => p.decision === "skip").length,
    undecided: personas.filter((p) => p.decision === "undecided").length,
  };
}

function decisionLabel(decision: unknown) {
  if (decision === "buy") return "Satın alır";
  if (decision === "skip") return "Vazgeçer";
  if (decision === "undecided") return "Kararsız";
  return "-";
}

function buildSimulationInsightFromPersonas(personas: Record<string, unknown>[]) {
  const skippers = personas.filter((p) => p.decision === "skip");
  const undecided = personas.filter((p) => p.decision === "undecided");
  const counts = simulationCounts(personas);
  return {
    buyCount: counts.buy,
    skipCount: counts.skip,
    undecidedCount: counts.undecided,
    skipperReasons: skippers.map((p) => `${stringValue(p.name, "Müşteri")} (${stringValue(p.segment, "Segment")}): ${stringValue(p.reason, "")}`),
    undecidedConcerns: undecided.map((p) => `${stringValue(p.name, "Müşteri")} (${stringValue(p.segment, "Segment")}): ${stringValue(p.reason, "")}`),
    recommendations: personas.map((p) => stringValue(p.recommendation, "")).filter(Boolean),
  };
}

function saveSimulationArtifactForEdit(artifact: SellerAiArtifact) {
  if (artifact.artifactType !== "simulation") return;
  const personas = simulationPersonas(artifact);
  if (personas.length === 0) return;
  try {
    const payload = JSON.stringify({ personas });
    sessionStorage.setItem(`zekai_sim_${artifact.commerceProductId}`, payload);
    localStorage.setItem(`zekai_sim_last_${artifact.commerceProductId}`, payload);
  } catch {
    // Storage unavailable olursa navigasyonu engelleme.
  }
}

function artifactHref(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "simulation") return `/seller/product/${artifact.commerceProductId}/simulation`;
  if (artifact.artifactType === "bundle_recommendation") return `/seller/product/${artifact.commerceProductId}/bundles`;
  return `/seller/product/${artifact.commerceProductId}/ai-edit`;
}

function artifactActionHref(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "simulation") return `/seller/product/${artifact.commerceProductId}/ai-edit?from=simulation`;
  return artifactHref(artifact);
}

function artifactIcon(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "simulation") return <Bot className="size-4 text-green-500" />;
  if (artifact.artifactType === "bundle_recommendation") return <Package className="size-4 text-lime-600" />;
  return <ImageIcon className="size-4 text-green-500" />;
}

function artifactDisplayTitle(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "bundle_recommendation") return "Birlikte Sat Kampanyası";
  return artifact.label;
}

function artifactKindLabel(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "bundle_recommendation") return "Kayıtlı kampanya önerisi";
  if (artifact.artifactType === "simulation") return "Müşteri simülasyonu";
  if (artifact.artifactType === "image_generation") return "Ürün görseli";
  return "Kayıt";
}

function artifactSummary(artifact: SellerAiArtifact) {
  const payload = payloadRecord(artifact);
  if (artifact.artifactType === "simulation") {
    const personas = arrayValue(payload.personas);
    const counts = simulationCounts(personas);
    const firstConcern = personas.find((p) => p.decision === "skip" || p.decision === "undecided");
    const reason = stringValue(firstConcern?.reason, "");
    return `${personas.length} müşteri · ${counts.buy} alır · ${counts.skip} vazgeçer · ${counts.undecided} kararsız${reason ? ` · ${reason}` : ""}`;
  }
  if (artifact.artifactType === "bundle_recommendation") {
    const recommendations = bundleRecommendations(artifact);
    const first = recommendations[0];
    if (!first) return "Kayıtlı kampanya önerisi yok";
    return `${recommendations.length} hazır kampanya · ${first.primaryProduct.title} + ${first.complementaryProduct.title} · ${formatPrice(first.bundleTotal)}`;
  }
  const images = arrayValue(payload.images);
  const style = typeof payload.description === "string" ? payload.description : images[0]?.label;
  return `${images.length || 1} görsel${typeof style === "string" ? ` · ${style}` : ""}`;
}

function imagePreviewSrc(artifact: SellerAiArtifact) {
  const payload = payloadRecord(artifact);
  const singleBase64 = typeof payload.imageBase64 === "string" ? payload.imageBase64 : null;
  const singleMime = typeof payload.mimeType === "string" ? payload.mimeType : "image/png";
  if (singleBase64) return `data:${singleMime};base64,${singleBase64}`;
  const firstImage = arrayValue(payload.images)[0];
  const imageBase64 = typeof firstImage?.imageBase64 === "string" ? firstImage.imageBase64 : null;
  const mimeType = typeof firstImage?.mimeType === "string" ? firstImage.mimeType : "image/png";
  return imageBase64 ? `data:${mimeType};base64,${imageBase64}` : null;
}

function ArtifactGrid({
  artifacts,
  emptyText,
  busyId,
  onDelete,
  onPreview,
  onOpen,
  onUseSimulation,
}: {
  artifacts: SellerAiArtifact[];
  emptyText: string;
  busyId: string | null;
  onDelete: (id: string) => void;
  onPreview?: (src: string) => void;
  onOpen: (artifact: SellerAiArtifact) => void;
  onUseSimulation?: (artifact: SellerAiArtifact) => void;
}) {
  if (artifacts.length === 0) return <EmptyState text={emptyText} />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {artifacts.map((artifact) => {
        const preview = artifact.artifactType === "image_generation" ? imagePreviewSrc(artifact) : null;
        const busy = busyId === artifact.id;
        return (
          <div
            key={artifact.id}
            onClick={() => onOpen(artifact)}
            className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition hover:border-green-500/30 hover:bg-green-500/5"
          >
            <div className="flex items-start gap-3">
              {preview ? (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onPreview?.(preview);
                  }}
                  className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={artifact.label} className="size-full object-contain p-1.5" />
                </button>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {artifactIcon(artifact)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-100">{artifactDisplayTitle(artifact)}</p>
                  <span className="ml-auto shrink-0 text-[10px] text-gray-400">{formatDate(artifact.updatedAt)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{artifactSummary(artifact)}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase text-gray-400">
                  {artifactKindLabel(artifact)} · tekrar kullanılabilir
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {artifact.artifactType === "simulation" && (
                <Link
                  onClick={(event) => {
                    event.stopPropagation();
                    onUseSimulation?.(artifact);
                  }}
                  href={artifactActionHref(artifact)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-600"
                >
                  <Sparkles className="size-3.5" />
                  AI ile düzenle
                </Link>
              )}
              {artifact.artifactType === "bundle_recommendation" ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(artifact);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/8"
                >
                  <Pencil className="size-3.5" />
                  Kampanyaları İncele
                </button>
              ) : (
                <Link
                  onClick={(event) => event.stopPropagation()}
                  href={artifactHref(artifact)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/8"
                >
                  <Pencil className="size-3.5" />
                  Aç
                </Link>
              )}
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(artifact.id);
                }}
                disabled={busy}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60 dark:border-white/10"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PreviewSheet({
  preview,
  busyId,
  onClose,
  onPublish,
  onDeleteContent,
  onActivateSocial,
  onDeleteSocial,
  onDeleteArtifact,
  onImagePreview,
  onUseSimulation,
  onApplyBundleRecommendation,
}: {
  preview: PreviewItem | null;
  busyId: string | null;
  onClose: () => void;
  onPublish: (draft: ProductDraft) => void;
  onDeleteContent: (id: string) => void;
  onActivateSocial: (id: string) => void;
  onDeleteSocial: (id: string) => void;
  onDeleteArtifact: (id: string) => void;
  onImagePreview: (src: string) => void;
  onUseSimulation: (artifact: SellerAiArtifact) => void;
  onApplyBundleRecommendation: (artifact: SellerAiArtifact, recommendation: BundleRecommendation, publish: boolean) => void;
}) {
  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <button type="button" aria-label="Önizlemeyi kapat" className="absolute inset-0 cursor-default" onClick={onClose} />
      <aside className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-600 dark:text-green-400">Önizleme</p>
            <h2 className="mt-1 text-2xl font-black text-foreground">{previewTitle(preview)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{previewSubtitle(preview)}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted" aria-label="Kapat">
            <X className="size-5" />
          </button>
        </div>

        {preview.type === "content" && (
          <ProductDraftPreview
            draft={preview.item}
            busy={busyId === preview.item.id}
            onPublish={() => onPublish(preview.item)}
            onDelete={() => onDeleteContent(preview.item.id)}
            onImagePreview={onImagePreview}
          />
        )}

        {preview.type === "social" && (
          <SocialDraftPreview
            draft={preview.item}
            busy={busyId === preview.item.id}
            onActivate={() => onActivateSocial(preview.item.id)}
            onDelete={() => onDeleteSocial(preview.item.id)}
          />
        )}

        {preview.type === "artifact" && (
          <ArtifactPreview
            artifact={preview.item}
            busy={busyId === preview.item.id || Boolean(busyId?.startsWith(`${preview.item.id}:`))}
            onDelete={() => onDeleteArtifact(preview.item.id)}
            onImagePreview={onImagePreview}
            onUseSimulation={() => onUseSimulation(preview.item)}
            onApplyBundleRecommendation={(recommendation, publish) => onApplyBundleRecommendation(preview.item, recommendation, publish)}
          />
        )}
      </aside>
    </div>
  );
}

function previewTitle(preview: PreviewItem) {
  if (preview.type === "content") return preview.item.title || preview.item.label;
  if (preview.type === "social") return preview.item.label;
  return artifactDisplayTitle(preview.item);
}

function previewSubtitle(preview: PreviewItem) {
  if (preview.type === "content") return `${formatDate(preview.item.createdAt)} · ${formatPrice(preview.item.price)}`;
  if (preview.type === "social") return `${formatDate(preview.item.createdAt)} · ${preview.item.platforms.join(", ") || "Platform yok"}`;
  return `${formatDate(preview.item.updatedAt)} · ${artifactKindLabel(preview.item)}`;
}

function ProductDraftPreview({
  draft,
  busy,
  onPublish,
  onDelete,
  onImagePreview,
}: {
  draft: ProductDraft;
  busy: boolean;
  onPublish: () => void;
  onDelete: () => void;
  onImagePreview: (src: string) => void;
}) {
  const image = draft.images[0]?.url ? resolveCommerceImage(draft.images[0].url) : null;
  const features = Object.entries(draft.features ?? {});
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => image && onImagePreview(image)}
            className={`relative size-28 shrink-0 overflow-hidden rounded-xl bg-muted ${image ? "cursor-zoom-in" : ""}`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={draft.title} className="size-full object-contain p-2" />
            ) : (
              <span className="flex size-full items-center justify-center text-xs text-muted-foreground">Görsel yok</span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">{draft.brand || "Marka yok"}</p>
            <p className="mt-1 text-lg font-black leading-snug text-foreground">{draft.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{draft.shortDescription}</p>
            <p className="mt-3 text-xl font-black text-green-600 dark:text-green-400">{formatPrice(draft.price)}</p>
          </div>
        </div>
      </div>

      <PreviewBlock title="Açıklama">
        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{draft.description || "Açıklama yok."}</p>
      </PreviewBlock>

      <PreviewBlock title="Özellikler">
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground">Özellik yok.</p>
        ) : (
          <div className="grid gap-2">
            {features.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[130px_1fr] rounded-xl border border-border bg-background text-sm">
                <span className="border-r border-border px-3 py-2 font-semibold text-foreground">{Number.isNaN(Number(key)) ? key : `Özellik ${Number(key) + 1}`}</span>
                <span className="px-3 py-2 text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
      </PreviewBlock>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <button onClick={onPublish} disabled={busy} className="h-11 rounded-xl bg-green-500 text-sm font-black text-white hover:bg-green-600 disabled:opacity-60">
          {busy ? "Yayınlanıyor..." : "Akıllı Market'e Yayınla"}
        </button>
        <button onClick={onDelete} disabled={busy} className="h-11 rounded-xl border border-red-500/30 px-5 text-sm font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60">
          Sil
        </button>
      </div>
    </div>
  );
}

function SocialDraftPreview({
  draft,
  busy,
  onActivate,
  onDelete,
}: {
  draft: SocialDraft;
  busy: boolean;
  onActivate: () => void;
  onDelete: () => void;
}) {
  const content = draft.content;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Ton" value={draft.tone} />
        <MiniStat label="Amaç" value={draft.purpose} />
        <MiniStat label="Durum" value={draft.isActive ? "Aktif" : "Kayıtlı"} />
      </div>

      {content.instagram && (
        <PreviewBlock title="Instagram">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{formatInstagramContent(content.instagram)}</p>
        </PreviewBlock>
      )}
      {content.tiktok && (
        <PreviewBlock title="TikTok / Reels">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{formatTiktokContent(content.tiktok)}</p>
        </PreviewBlock>
      )}
      {content.twitter && (
        <PreviewBlock title="X">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{formatTwitterContent(content.twitter)}</p>
        </PreviewBlock>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        {!draft.isActive && (
          <button onClick={onActivate} disabled={busy} className="h-11 rounded-xl bg-green-500 text-sm font-black text-white hover:bg-green-600 disabled:opacity-60">
            {busy ? "Güncelleniyor..." : "Aktif Et"}
          </button>
        )}
        <button onClick={onDelete} disabled={busy} className="h-11 rounded-xl border border-red-500/30 px-5 text-sm font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60">
          Sil
        </button>
      </div>
    </div>
  );
}

function ArtifactPreview({
  artifact,
  busy,
  onDelete,
  onImagePreview,
  onUseSimulation,
  onApplyBundleRecommendation,
}: {
  artifact: SellerAiArtifact;
  busy: boolean;
  onDelete: () => void;
  onImagePreview: (src: string) => void;
  onUseSimulation: () => void;
  onApplyBundleRecommendation: (recommendation: BundleRecommendation, publish: boolean) => void;
}) {
  const payload = payloadRecord(artifact);
  const image = artifact.artifactType === "image_generation" ? imagePreviewSrc(artifact) : null;
  const personas = artifact.artifactType === "simulation" ? arrayValue(payload.personas) : [];
  const recommendations = artifact.artifactType === "bundle_recommendation" ? bundleRecommendations(artifact) : [];
  const counts = simulationCounts(personas);
  const insight = artifact.artifactType === "simulation" ? buildSimulationInsightFromPersonas(personas) : null;

  if (artifact.artifactType === "simulation") {
    const objections = [...(insight?.skipperReasons ?? []), ...(insight?.undecidedConcerns ?? [])].slice(0, 3);
    const topRecommendations = (insight?.recommendations ?? []).slice(0, 4);

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-green-500/20 bg-green-500/8 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
              <Bot className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-foreground">Bu simülasyon satıcıya ne söylüyor?</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {personas.length} müşteri profili ürün sayfasını inceledi. {counts.buy} kişi satın almaya yakın,
                {counts.skip > 0 ? ` ${counts.skip} kişi vazgeçiyor,` : ""} {counts.undecided} kişi kararsız kalıyor.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Satın alır" value={String(counts.buy)} />
          <MiniStat label="Vazgeçer" value={String(counts.skip)} />
          <MiniStat label="Kararsız" value={String(counts.undecided)} />
        </div>

        {objections.length > 0 && (
          <PreviewBlock title="Satışa Engel Olan Noktalar">
            <div className="space-y-2">
              {objections.map((reason, index) => (
                <p key={index} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {reason}
                </p>
              ))}
            </div>
          </PreviewBlock>
        )}

        {topRecommendations.length > 0 && (
          <PreviewBlock title="AI Düzenlemede Kullanılacak İpuçları">
            <div className="space-y-2">
              {topRecommendations.map((item, index) => (
                <div key={index} className="flex gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
                  <Sparkles className="mt-1 size-3.5 shrink-0 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </PreviewBlock>
        )}

        <PreviewBlock title="Müşteri Tepkileri">
          <div className="space-y-3">
            {personas.map((persona, index) => (
              <div key={index} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{stringValue(persona.name, `Müşteri ${index + 1}`)}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{stringValue(persona.segment, "")}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">{decisionLabel(persona.decision)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stringValue(persona.reason, "")}</p>
              </div>
            ))}
          </div>
        </PreviewBlock>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Link
            href={artifactActionHref(artifact)}
            onClick={onUseSimulation}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-black text-white hover:bg-green-600"
          >
            <Sparkles className="size-4" />
            Bu sonuca göre AI ile düzenle
          </Link>
          <button onClick={onDelete} disabled={busy} className="h-11 rounded-xl border border-red-500/30 px-5 text-sm font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60">
            Sil
          </button>
        </div>
      </div>
    );
  }

  if (artifact.artifactType === "bundle_recommendation") {
    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-lime-500/20 bg-lime-500/8 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-gray-950">
              <Package className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-foreground">Kayıtlı birlikte satış kampanyaları</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Bu kayıt, ürününle birlikte satılabilecek hazır kampanya önerilerini içerir. Beğendiğin öneriyi taslak olarak kaydedebilir veya doğrudan mağazada yayınlayabilirsin.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Hazır kampanya" value={String(recommendations.length)} />
          <MiniStat label="Durum" value={artifact.status === "ready" ? "Kullanıma hazır" : "Kayıtlı"} />
          <MiniStat label="Son güncelleme" value={formatDate(artifact.updatedAt)} />
        </div>

        {recommendations.length > 0 ? (
          <PreviewBlock title="Kampanya Önerileri">
            <div className="space-y-4">
              {recommendations.map((item) => (
                <BundleRecommendationCard
                  key={`${item.primaryProduct.id}-${item.complementaryProduct.id}`}
                  recommendation={item}
                  saving={busy}
                  onSave={() => onApplyBundleRecommendation(item, false)}
                  onPublish={() => onApplyBundleRecommendation(item, true)}
                />
              ))}
            </div>
          </PreviewBlock>
        ) : (
          <PreviewBlock title="Kampanya Önerileri">
            <p className="text-sm text-muted-foreground">Bu kayıtta uygulanabilir kampanya önerisi bulunamadı.</p>
          </PreviewBlock>
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Link
            href={artifactHref(artifact)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-black text-foreground hover:bg-muted"
          >
            <Pencil className="size-4" />
            Birlikte Sat ekranında düzenle
          </Link>
          <button onClick={onDelete} disabled={busy} className="h-11 rounded-xl border border-red-500/30 px-5 text-sm font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60">
            Sil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Kayıt" value={artifactKindLabel(artifact)} />
        <MiniStat label="Durum" value={artifact.status === "ready" ? "Kullanıma hazır" : "Kayıtlı"} />
        <MiniStat label="Son güncelleme" value={formatDate(artifact.updatedAt)} />
      </div>

      {image && (
        <button type="button" onClick={() => onImagePreview(image)} className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={artifact.label} className="size-full object-contain p-4" />
        </button>
      )}

      {personas.length > 0 && (
        <PreviewBlock title="Müşteri Simülasyonu">
          <div className="space-y-3">
            {personas.map((persona, index) => (
              <div key={index} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-foreground">{stringValue(persona.name, `Persona ${index + 1}`)}</p>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">{stringValue(persona.decision, "-")}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stringValue(persona.reason, "")}</p>
              </div>
            ))}
          </div>
        </PreviewBlock>
      )}

      {!image && personas.length === 0 && recommendations.length === 0 && (
        <PreviewBlock title="Kayıt Detayı">
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-5 text-muted-foreground">{JSON.stringify(payload, null, 2)}</pre>
        </PreviewBlock>
      )}

      <button onClick={onDelete} disabled={busy} className="h-11 w-full rounded-xl border border-red-500/30 px-5 text-sm font-black text-red-600 hover:bg-red-500/10 disabled:opacity-60">
        Sil
      </button>
    </div>
  );
}

function BundleRecommendationCard({
  recommendation,
  saving,
  onSave,
  onPublish,
}: {
  recommendation: BundleRecommendation;
  saving: boolean;
  onSave: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="text-base font-black text-foreground">{recommendation.suggestedTitle}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.recommendationReason}</p>
        </div>
        <div className="rounded-xl bg-muted px-4 py-3 text-right">
          <p className="text-xs font-bold text-muted-foreground line-through">{formatPrice(recommendation.originalTotal)}</p>
          <p className="text-lg font-black text-foreground">{formatPrice(recommendation.bundleTotal)}</p>
          <p className="text-xs font-bold text-lime-700 dark:text-lime-300">%{recommendation.suggestedDiscountPercent} indirim</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <BundleProductMini product={recommendation.primaryProduct} />
        <span className="hidden text-center text-2xl font-light text-lime-600 sm:block">+</span>
        <BundleProductMini product={recommendation.complementaryProduct} />
      </div>

      <div className="mt-4 rounded-xl border border-lime-500/20 bg-lime-500/8 px-4 py-3">
        <p className="text-xs font-bold text-muted-foreground">Mağazada görünecek kampanya metni</p>
        <p className="mt-1 text-sm font-black text-foreground">{recommendation.suggestedCampaignText}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="h-11 rounded-xl border border-border text-sm font-black text-foreground hover:bg-muted disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Taslak Olarak Kaydet"}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="h-11 rounded-xl bg-lime-400 text-sm font-black text-gray-950 hover:bg-lime-300 disabled:opacity-60"
        >
          {saving ? "Uygulanıyor..." : "Mağazada Yayınla"}
        </button>
      </div>
    </div>
  );
}

function BundleProductMini({ product }: { product: BundleProduct }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.title} className="size-full object-contain p-1.5" />
        ) : (
          <Package className="m-4 size-6 text-muted-foreground/40" />
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-bold text-foreground">{product.title}</p>
        <p className="text-sm font-black text-lime-700 dark:text-lime-300">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-black text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-foreground">{value || "-"}</p>
    </div>
  );
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function formatInstagramContent(content: NonNullable<SocialDraft["content"]["instagram"]>) {
  return [content.caption, (content.hashtags ?? []).join(" "), content.cta, content.overlayText].filter(Boolean).join("\n\n");
}

function formatTiktokContent(content: NonNullable<SocialDraft["content"]["tiktok"]>) {
  return [
    `Hook: ${content.hook}`,
    ...(content.scenes ?? []).map((scene) => `${scene.title}: ${scene.description}`),
    `Caption: ${content.caption}`,
    `Hashtagler: ${(content.hashtags ?? []).join(" ")}`,
  ].filter(Boolean).join("\n");
}

function formatTwitterContent(content: NonNullable<SocialDraft["content"]["twitter"]>) {
  return [content.post, (content.hashtags ?? []).join(" "), content.cta].filter(Boolean).join("\n\n");
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
      <FileStack className="size-10 text-gray-300" />
      <p className="max-w-md text-sm text-gray-400">{text}</p>
      <Link href="/seller/products" className="cursor-pointer text-sm font-semibold text-green-600 hover:underline dark:text-green-400">
        Ürünlerime git
      </Link>
    </div>
  );
}
