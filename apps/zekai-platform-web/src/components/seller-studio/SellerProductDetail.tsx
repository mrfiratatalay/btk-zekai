"use client";

import Image from "next/image";
import Link from "next/link";
import { Bot, ChevronRight, Eye, Package, PackagePlus, Share2, Sparkles } from "lucide-react";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";

const MODULES = [
  {
    key: "edit",
    icon: Bot,
    title: "İçerik Düzenle",
    description: "Başlık, açıklama ve özellikleri düzenle",
    href: (id: string) => `/seller/product/${id}/ai-edit`,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "simulation",
    icon: Sparkles,
    title: "Müşteri Simülasyonu",
    description: "Müşteri gözüyle analiz et",
    href: (id: string) => `/seller/product/${id}/simulation`,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    key: "social",
    icon: Share2,
    title: "Sosyal Medya İçeriği",
    description: "Instagram, Twitter ve TikTok için içerik üret",
    href: (id: string) => `/seller/product/${id}/social`,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    key: "bundles",
    icon: PackagePlus,
    title: "Birlikte Sat",
    description: "Tamamlayıcı ürün paketi oluştur ve yayınla",
    href: (id: string) => `/seller/product/${id}/bundles`,
    iconBg: "bg-lime-500/10",
    iconColor: "text-lime-700 dark:text-lime-300",
  },
] as const;

export function SellerProductDetail({ product }: { product: SellerProductPerformance }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/seller/products" className="hover:text-foreground">
          Ürünlerim
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{product.title}</span>
      </nav>

      {/* Ürün başlığı */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
            {product.image ? (
              <Image src={product.image} alt={product.title} fill className="object-contain p-1.5" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="size-7 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-snug text-foreground">
              {product.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.category} · {formatSellerPrice(product.price)} · {product.stock} stok
            </p>
          </div>
          <a
            href={`${COMMERCE_WEB_URL}/product/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Eye className="size-4" />
            Mağazada Gör
          </a>
        </div>
      </div>

      {/* Araçlar */}
      <div>
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Araçlar
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.key}
                href={mod.href(product.id)}
                className="group flex min-h-28 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-green-500/30 hover:bg-green-500/5 hover:shadow-md"
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${mod.iconBg}`}>
                  <Icon className={`size-4 ${mod.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{mod.title}</p>
                  <p className="text-sm text-muted-foreground">{mod.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
