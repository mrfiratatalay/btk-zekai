"use client";

/**
 * QuickAnalyzeBar
 *
 * Eski PlatformBuyerFlow içindeki link çözme + analiz başlatma logic'ini
 * dashboard'a entegre eden kompakt bileşen.
 *
 * 2 adım: link girişi → ihtiyaç metni → analiz sayfasına yönlendirme.
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  Package,
  Star,
  Zap,
  User,
  Heart,
  Baby,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getProduct, mapProductDetailToProduct } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";
const LINK_PREFIX = `${COMMERCE_WEB_URL}/product/`;

function resolveProductId(url: string): string | null {
  const m = url.match(/\/(?:product|urun)\/([^/?#]+)/);
  if (m) return m[1];
  if (!url.includes("/") && url.trim().length > 0) return url.trim();
  return null;
}

function encodeAnalysisId(productId: string, need: string) {
  return `${productId}--${encodeURIComponent(need).slice(0, 80)}`;
}

const QUICK_PRODUCTS = [
  { id: "bluetooth-kulaklik-pro-x1", label: "Bluetooth Kulaklık Pro X1" },
  { id: "akilli-saat-fit-neo", label: "Akıllı Saat FitNeo S3" },
  { id: "ergonomik-calisma-sandalyesi", label: "Ergonomik Çalışma Sandalyesi" },
];

const QUICK_NEEDS = [
  "Müzik dinlemek için",
  "Oyun ve ders için",
  "Uzun süreli kullanım",
  "Hediye alacağım",
];

const GIFT_TARGETS = [
  { id: "kendim", label: "Kendim için", icon: User },
  { id: "annem", label: "Annem için", icon: Heart },
  { id: "babam", label: "Babam için", icon: Heart },
  { id: "cocugum", label: "Çocuğum için", icon: Baby },
  { id: "arkadasim", label: "Arkadaşım için", icon: Users },
  { id: "esim", label: "Eşim için", icon: Heart },
];

type Step = "link" | "need" | "launching";

export function QuickAnalyzeBar() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [step, setStep] = useState<Step>("link");
  const [userNeed, setUserNeed] = useState("");
  const [giftTarget, setGiftTarget] = useState<string>("kendim");
  const [needError, setNeedError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLinkError("");
    const id = resolveProductId(url.trim());
    if (!id) {
      setLinkError("Link taninamadi. Demo magazadan bir urun linki kopyala.");
      return;
    }
    setLoadingProduct(true);
    try {
      const found = await getProduct(id);
      setProduct(mapProductDetailToProduct(found));
      setStep("need");
    } catch {
      setLinkError("Urun bulunamadi.");
    } finally {
      setLoadingProduct(false);
    }
  }

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (userNeed.trim().length < 10) {
      setNeedError("Lütfen en az 10 karakter yaz.");
      return;
    }
    if (!product) return;
    setStep("launching");
    startTransition(() => {
      let finalNeed = userNeed.trim();
      if (giftTarget !== "kendim") {
        const targetLabel = GIFT_TARGETS.find(t => t.id === giftTarget)?.label;
        finalNeed = `${targetLabel} alıyorum. ${finalNeed}`;
      }
      const id = encodeAnalysisId(product.id, finalNeed);
      router.push(`/platform/analysis/${id}`);
    });
  }

  function reset() {
    setStep("link");
    setProduct(null);
    setUrl("");
    setUserNeed("");
    setLinkError("");
    setNeedError("");
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* ─ Step 1: Link (Sleek Pill) ─────────────────────────────────────────────── */}
        {step === "link" && (
          <motion.div
            key="link"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <form onSubmit={handleLinkSubmit} className="relative w-full max-w-2xl mx-auto group">
              <div className="absolute left-2.5 top-2.5 flex size-11 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors group-focus-within:bg-[#adff41]/20 group-focus-within:text-[#5a8a00] dark:group-focus-within:text-[#adff41]">
                <Link2 className="size-5" />
              </div>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Örn: Trendyol, Hepsiburada veya Akıllı Market ürün linkini yapıştır..."
                className="h-16 w-full rounded-[32px] border border-border/50 bg-background/80 backdrop-blur-2xl pl-16 pr-36 text-base text-foreground shadow-2xl outline-none placeholder:text-muted-foreground/50 focus:border-[#adff41]/50 focus:bg-background transition-all"
              />
              <Button
                type="submit"
                disabled={loadingProduct}
                className="absolute right-2 top-2 h-12 rounded-[24px] bg-[#adff41] px-6 font-bold text-[#0a0a0f] transition-all hover:bg-[#9aef30] hover:scale-105 shadow-lg shadow-[#adff41]/20"
              >
                {loadingProduct ? "Getiriliyor" : "Analiz Et"}
                {loadingProduct ? <Loader2 className="ml-1.5 size-4 animate-spin" /> : <ArrowRight className="ml-1.5 size-4" />}
              </Button>
            </form>

            {linkError && (
              <p className="mt-3 text-center text-sm font-medium text-red-500 dark:text-red-400">{linkError}</p>
            )}

            {/* Hızlı başla */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted-foreground/60 mr-2">Örnek Ürünler:</span>
              {QUICK_PRODUCTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setUrl(`${LINK_PREFIX}${item.id}`);
                    setLinkError("");
                  }}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-[#adff41]/30 hover:bg-[#adff41]/5 hover:text-foreground transition-all"
                >
                  <Package className="size-3.5" />
                  {item.label}
                </button>
              ))}
              <a
                href={COMMERCE_WEB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-[#5a8a00] dark:text-[#adff41] hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Demo Mağaza
              </a>
            </div>
          </motion.div>
        )}

        {/* ─ Step 2: İhtiyaç ──────────────────────────────────────────── */}
        {step === "need" && product && (
          <motion.div
            key="need"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl mx-auto rounded-3xl border border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Mini product preview (Apple Notification Style) */}
            <div className="relative flex items-center gap-4 rounded-2xl bg-card border border-border/50 shadow-sm p-3 overflow-hidden group">
              <div className="absolute -right-12 -top-12 size-32 rounded-full bg-[#adff41]/10 blur-3xl group-hover:bg-[#adff41]/20 transition-colors duration-500" />
              
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-background border border-border/50 shadow-inner">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="64px"
                  className="object-contain p-2 mix-blend-multiply dark:mix-blend-normal"
                />
              </div>
              
              <div className="min-w-0 flex-1 relative z-10">
                <p className="truncate text-base font-bold text-foreground tracking-tight">{product.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-black text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    {product.rating.toFixed(1)}
                  </div>
                  <Badge variant="outline" className="rounded-full border-border/50 text-[10px] text-muted-foreground font-semibold px-2">
                    {product.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 relative z-10 mr-2 border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" />
                <span>Getirildi</span>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Bu ürünü kimin için alıyorsun?</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {GIFT_TARGETS.map((t) => {
                    const active = giftTarget === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setGiftTarget(t.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                          active
                            ? "cursor-pointer bg-foreground text-background shadow-md scale-[1.02]"
                            : "cursor-pointer bg-muted/40 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("size-3.5", active ? "text-[#adff41]" : "")} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <p className="mb-2 text-sm font-semibold text-foreground">Kullanım amacı veya beklentin ne?</p>
                <div className="relative group">
                  <Textarea
                    value={userNeed}
                    onChange={(e) => setUserNeed(e.target.value)}
                    placeholder="Örn: Online ders ve oyun için, mikrofonu iyi olsun, 1500 TL'yi geçmesin."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-border/30 bg-muted/30 px-5 py-4 text-sm text-foreground shadow-inner outline-none placeholder:text-muted-foreground/40 focus:bg-background focus:ring-2 focus:ring-[#adff41]/50 focus:border-transparent transition-all"
                  />
                  <span className="absolute bottom-3 right-4 text-[10px] font-medium text-muted-foreground/40 group-focus-within:text-muted-foreground/70 transition-colors">
                    {userNeed.length}/500
                  </span>
                </div>
                {needError && (
                  <p className="mt-2 text-xs font-medium text-red-500 dark:text-red-400">{needError}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_NEEDS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() =>
                      setUserNeed((prev) =>
                        prev ? `${prev}, ${q.toLowerCase()}` : q
                      )
                    }
                    className="cursor-pointer rounded-full border border-border/50 bg-background px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-[#adff41]/30 hover:text-foreground hover:bg-[#adff41]/5 transition-all"
                  >
                    + {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-border/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  className="h-14 rounded-full px-6 border-border/50 font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Geri
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-14 rounded-full bg-[#adff41] text-[#0a0a0f] text-base font-black hover:bg-[#9aef30] shadow-lg shadow-[#adff41]/20 transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="mr-2 size-5" />
                      Zekai'ye Danış
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ─ Step 3: Launching ────────────────────────────────────────── */}
        {step === "launching" && (
          <motion.div
            key="launching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm mx-auto flex items-center gap-4 rounded-3xl border border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl p-6"
          >
            <div className="relative flex size-10 shrink-0 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#adff41]/20" />
              <div className="relative flex size-10 items-center justify-center rounded-full bg-[#adff41]/10 border border-[#adff41]/30">
                <Zap className="size-5 text-[#5a8a00] dark:text-[#adff41]" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Zekai değerlendiriyor...</p>
              <p className="text-xs text-muted-foreground">Ürün yorumları ve pazar verileri senin için inceleniyor</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

