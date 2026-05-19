"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Bot,
  ChevronRight,
  FileText,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const AI_TOOLS = [
  {
    id: "simulation",
    icon: Users,
    label: "Müşteri Simülasyonu",
    desc: "5 sentetik müşteri profiliyle ürününü test et. Kimin alıp kimin vazgeçeceğini önceden gör.",
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
  green: "bg-green-500/10 text-green-700 dark:text-green-400",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  gray: "bg-muted text-muted-foreground",
};

export function SellerAIStudio() {

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-green-500" />
          <h1 className="text-2xl font-bold text-foreground">AI Studio</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
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
              Ürününü 5 farklı sentetik müşteri profiliyle test et. Kimin satın alıp kimin vazgeçeceğini anında gör, iyileştirme önerilerini al.
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
        <h2 className="mb-4 text-base font-bold text-foreground">Tüm AI Araçları</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const disabled = tool.tag === "Yakında";
            const cardClass = `flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all ${disabled ? "cursor-not-allowed opacity-60" : "hover:shadow-md cursor-pointer"}`;
            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5 text-muted-foreground" />
                  </div>
                  {tool.tag && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tagStyle[tool.tagColor]}`}>
                      {tool.tag}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">{tool.label}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{tool.desc}</p>
                {!disabled && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                    {tool.cta}
                    <ChevronRight className="size-3.5" />
                  </div>
                )}
              </>
            );

            // "Yakında" araçlar için Link kullanma — gerçek yönlendirme yok, sadece statik kart.
            if (disabled) {
              return (
                <div key={tool.id} className={cardClass} aria-disabled="true">
                  {inner}
                </div>
              );
            }

            return (
              <Link key={tool.id} href={tool.href} className={cardClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
