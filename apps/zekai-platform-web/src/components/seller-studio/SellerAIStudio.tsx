"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart2,
  Bot,
  ChevronRight,
  FileText,
  Lightbulb,
  Loader2,
  RotateCcw,
  SearchCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { getSellerProducts, type SellerProduct } from "@/lib/api/seller";

const AI_TOOLS = [
  {
    id: "simulation",
    icon: Users,
    label: "Müşteri Simülasyonu",
    desc: "12 sentetik müşteri profiliyle ürününü test et. Kimin alıp kimin vazgeçeceğini önceden gör.",
    tag: "En Popüler",
    tagColor: "green",
    href: "/seller/products",
    cta: "Simülasyon Başlat",
  },
  {
    id: "content",
    icon: Bot,
    label: "AI İçerik Düzenleme",
    desc: "Başlık, açıklama, özellikler ve SEO alanlarını otomatik olarak optimize et.",
    tag: "Yeni",
    tagColor: "blue",
    href: "/seller/products",
    cta: "İçerik Düzenle",
  },
  {
    id: "return",
    icon: SearchCheck,
    label: "İade Kök Neden Analizi",
    desc: "Hangi ürün içeriği yanlış beklenti oluşturuyor? İade nedenlerini anla ve düzelt.",
    tag: null,
    tagColor: "",
    href: "/seller/returns",
    cta: "İadeleri İncele",
  },
  {
    id: "seo",
    icon: FileText,
    label: "SEO Optimizasyonu",
    desc: "Arama görünürlüğünü artır. Anahtar kelime önerileri ve meta açıklama üretimi.",
    tag: null,
    tagColor: "",
    href: "/seller/products",
    cta: "SEO'yu İyileştir",
  },
  {
    id: "price",
    icon: BarChart2,
    label: "Fiyat Simülatörü",
    desc: "Farklı fiyatlandırma senaryolarını karşılaştır, en kârlı noktayı bul.",
    tag: "Yakında",
    tagColor: "gray",
    href: "#",
    cta: "Yakında",
  },
  {
    id: "competitor",
    icon: TrendingUp,
    label: "Rakip Analizi",
    desc: "Rakip ürünlerle fiyat, içerik ve konumlandırma karşılaştırması yap.",
    tag: "Yakında",
    tagColor: "gray",
    href: "#",
    cta: "Yakında",
  },
];

const tagStyle: Record<string, string> = {
  green: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  gray: "bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-500",
};

export function SellerAIStudio() {
  const [urgentProducts, setUrgentProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerProducts()
      .then((products) => {
        const sorted = [...products]
          .sort((a, b) => a.healthScore - b.healthScore)
          .slice(0, 3);
        setUrgentProducts(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Studio</h1>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          ZekAI&apos;nin tüm yapay zeka araçlarına tek yerden eriş.
        </p>
      </div>

      {/* ── Hero — Featured tool ── */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              <Lightbulb className="size-3" />
              En Çok Kullanılan Araç
            </span>
            <h2 className="mt-3 text-2xl font-black">Müşteri Simülasyonu</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-green-100">
              Ürününü 12 farklı sentetik müşteri profiliyle test et. Kimin satın alıp kimin vazgeçeceğini anında gör, iyileştirme önerilerini al.
            </p>
            <Link
              href="/seller/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50"
            >
              <Users className="size-4" />
              Simülasyon Başlat
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="hidden shrink-0 lg:block">
            <div className="flex size-32 items-center justify-center rounded-3xl bg-white/15">
              <Users className="size-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Tools grid ── */}
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">Tüm AI Araçları</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const disabled = tool.tag === "Yakında";
            return (
              <Link
                key={tool.id}
                href={disabled ? "#" : tool.href}
                className={`flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all dark:border-white/10 dark:bg-[#111] ${disabled ? "cursor-default opacity-60" : "hover:shadow-md"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/8">
                    <Icon className="size-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  {tool.tag && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tagStyle[tool.tagColor]}`}>
                      {tool.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">{tool.label}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gray-400">{tool.desc}</p>
                {!disabled && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                    {tool.cta}
                    <ChevronRight className="size-3.5" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Urgent products from real API ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Acil Müdahale Gereken Ürünler</h2>
          <Link href="/seller/products" className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400">
            Tüm ürünler <ChevronRight className="size-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-green-500" />
          </div>
        ) : urgentProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-white/10">
            <p className="text-sm text-gray-400">Tüm ürünler sağlıklı görünüyor.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
            {urgentProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/seller/product/${product.id}/simulation`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i > 0 ? "border-t border-gray-100 dark:border-white/8" : ""}`}
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  {product.primaryImage && (
                    <Image src={product.primaryImage} alt={product.title} fill sizes="40px" className="object-contain p-1" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{product.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{product.mainIssue || product.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  {product.lostProfitMonthly > 0 && (
                    <p className="text-sm font-bold text-red-500">
                      -{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(product.lostProfitMonthly)}
                    </p>
                  )}
                  <span className={`mt-0.5 inline-block text-[11px] font-semibold ${
                    product.status === "Urgent" ? "text-red-500" : product.status === "Watch" ? "text-amber-500" : "text-green-500"
                  }`}>
                    {product.status === "Urgent" ? "Acil" : product.status === "Watch" ? "Takip Et" : "Sağlıklı"}
                  </span>
                </div>
                <ChevronRight className="size-4 shrink-0 text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Returns shortcut ── */}
      <Link
        href="/seller/returns"
        className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 transition-all hover:shadow-md dark:border-amber-500/20 dark:bg-amber-500/10"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
          <RotateCcw className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">İade Yönetimi</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Bekleyen iade taleplerini incele, kabul et veya itiraz et.
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-amber-400" />
      </Link>
    </div>
  );
}
