"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Bot,
  ChevronRight,
  FileText,
  Lightbulb,
  SearchCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { sellerProducts, formatSellerPrice } from "@/lib/mock-data/seller";

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
    href: "/seller/products",
    cta: "Analizi Başlat",
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

const RECENT_AI = [
  {
    type: "Müşteri Simülasyonu",
    productId: "bluetooth-kulaklik-pro-x1",
    productTitle: "Premium Bluetooth Kulaklık Beyaz",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
    result: "5 aktif · 4 kararsız · 3 vazgeçti",
    date: "Bugün 10:42",
    icon: Users,
    iconColor: "green",
  },
  {
    type: "AI İçerik Düzenleme",
    productId: "spor-ayakkabi-runflex",
    productTitle: "RunFlex Hafif Tabanlı Spor Ayakkabı",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
    result: "4 alan güncellendi",
    date: "Bugün 09:12",
    icon: Bot,
    iconColor: "blue",
  },
  {
    type: "İade Analizi",
    productId: "mutfak-robotu-compact",
    productTitle: "CookMate Compact 900W Mutfak Robotu",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=200&q=80",
    result: "3 kök neden tespit edildi",
    date: "Dün 17:30",
    icon: SearchCheck,
    iconColor: "amber",
  },
];

const tagStyle: Record<string, string> = {
  green: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  gray: "bg-gray-100 text-gray-500 dark:bg-white/8 dark:text-gray-500",
};

export function SellerAIStudio() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Studio</h1>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          ZekAI'nin tüm yapay zeka araçlarına tek yerden eriş.
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

      {/* ── Recent AI activity ── */}
      <div>
        <h2 className="mb-4 text-base font-bold text-gray-900 dark:text-white">Son AI Aktivitesi</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
          {RECENT_AI.map((item, i) => {
            const Icon = item.icon;
            const iconBg: Record<string, string> = {
              green: "bg-green-50 dark:bg-green-500/10",
              blue: "bg-blue-50 dark:bg-blue-500/10",
              amber: "bg-amber-50 dark:bg-amber-500/10",
            };
            const iconColor: Record<string, string> = {
              green: "text-green-600 dark:text-green-400",
              blue: "text-blue-600 dark:text-blue-400",
              amber: "text-amber-600 dark:text-amber-400",
            };
            return (
              <Link
                key={item.productId + i}
                href={`/seller/product/${item.productId}/simulation`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i > 0 ? "border-t border-gray-100 dark:border-white/8" : ""}`}
              >
                {/* Tool icon */}
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg[item.iconColor]}`}>
                  <Icon className={`size-4 ${iconColor[item.iconColor]}`} />
                </div>

                {/* Product image */}
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <Image src={item.image} alt={item.productTitle} fill sizes="40px" className="object-contain p-1" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{item.type}</span>
                  </div>
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{item.productTitle}</p>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">{item.result}</p>
                </div>

                {/* Date */}
                <p className="shrink-0 text-xs text-gray-400">{item.date}</p>
                <ChevronRight className="size-4 shrink-0 text-gray-300" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
