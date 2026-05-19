"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, FileStack, ImageIcon, Loader2, Megaphone, Package, Pencil, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
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
} from "@/lib/api/seller";
import { resolveCommerceImage } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

type Tab = "content" | "social" | "simulation" | "bundle" | "image";

export function SellerDrafts() {
  const [tab, setTab] = useState<Tab>("content");
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [socialDrafts, setSocialDrafts] = useState<SocialDraft[]>([]);
  const [artifacts, setArtifacts] = useState<SellerAiArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
      toast.success("Taslak Akıllı Market'e yayınlandı — AI ücreti alınmadı");
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
      toast.success("Taslak silindi");
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
      toast.success("Taslak silindi");
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
      toast.success("AI çıktısı arşivlendi");
    } catch {
      toast.error("Silinemedi.");
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
    { key: "content", label: "Ürün Taslakları", count: drafts.length },
    { key: "social", label: "Sosyal İçerikler", count: socialDrafts.length },
    { key: "simulation", label: "Müşteri Simülasyonları", count: artifactByType("simulation").length },
    { key: "bundle", label: "Paket Önerileri", count: artifactByType("bundle_recommendation").length },
    { key: "image", label: "AI Görseller", count: artifactByType("image_generation").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <FileStack className="size-6 text-green-500" /> Taslaklarım
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
            text="Henüz içerik taslağı yok. “AI ile Düzenle” ekranından “Taslak Kaydet” ile oluşturabilirsin."
          />
        ) : (
          contentGroups.map(([productId, items]) => (
            <div key={productId} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold text-gray-700 dark:text-gray-200">{items[0].title || productId}</h2>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-400">
                  {items.length} taslak
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
                    <div key={d.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                      <button
                        onClick={() => thumb && setLightboxSrc(thumb)}
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
                            onClick={() => handlePublish(d)}
                            disabled={busy}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-60"
                          >
                            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                            Yayınla
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
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
          <EmptyState text="Henüz sosyal medya taslağı yok. “Sosyal Medya İçeriği” ekranından “Taslak Olarak Kaydet” ile oluşturabilirsin." />
        ) : (
          socialGroups.map(([productId, items]) => (
            <div key={productId} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold text-gray-700 dark:text-gray-200">{productId}</h2>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-400">
                  {items.length} taslak
                </span>
                <Link
                  href={`/seller/product/${productId}/social`}
                  className="ml-auto flex cursor-pointer items-center gap-1 text-xs font-semibold text-gray-400 transition-colors hover:text-green-500"
                >
                  <Pencil className="size-3.5" /> Düzenle
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {items.map((d) => {
                  const busy = busyId === d.id;
                  return (
                    <div
                      key={d.id}
                      className={`flex flex-col gap-2 rounded-2xl border p-4 ${d.isActive ? "border-green-500 bg-green-500/5" : "border-border bg-card"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{d.label}</span>
                        {d.isActive && (
                          <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                            Aktif
                          </span>
                        )}
                        <span className="ml-auto shrink-0 text-[10px] text-gray-400">{formatDate(d.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {d.tone} · {d.purpose} · {(d.platforms ?? []).join(", ") || "—"}
                      </p>
                      <div className="mt-auto flex gap-2 pt-2">
                        {!d.isActive && (
                          <button
                            onClick={() => handleActivateSocial(d.id)}
                            disabled={busy}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-green-500 px-3 py-2 text-xs font-bold text-green-700 transition-colors hover:bg-green-500/10 disabled:opacity-60 dark:text-green-400"
                          >
                            {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                            Aktif Et
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSocial(d.id)}
                          disabled={busy}
                          className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60 dark:border-white/10"
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
          emptyText="Henüz müşteri simülasyonu kaydı yok. Bir ürünün simülasyon ekranını çalıştırınca sonuç burada ücretsiz tekrar kullanım için saklanır."
          busyId={busyId}
          onDelete={handleDeleteArtifact}
        />
      )}

      {tab === "bundle" && (
        <ArtifactGrid
          artifacts={artifactByType("bundle_recommendation")}
          emptyText="Henüz bundle önerisi yok. Birlikte Sat ekranında Gemini ile paket önerisi ürettiğinde burada saklanır."
          busyId={busyId}
          onDelete={handleDeleteArtifact}
        />
      )}

      {tab === "image" && (
        <ArtifactGrid
          artifacts={artifactByType("image_generation")}
          emptyText="Henüz AI görsel kaydı yok. AI ile Düzenle ekranında görsel ürettiğinde burada saklanır."
          busyId={busyId}
          onDelete={handleDeleteArtifact}
          onPreview={setLightboxSrc}
        />
      )}

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

function artifactHref(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "simulation") return `/seller/product/${artifact.commerceProductId}/simulation`;
  if (artifact.artifactType === "bundle_recommendation") return `/seller/product/${artifact.commerceProductId}/bundles`;
  return `/seller/product/${artifact.commerceProductId}/ai-edit`;
}

function artifactIcon(artifact: SellerAiArtifact) {
  if (artifact.artifactType === "simulation") return <Bot className="size-4 text-green-500" />;
  if (artifact.artifactType === "bundle_recommendation") return <Package className="size-4 text-lime-600" />;
  return <ImageIcon className="size-4 text-green-500" />;
}

function artifactSummary(artifact: SellerAiArtifact) {
  const payload = payloadRecord(artifact);
  if (artifact.artifactType === "simulation") {
    const personas = arrayValue(payload.personas);
    const buy = personas.filter((p) => p.decision === "buy").length;
    const skip = personas.filter((p) => p.decision === "skip").length;
    const undecided = personas.filter((p) => p.decision === "undecided").length;
    return `${personas.length} persona · ${buy} alır · ${skip} vazgeçer · ${undecided} kararsız`;
  }
  if (artifact.artifactType === "bundle_recommendation") {
    const recommendations = arrayValue(payload.recommendations);
    const first = recommendations[0]?.suggestedTitle;
    return `${recommendations.length} paket önerisi${typeof first === "string" ? ` · ${first}` : ""}`;
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
}: {
  artifacts: SellerAiArtifact[];
  emptyText: string;
  busyId: string | null;
  onDelete: (id: string) => void;
  onPreview?: (src: string) => void;
}) {
  if (artifacts.length === 0) return <EmptyState text={emptyText} />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {artifacts.map((artifact) => {
        const preview = artifact.artifactType === "image_generation" ? imagePreviewSrc(artifact) : null;
        const busy = busyId === artifact.id;
        return (
          <div key={artifact.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              {preview ? (
                <button
                  onClick={() => onPreview?.(preview)}
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
                  <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-100">{artifact.label}</p>
                  <span className="ml-auto shrink-0 text-[10px] text-gray-400">{formatDate(artifact.updatedAt)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{artifactSummary(artifact)}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase text-gray-400">
                  {artifact.source === "gemini" ? "Gemini" : artifact.source} · ücretsiz tekrar kullanım
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={artifactHref(artifact)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/8"
              >
                <Pencil className="size-3.5" />
                Aç
              </Link>
              <button
                onClick={() => onDelete(artifact.id)}
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
