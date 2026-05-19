"use client";

import Image from "next/image";
import { Check, ChevronRight, PackagePlus, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PublicProductBundle } from "@/lib/api/products";
import { formatPrice } from "@/lib/api/products";
import { useCartStore } from "@/lib/store/cart-store";

export function ProductBundleCard({ bundle }: { bundle: PublicProductBundle }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const addBundle = useCartStore((s) => s.addBundle);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  async function handleAddBundle() {
    setState("loading");
    try {
      await addBundle(bundle.id);
      setState("added");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:border-orange-200 hover:bg-orange-50/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6000]">
            <PackagePlus className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-extrabold text-[#FF6000]">
                %{bundle.discountPercent}
              </span>
              {bundle.campaignText && (
                <span className="line-clamp-1 text-xs font-semibold text-slate-500">{bundle.campaignText}</span>
              )}
            </div>
            <h2 className="line-clamp-1 text-sm font-extrabold text-[#111827]">{bundle.title}</h2>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
              {bundle.primaryProduct.title} + {bundle.complementaryProduct.title}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold text-slate-400 line-through">{formatPrice(bundle.originalTotal)}</p>
            <p className="text-base font-extrabold text-[#111827]">{formatPrice(bundle.bundleTotal)}</p>
          </div>

          <ChevronRight className="size-4 shrink-0 text-slate-300" />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-6">
          <button
            type="button"
            aria-label="Paket detayını kapat"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <section className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <PackagePlus className="size-4 shrink-0 text-[#FF6000]" />
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#FF6000]">Paket Fırsatı</p>
                </div>
                <h2 className="line-clamp-2 text-xl font-extrabold leading-6 text-[#111827]">{bundle.title}</h2>
                {bundle.shortDescription && (
                  <p className="mt-1.5 text-sm leading-5 text-slate-500">{bundle.shortDescription}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-100 text-slate-500 hover:bg-slate-50"
                aria-label="Kapat"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
              <BundleProductCard product={bundle.primaryProduct} />
              <div className="flex items-center">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50">
                  <Plus className="size-4 text-[#FF6000]" />
                </div>
              </div>
              <BundleProductCard product={bundle.complementaryProduct} />
            </div>

            {bundle.campaignText && (
              <p className="mt-4 rounded-xl bg-orange-50 px-3 py-2.5 text-center text-sm font-bold text-[#FF6000]">
                {bundle.campaignText}
              </p>
            )}

            <div className="mt-4 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Normal toplam</span>
                <span className="line-through">{formatPrice(bundle.originalTotal)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-emerald-600">
                <span>Paket indirimi</span>
                <span>-{formatPrice(bundle.discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 font-extrabold text-[#111827]">
                <span>Ödenecek toplam</span>
                <span className="text-lg">{formatPrice(bundle.bundleTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleAddBundle}
              disabled={state === "loading"}
              className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-white transition-all disabled:opacity-70 ${
                state === "added"
                  ? "bg-emerald-500"
                  : state === "error"
                  ? "bg-red-500"
                  : "bg-[#FF6000] hover:bg-[#E65700] active:scale-[0.98]"
              }`}
            >
              {state === "added" ? (
                <><Check className="size-4" /> Sepete Eklendi</>
              ) : state === "error" ? (
                "Eklenemedi - giriş yapın"
              ) : state === "loading" ? (
                "Ekleniyor..."
              ) : (
                <><ShoppingCart className="size-4" /> {bundle.ctaLabel || "Paketi Sepete Ekle"}</>
              )}
            </button>
          </section>
        </div>
      )}
    </>
  );
}

function BundleProductCard({ product }: { product: PublicProductBundle["primaryProduct"] }) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-2.5">
      <div className="relative mb-2 flex aspect-square w-full max-w-[92px] items-center justify-center">
        {product.image
          ? <Image src={product.image} alt={product.title} fill sizes="92px" className="object-contain" />
          : <PackagePlus className="m-auto size-7 text-slate-300" />
        }
      </div>
      <p className="line-clamp-2 text-center text-xs font-semibold leading-4 text-[#374151]">{product.title}</p>
      <p className="mt-1 text-sm font-extrabold text-[#111827]">{formatPrice(product.price)}</p>
    </div>
  );
}
