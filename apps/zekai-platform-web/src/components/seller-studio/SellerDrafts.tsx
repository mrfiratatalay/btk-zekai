"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileStack, Loader2, Pencil, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  getAllDrafts,
  publishDraft,
  deleteDraft,
  type ProductDraft,
} from "@/lib/api/seller";
import { resolveCommerceImage } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function SellerDrafts() {
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    getAllDrafts()
      .then(setDrafts)
      .catch(() => toast.error("Taslaklar yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  // Ürün başına grupla (çoklu varyasyon)
  const groups = useMemo(() => {
    const map = new Map<string, ProductDraft[]>();
    for (const d of drafts) {
      const arr = map.get(d.commerceProductId) ?? [];
      arr.push(d);
      map.set(d.commerceProductId, arr);
    }
    return [...map.entries()];
  }, [drafts]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <FileStack className="size-6 text-violet-500" /> Taslaklarım
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          AI ile ürettiğin içerik DB&apos;de saklanır. İstediğin varyasyonu tek tıkla yayınla — tekrar AI ücreti ödemezsin.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <FileStack className="size-10 text-gray-300" />
          <p className="text-sm text-gray-400">Henüz taslak yok. &ldquo;AI ile Düzenle&rdquo; ekranından &ldquo;Taslak Kaydet&rdquo; ile oluşturabilirsin.</p>
          <Link href="/seller/products" className="cursor-pointer text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400">
            Ürünlerime git
          </Link>
        </div>
      ) : (
        groups.map(([productId, items]) => (
          <div key={productId} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-gray-700 dark:text-gray-200">{items[0].title || productId}</h2>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                {items.length} taslak
              </span>
              <Link
                href={`/seller/product/${productId}/ai-edit`}
                className="ml-auto flex cursor-pointer items-center gap-1 text-xs font-semibold text-gray-400 transition-colors hover:text-violet-500"
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
