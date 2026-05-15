"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Bot, Package, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PRODUCTS = [
  {
    id: "bluetooth-kulaklik-pro-x1",
    title: "PulseWave Pro X1 Bluetooth Kulaklık",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=80&q=80",
    price: "₺1.015",
    sales: 142,
    returnRate: 18,
    riskScore: 72,
    rating: 4.6,
    lastAnalysis: "2 saat önce",
    category: "Elektronik",
  },
  {
    id: "akilli-saat-fit-neo",
    title: "FitNeo S3 Akıllı Saat Nabız ve Uyku Takipli",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=80&q=80",
    price: "₺1.299",
    sales: 87,
    returnRate: 12,
    riskScore: 55,
    rating: 4.4,
    lastAnalysis: "1 gün önce",
    category: "Elektronik",
  },
  {
    id: "ergonomik-calisma-sandalyesi",
    title: "NordDesk Bel Destekli Ergonomik Çalışma Sandalyesi",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=80&q=80",
    price: "₺2.799",
    sales: 54,
    returnRate: 8,
    riskScore: 44,
    rating: 4.2,
    lastAnalysis: "3 gün önce",
    category: "Ev & Yaşam",
  },
  {
    id: "seramik-taki-seti",
    title: "Handmade Beyaz Seramik Takı Seti",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=80&q=80",
    price: "₺449",
    sales: 215,
    returnRate: 4,
    riskScore: 22,
    rating: 4.9,
    lastAnalysis: "5 gün önce",
    category: "Aksesuar",
  },
];

function RiskBadge({ score }: { score: number }) {
  const config =
    score >= 65
      ? { label: "Yüksek Risk", cls: "bg-red-500/10 text-red-600 dark:text-red-400" }
      : score >= 40
      ? { label: "Orta Risk", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" }
      : { label: "Düşük Risk", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", config.cls)}>
      {score} · {config.label}
    </span>
  );
}

export function SellerProducts() {
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter((p) =>
    p.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Ürünlerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">{PRODUCTS.length} ürün · 6 riskli</p>
        </div>
        <Button className="w-fit rounded-xl bg-[#ADFF41] font-semibold text-[#0D0F0B] hover:bg-[#9AE635]">
          <Bot className="mr-2 size-4" />
          Tümünü Analiz Et
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün ara..."
          className="h-11 rounded-xl border-border bg-card pl-10 text-sm focus-visible:ring-[#ADFF41]"
        />
      </div>

      {/* Product list */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border px-6 py-3 sm:grid">
          <span className="text-xs font-semibold text-muted-foreground">Ürün</span>
          <span className="text-xs font-semibold text-muted-foreground">Satış</span>
          <span className="text-xs font-semibold text-muted-foreground">İade</span>
          <span className="text-xs font-semibold text-muted-foreground">Risk</span>
          <span className="text-xs font-semibold text-muted-foreground" />
        </div>

        <div className="divide-y divide-border">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-muted/40 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center"
            >
              {/* Product info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                  <Image src={product.image} alt={product.title} fill sizes="48px" className="object-contain p-1.5" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold text-foreground">{product.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{product.category}</span>
                    <span>·</span>
                    <span>{product.price}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {product.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-sm font-semibold text-foreground text-right">
                {product.sales}
                <span className="ml-1 text-xs font-normal text-muted-foreground">adet</span>
              </div>
              <div className={cn("text-sm font-semibold text-right", product.returnRate >= 15 ? "text-red-500" : product.returnRate >= 8 ? "text-amber-500" : "text-emerald-500")}>
                %{product.returnRate}
              </div>
              <div>
                <RiskBadge score={product.riskScore} />
              </div>

              {/* CTA */}
              <Button
                asChild
                size="sm"
                className="w-full rounded-xl bg-[#ADFF41] font-semibold text-[#0D0F0B] hover:bg-[#9AE635] sm:w-auto"
              >
                <Link href={`/seller/product/${product.id}`}>
                  Analiz
                  <ArrowUpRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 size-8 opacity-40" />
              <p className="text-sm">Ürün bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
