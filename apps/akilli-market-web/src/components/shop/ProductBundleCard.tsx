"use client";

import Image from "next/image";
import { Check, PackagePlus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { PublicProductBundle } from "@/lib/api/products";
import { formatPrice } from "@/lib/api/products";
import { useCartStore } from "@/lib/store/cart-store";

export function ProductBundleCard({ bundle }: { bundle: PublicProductBundle }) {
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const addBundle = useCartStore((s) => s.addBundle);

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
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <PackagePlus className="size-4 shrink-0 text-[#FF6000]" />
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#FF6000]">Paket Fırsatı</p>
          </div>
          <h2 className="line-clamp-2 text-base font-extrabold leading-5 text-[#111827]">{bundle.title}</h2>
          {bundle.shortDescription && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{bundle.shortDescription}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-[#FF6000]">
          %{bundle.discountPercent}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <BundleProductCard product={bundle.primaryProduct} />
        <div className="flex items-center">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50">
            <Plus className="size-4 text-[#FF6000]" />
          </div>
        </div>
        <BundleProductCard product={bundle.complementaryProduct} />
      </div>

      {bundle.campaignText && (
        <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-center text-xs font-bold text-[#FF6000]">
          {bundle.campaignText}
        </p>
      )}

      <div className="mt-3 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
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
          <span className="text-base">{formatPrice(bundle.bundleTotal)}</span>
        </div>
      </div>

      <button
        onClick={handleAddBundle}
        disabled={state === "loading"}
        className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-white transition-all disabled:opacity-70 ${
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
  );
}

function BundleProductCard({ product }: { product: PublicProductBundle["primaryProduct"] }) {
  return (
    <div className="flex min-w-0 flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-2.5">
      <div className="relative mb-2 flex aspect-square w-full max-w-[86px] items-center justify-center">
        {product.image
          ? <Image src={product.image} alt={product.title} fill sizes="86px" className="object-contain" />
          : <PackagePlus className="m-auto size-7 text-slate-300" />
        }
      </div>
      <p className="line-clamp-2 text-center text-xs font-semibold leading-4 text-[#374151]">{product.title}</p>
      <p className="mt-1 text-sm font-extrabold text-[#111827]">{formatPrice(product.price)}</p>
    </div>
  );
}
