"use client";

import Image from "next/image";
import Link from "next/link";
import { Bot, ChevronRight, Eye, Package, Share2, Sparkles } from "lucide-react";
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
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "simulation",
    icon: Sparkles,
    title: "Müşteri Simülasyonu",
    description: "Müşteri gözüyle analiz et",
    href: (id: string) => `/seller/product/${id}/simulation`,
    iconBg: "bg-green-100 dark:bg-green-500/15",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    key: "social",
    icon: Share2,
    title: "Sosyal Medya İçeriği",
    description: "Instagram, Twitter ve TikTok için içerik üret",
    href: (id: string) => `/seller/product/${id}/social`,
    iconBg: "bg-violet-100 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
] as const;

export function SellerProductDetail({ product }: { product: SellerProductPerformance }) {
  return (
    <div className="mx-auto max-w-xl space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/seller/products" className="hover:text-gray-700 dark:hover:text-gray-200">
          Ürünlerim
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-gray-600 dark:text-gray-300">{product.title}</span>
      </nav>

      {/* Ürün başlığı — kutusuz, direkt sayfa üzerinde */}
      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/8">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-contain p-1.5" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-7 text-gray-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-snug text-gray-900 dark:text-white">
            {product.title}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {product.category} · {formatSellerPrice(product.price)} · {product.stock} stok
          </p>
        </div>
        <a
          href={`${COMMERCE_WEB_URL}/product/${product.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <Eye className="size-4" />
          Mağazada Gör
        </a>
      </div>

      {/* Araçlar */}
      <div>
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Araçlar
        </p>

        {/* Tek liste, içinde divider'larla ayrılmış satırlar */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.key}
                href={mod.href(product.id)}
                className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                  i < MODULES.length - 1 ? "border-b border-gray-100 dark:border-white/8" : ""
                }`}
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${mod.iconBg}`}>
                  <Icon className={`size-4 ${mod.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{mod.title}</p>
                  <p className="text-sm text-gray-400">{mod.description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 dark:text-gray-600" />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
