"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderOpen, Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { Button } from "@/components/ui/button";
import { useKombinsStore } from "@/lib/buyer-store";
import { formatPrice } from "@/lib/format";

export function SavedKombinsPage() {
  const kombins = useKombinsStore((s) => s.kombins);
  const loading = useKombinsStore((s) => s.loading);
  const deleteKombin = useKombinsStore((s) => s.deleteKombin);

  async function handleDelete(id: string) {
    await deleteKombin(id);
    toast.success("Kombin silindi.");
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformNav />
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-foreground">Kaydedilen Kombinler</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Birlikte değerlendirdiğin ürün setlerini burada sakla.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30]">
            <Link href="/platform/kombin">
              <Plus className="mr-1.5 size-4" />
              Yeni Kombin
            </Link>
          </Button>
        </div>

        {loading && kombins.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-64 animate-pulse rounded-2xl bg-muted/40" />
            ))}
          </div>
        ) : kombins.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-background">
              <Layers className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-bold text-foreground">Henüz kombin kaydı yok</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kombin danışmanında bir set oluşturup sonucu kaydedebilirsin.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {kombins.map((kombin) => {
              const score = kombin.result.scores.overall;
              const created = new Date(kombin.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
              });

              return (
                <article key={kombin.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="size-4 shrink-0 text-[#5a8a00] dark:text-[#adff41]" />
                        <h2 className="truncate text-base font-black text-foreground">{kombin.title}</h2>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{kombin.goalText}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(kombin.id)}
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                      aria-label="Kombini sil"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-muted-foreground">Kombin Skoru</p>
                      <p className="text-2xl font-black text-foreground">{score}/100</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{created}</p>
                      {kombin.budget ? <p>{formatPrice(kombin.budget)}</p> : null}
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{kombin.result.summary}</p>

                  <div className="flex -space-x-3">
                    {kombin.products.slice(0, 5).map((product) => (
                      <div key={product.id} className="relative size-11 overflow-hidden rounded-full border-2 border-background bg-muted">
                        <Image src={product.image} alt={product.title} fill sizes="44px" className="object-cover" />
                      </div>
                    ))}
                    {kombin.products.length > 5 && (
                      <div className="flex size-11 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-bold">
                        +{kombin.products.length - 5}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
