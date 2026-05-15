"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Sparkles,
  Star,
  Tag,
  TrendingDown,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { SellerProductPerformance } from "@/types/seller";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/* ── Mock AI suggestions ─────────────────────────────────────────────────── */
function getMockOptimization(product: SellerProductPerformance) {
  return {
    currentTitle: product.title,
    suggestedTitle: `${product.title} | Garantili & Hızlı Kargo`,
    currentDesc: "Ürün açıklaması çok kısa ve genel.",
    suggestedDesc:
      "Günlük kullanım, müzik ve online görüşmeler için geliştirilmiş Bluetooth 5.3 kulaklık. 20 saate kadar pil ömrü, dahili mikrofon ve hafif tasarımıyla uzun kullanım konforu sunar. USB-C ile hızlı şarj, 30 dakikada 3 saat kullanım.",
    seoMeta:
      "Bluetooth kulaklık, kablosuz kulaklık, mikrofonlu kulaklık, oyun kulaklığı, PulseWave Pro X1",
    photoTips: [
      "Yaşam tarzı fotoğrafı ekle (kişi kulaklık takıyor)",
      "Mikrofon yakın çekimi göster",
      "USB-C şarj portu detayı ekle",
    ],
  };
}

const PERSONAS = [
  { name: "Öğrenci Ayşe", age: 21, icon: "🎓", verdict: "Alırdı", match: 82, reason: "Fiyat ve kalite dengesi iyi. Mikrofon için endişeli ama risk almaya razı." },
  { name: "Gamer Emre", age: 26, icon: "🎮", verdict: "Almadı", match: 38, reason: "Oyun gecikmesi bilgisi yok. Güven vermiyor." },
  { name: "Uzaktan Çalışan Selin", age: 32, icon: "💼", verdict: "Almadı", match: 45, reason: "Mikrofon kalitesine dair detay eksik, toplantı için risk." },
  { name: "Müzik Sever Hasan", age: 28, icon: "🎵", verdict: "Alırdı", match: 76, reason: "Ses kalitesi yeterli görünüyor, fiyat makul." },
];

export function SellerProductDetail({ product }: { product: SellerProductPerformance }) {
  const opt = getMockOptimization(product);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setPublishing(false);
    setPublished(true);
    toast.success("Değişiklikler mağazaya uygulandı.");
  }

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div>
        <Link
          href="/seller/products"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Ürünlere Dön
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
              <Image src={product.image} alt={product.title} fill sizes="64px" className="object-contain p-2" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground leading-tight">{product.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{product.category}</span>
                <span>·</span>
                <span>₺{product.price.toLocaleString("tr-TR")}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <TrendingDown className="size-3" />
                  ₺{product.lostProfitMonthly.toLocaleString("tr-TR")}/ay kayıp
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-bold",
                product.aiRiskScore >= 65
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : product.aiRiskScore >= 40
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}
            >
              Risk: {product.aiRiskScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personas">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          <TabsTrigger value="personas" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#ADFF41]/15 data-[state=active]:text-foreground">
            <Users className="mr-1.5 size-4" />
            Sentetik Müşteriler
          </TabsTrigger>
          <TabsTrigger value="optimize" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#ADFF41]/15 data-[state=active]:text-foreground">
            <Bot className="mr-1.5 size-4" />
            AI Optimizasyon
          </TabsTrigger>
          <TabsTrigger value="photos" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#ADFF41]/15 data-[state=active]:text-foreground">
            <ImageIcon className="mr-1.5 size-4" />
            Fotoğraf & SEO
          </TabsTrigger>
          <TabsTrigger value="publish" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#ADFF41]/15 data-[state=active]:text-foreground">
            <Sparkles className="mr-1.5 size-4" />
            Mağazaya Uygula
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Personas ─────────────────────────────────────────────── */}
        <TabsContent value="personas" className="mt-5 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-4 text-[#ADFF41]" />
              <h2 className="font-extrabold text-foreground">Sentetik Müşteri Paneli</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              AI, 4 farklı alıcı profilini simüle etti. <strong className="text-foreground">2'si</strong> bu ürünü alırdı.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {PERSONAS.map((p) => (
                <div
                  key={p.name}
                  className={cn(
                    "rounded-2xl border p-5 transition-colors",
                    p.verdict === "Alırdı"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-red-500/20 bg-red-500/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{p.icon}</span>
                      <div>
                        <p className="font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.age} yaş</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        p.verdict === "Alırdı"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      )}
                    >
                      {p.verdict}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Uyum</span>
                      <span className="font-semibold text-foreground">%{p.match}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className={cn("h-full rounded-full", p.match >= 65 ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${p.match}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Optimize ─────────────────────────────────────────────── */}
        <TabsContent value="optimize" className="mt-5 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-[#ADFF41]" />
              <h2 className="font-extrabold text-foreground">AI Başlık & Açıklama Önerisi</h2>
            </div>

            {/* Title */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mevcut Başlık</p>
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-foreground">{opt.currentTitle}</div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-[#ADFF41] uppercase tracking-wide">AI Önerisi</p>
                <div className="rounded-2xl border border-[#ADFF41]/30 bg-[#ADFF41]/5 p-4 text-sm font-medium text-foreground">{opt.suggestedTitle}</div>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mevcut Açıklama</p>
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">{opt.currentDesc}</div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-[#ADFF41] uppercase tracking-wide">AI Önerisi</p>
                <div className="rounded-2xl border border-[#ADFF41]/30 bg-[#ADFF41]/5 p-4 text-sm leading-relaxed text-foreground">{opt.suggestedDesc}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Photos & SEO ─────────────────────────────────────────── */}
        <TabsContent value="photos" className="mt-5 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-[#ADFF41]" />
              <h2 className="font-extrabold text-foreground">SEO & Fotoğraf İyileştirme</h2>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-[#ADFF41] uppercase tracking-wide">SEO Anahtar Kelimeler</p>
              <div className="rounded-2xl border border-[#ADFF41]/30 bg-[#ADFF41]/5 p-4 text-sm text-foreground">{opt.seoMeta}</div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fotoğraf Önerileri</p>
              <div className="space-y-2">
                {opt.photoTips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#ADFF41]/15 text-xs font-bold text-[#ADFF41]">{i + 1}</div>
                    <p className="text-sm text-foreground">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Publish ──────────────────────────────────────────────── */}
        <TabsContent value="publish" className="mt-5">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm text-center">
            <AnimatePresence mode="wait">
              {published ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="size-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground">Mağazaya Uygulandı!</h3>
                  <p className="text-sm text-muted-foreground">
                    AI önerileri başarıyla mağazana yansıtıldı. Ürün sayfasında güncel içeriği görebilirsin.
                  </p>
                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="rounded-xl border-border">
                      <Link href={`/mock-shop/product/${product.id}`}>Ürünü Gör</Link>
                    </Button>
                    <Button asChild className="rounded-xl bg-[#ADFF41] text-[#0D0F0B] hover:bg-[#9AE635]">
                      <Link href="/seller/products">Ürünlere Dön</Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-5"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#ADFF41]/15">
                    <Sparkles className="size-7 text-[#ADFF41]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">Değişiklikler Hazır</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      AI&apos;nın ürettiği başlık, açıklama ve SEO içeriği mağazana uygulanacak. Onayladığında ürün sayfası güncellenecek.
                    </p>
                  </div>
                  <div className="w-full max-w-sm space-y-2 text-left">
                    {["Başlık güncellendi", "Açıklama iyileştirildi", "SEO etiketleri eklendi", "Fotoğraf önerileri eklendi"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 text-[#ADFF41]" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="h-12 w-full max-w-sm rounded-xl bg-[#ADFF41] text-[#0D0F0B] font-bold hover:bg-[#9AE635] disabled:opacity-70"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Uygulanıyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 size-4" />
                        Mağazaya Uygula
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
