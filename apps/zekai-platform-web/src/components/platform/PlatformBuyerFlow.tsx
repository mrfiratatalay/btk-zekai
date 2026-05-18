"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getProduct, type ProductDetail } from "@/lib/api/products";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";
const LINK_PREFIX = `${COMMERCE_WEB_URL}/product/`;

function formatPrice(v: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(v);
}

function resolveProductId(url: string): string | null {
  // Try /product/<slug> pattern
  const m = url.match(/\/(?:product|urun)\/([^/?#]+)/);
  if (m) return m[1];
  // Try bare slug (no protocol)
  if (!url.includes("/") && url.trim().length > 0) return url.trim();
  return null;
}

function encodeAnalysisId(productId: string, need: string) {
  // Türkçe karakterler percent-encoded olduğunda 3 byte alır (ğ→%C4%9F, ı→%C4%B1).
  // 80 char = sadece ~26 gerçek Türkçe harf. 500 ile tam ihtiyaç metni Gemini'ye ulaşır.
  return `${productId}--${encodeURIComponent(need).slice(0, 500)}`;
}

export function PlatformBuyerFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preloadedId = searchParams.get("productId");

  const [url, setUrl] = useState(preloadedId ? `${LINK_PREFIX}${preloadedId}` : "");
  const [linkError, setLinkError] = useState("");
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [step, setStep] = useState<"link" | "need" | "launching">("link");
  const [userNeed, setUserNeed] = useState("");
  const [needError, setNeedError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Preload product from query param
  useEffect(() => {
    if (!preloadedId) return;
    setLoadingProduct(true);
    getProduct(preloadedId)
      .then((p) => { setProduct(p); setStep("need"); })
      .catch(() => { /* stay on link step if preload fails */ })
      .finally(() => setLoadingProduct(false));
  }, [preloadedId]);

  async function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLinkError("");
    const id = resolveProductId(url.trim());
    if (!id) {
      setLinkError("Link tanınamadı. Demo mağazadan bir ürün linki kopyala.");
      return;
    }
    setLoadingProduct(true);
    try {
      const found = await getProduct(id);
      setProduct(found);
      setStep("need");
    } catch {
      setLinkError("Ürün bulunamadı. Lütfen geçerli bir ürün linki girin.");
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
      const id = encodeAnalysisId(product.id, userNeed.trim());
      router.push(`/platform/analysis/${id}`);
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            Ana Sayfa
          </Link>
          <span className="text-sm font-black">
            Zek<span className="text-[#5a8a00] dark:text-[#adff41]">AI</span>{" "}
            <span className="font-normal text-muted-foreground/70">Platform</span>
          </span>
          <Link href={COMMERCE_WEB_URL}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
              <ExternalLink className="size-3.5 mr-1.5" />
              Demo Mağaza
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Step indicators */}
        <div className="mb-10 flex items-center gap-2">
          {(["link", "need", "launching"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step === s
                    ? "bg-[#adff41] text-[#0a0a0f]"
                    : i < ["link", "need", "launching"].indexOf(step)
                    ? "bg-[#adff41]/20 text-[#5a8a00] dark:text-[#adff41]"
                    : "bg-muted text-muted-foreground/70"
                }`}
              >
                {i < ["link", "need", "launching"].indexOf(step) ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && <div className={`h-px w-8 ${i < ["link", "need", "launching"].indexOf(step) ? "bg-[#adff41]/40" : "bg-border"}`} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground/70">
            {step === "link" && "Ürün linkini yapıştır"}
            {step === "need" && "İhtiyacını açıkla"}
            {step === "launching" && "Analiz başlatılıyor..."}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Link */}
          {step === "link" && (
            <motion.div
              key="link"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="mb-2 text-3xl font-black">Ürün linkini yapıştır</h1>
              <p className="mb-8 text-muted-foreground">
                Demo mağazadan bir ürünün sayfasına gidip linkini kopyala ve
                buraya yapıştır.
              </p>

              <form onSubmit={handleLinkSubmit} className="space-y-4">
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/70" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={`${COMMERCE_WEB_URL}/product/...`}
                    className="w-full rounded-xl border border-border bg-muted py-3.5 pl-12 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-emerald-500 dark:focus:border-[#adff41]/40 focus:bg-[#adff41]/5 transition-all"
                  />
                </div>
                {linkError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{linkError}</p>
                )}
                <Button
                  type="submit"
                  disabled={loadingProduct}
                  className="w-full h-12 bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] disabled:opacity-70"
                >
                  {loadingProduct ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Ürünü Getir
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 rounded-xl border border-border bg-muted/20 p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground/70">
                  Hızlı başla — örnek ürünler:
                </p>
                <div className="space-y-2">
                  {[
                    { id: "bluetooth-kulaklik-pro-x1", label: "Bluetooth Kulaklık Pro X1" },
                    { id: "akilli-saat-fit-neo", label: "Akıllı Saat FitNeo S3" },
                    { id: "ergonomik-calisma-sandalyesi", label: "Ergonomik Çalışma Sandalyesi" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setUrl(`${LINK_PREFIX}${item.id}`);
                        setLinkError("");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-muted"
                    >
                      <Package className="size-4 shrink-0 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <ArrowRight className="ml-auto size-3.5 text-muted-foreground/50" />
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground/50">
                  veya{" "}
                  <Link href={COMMERCE_WEB_URL} className="text-[#5a8a00] dark:text-[#adff41] hover:underline">
                    ZekAI Market&apos;e git →
                  </Link>{" "}
                  ürünlere göz at
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Product preview + need */}
          {step === "need" && product && (
            <motion.div
              key="need"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Product preview card */}
              <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-muted/40">
                <div className="flex gap-4 p-5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    <Image
                      src={product.images[0] ?? product.primaryImage}
                      alt={product.title}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/70">
                      <span>{product.brand}</span>
                      <span>·</span>
                      <span>{product.sellerName}</span>
                      <Badge className="rounded-full bg-[#adff41]/10 text-[#5a8a00] dark:text-[#adff41] border-0 text-[10px]">
                        {product.category}
                      </Badge>
                    </div>
                    <h2 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                      {product.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-lg font-black text-[#5a8a00] dark:text-[#adff41]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground/50 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span>({product.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border bg-emerald-50 dark:bg-[#adff41]/[0.03] px-5 py-3">
                  <div className="flex items-center gap-2 text-xs text-[#5a8a00] dark:text-[#5a8a00]/60 dark:text-[#adff41]/60">
                    <CheckCircle2 className="size-3.5" />
                    Ürün bilgileri başarıyla getirildi
                  </div>
                </div>
              </div>

              <h1 className="mb-2 text-2xl font-black">Bu ürünü ne için alıyorsun?</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                İhtiyacını doğal dille açıkla — Zekai analizi buna göre kişiselleştirir.
              </p>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={userNeed}
                    onChange={(e) => setUserNeed(e.target.value)}
                    placeholder="Örn: Online ders ve oyun için alacağım. Mikrofonu iyi olsun, kulağımı acıtmasın, 1500 TL'yi geçmesin."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-border bg-muted text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-emerald-500 dark:focus:border-[#adff41]/40 focus:bg-[#adff41]/5 transition-all"
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
                    {userNeed.length}/500
                  </span>
                </div>
                {needError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{needError}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {["Müzik dinlemek için", "Oyun ve ders için", "Uzun süreli kullanım", "Hediye alacağım"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setUserNeed((prev) => prev ? `${prev}, ${q.toLowerCase()}` : q)}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground hover:border-border hover:text-foreground/60 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-12 w-full bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] disabled:opacity-70"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="mr-2 size-4" />
                        AI Karar Raporu Oluştur
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setStep("link"); setProduct(null); }}
                    className="text-muted-foreground/70 hover:text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Farklı ürün seç
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Launching */}
          {step === "launching" && (
            <motion.div
              key="launching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6 py-16 text-center"
            >
              <div className="relative flex size-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#adff41]/20" />
                <div className="relative flex size-20 items-center justify-center rounded-full bg-[#adff41]/10 border border-[#adff41]/30">
                  <Zap className="size-8 text-[#5a8a00] dark:text-[#adff41]" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black">Ajanlar çalışıyor...</h2>
                <p className="mt-2 text-muted-foreground">
                  5 Gemini ajanı ürünü analiz ediyor. Yönlendiriliyor...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
