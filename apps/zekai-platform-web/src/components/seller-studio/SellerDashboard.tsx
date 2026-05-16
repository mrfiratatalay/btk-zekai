"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Bot, ChevronRight, Loader2,
  Package, RefreshCw, Sparkles, Store, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSellerProducts, getSellerStore, connectStore,
  type SellerProduct, type StoreConnection,
} from "@/lib/api/seller";
import { getCurrentUser } from "@/lib/api/auth";

// ─── Platform definitions ─────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "akilli-market", label: "Akıllı Market", available: true },
  { id: "trendyol", label: "Trendyol", available: false },
  { id: "hepsiburada", label: "Hepsiburada", available: false },
  { id: "n11", label: "N11", available: false },
];

// ─── Onboarding Popup ────────────────────────────────────────────────────────

type OnboardingStep = 1 | 2 | 3;

interface OnboardingPopupProps {
  onDone: (conn: StoreConnection, prods: SellerProduct[]) => void;
  onSkip: () => void;
}

function OnboardingPopup({ onDone, onSkip }: OnboardingPopupProps) {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const conn = await connectStore(selectedPlatform, apiKey.trim());
      const prods = await getSellerProducts();
      setStep(3);
      setTimeout(() => onDone(conn, prods), 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#1a1a1a]">

        {/* Skip */}
        <button
          onClick={onSkip}
          className="absolute right-5 top-5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          Atla
        </button>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-8 pt-6">
          {([1, 2, 3] as OnboardingStep[]).map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                s <= step ? "bg-green-500" : "bg-gray-100 dark:bg-white/10"
              )}
            />
          ))}
        </div>

        {/* Step 1 — Platform seç */}
        {step === 1 && (
          <div className="px-8 pb-8 pt-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Platformunu seç</h2>
            <p className="mt-1.5 text-sm text-gray-400">
              Hangi platformdaki mağazanı ZekAI&apos;a bağlamak istiyorsun?
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  disabled={!p.available}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all",
                    !p.available && "cursor-not-allowed opacity-40",
                    p.available && selectedPlatform === p.id
                      ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                      : p.available
                      ? "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5"
                      : "border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/3"
                  )}
                >
                  {!p.available && (
                    <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-400 dark:bg-white/8 dark:text-gray-500">
                      Yakında
                    </span>
                  )}
                  <div className={cn(
                    "flex size-8 items-center justify-center rounded-xl",
                    selectedPlatform === p.id ? "bg-green-100 dark:bg-green-500/20" : "bg-gray-100 dark:bg-white/8"
                  )}>
                    <Store className={cn("size-4", selectedPlatform === p.id ? "text-green-600 dark:text-green-400" : "text-gray-400")} />
                  </div>
                  <p className={cn("text-sm font-bold", selectedPlatform === p.id ? "text-green-700 dark:text-green-300" : "text-gray-800 dark:text-gray-200")}>
                    {p.label}
                  </p>
                </button>
              ))}
            </div>

            <button
              disabled={!selectedPlatform}
              onClick={() => setStep(2)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-3.5 text-sm font-bold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Devam Et
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* Step 2 — API Key */}
        {step === 2 && (
          <div className="px-8 pb-8 pt-6">
            <button onClick={() => setStep(1)} className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              ← Geri
            </button>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">API Anahtarını Gir</h2>
            <p className="mt-1.5 text-sm text-gray-400">
              Akıllı Market satıcı panelinizden API anahtarınızı kopyalayıp yapıştırın.
            </p>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/8">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Nasıl bulurum?</p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Akıllı Market → Satıcı Paneli → <strong>API Entegrasyonu</strong> bölümünden anahtarınızı kopyalayın.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleConnect} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">API Anahtarı</label>
                <textarea
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-xs text-gray-800 outline-none focus:border-green-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="size-4 animate-spin" /> Doğrulanıyor...</> : "Bağla →"}
              </button>
            </form>
          </div>
        )}

        {/* Step 3 — Başarılı */}
        {step === 3 && (
          <div className="px-8 pb-8 pt-6 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-500/10">
              <Sparkles className="size-8 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Mağazan Bağlandı!</h2>
            <p className="mt-2 text-sm text-gray-400">Ürünlerin yükleniyor...</p>
            <div className="mt-6 flex justify-center">
              <Loader2 className="size-6 animate-spin text-green-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SellerProduct["status"] }) {
  if (status === "Urgent") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">
        Acil
      </span>
    );
  }
  if (status === "Watch") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
        Takipte
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:bg-green-500/15 dark:text-green-400">
      Sağlıklı
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function SellerDashboard() {
  const user = getCurrentUser();

  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [storeConn, setStoreConn] = useState<StoreConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const conn = await getSellerStore().catch(() => null);
        if (conn) {
          const prods = await getSellerProducts();
          setProducts(prods);
          setStoreConn(conn);
        } else {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
        setShowOnboarding(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleOnboardingDone(conn: StoreConnection, prods: SellerProduct[]) {
    setStoreConn(conn);
    setProducts(prods);
    setShowOnboarding(false);
  }

  function handleReset() {
    setStoreConn(null);
    setProducts([]);
    setShowOnboarding(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-green-500" />
      </div>
    );
  }

  const isConnected = storeConn !== null;

  // Products sorted by health score ascending (worst first), max 6 shown
  const productQueue = [...products]
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 6);

  return (
    <>
      {/* Onboarding popup */}
      {showOnboarding && (
        <OnboardingPopup
          onDone={handleOnboardingDone}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Blurred placeholder when not connected and no popup (after skip) */}
      <div className={cn("space-y-8", showOnboarding && "pointer-events-none select-none blur-sm")}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Merhaba, {user?.fullName?.split(" ")[0] ?? "Satıcı"}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isConnected
                ? `${storeConn.storeName} · ${storeConn.productCount} ürün`
                : "Başlamak için mağazanı bağla"}
            </p>
          </div>
          {!isConnected && (
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600"
            >
              <Store className="size-4" />
              Mağazamı Bağla
            </button>
          )}
          {isConnected && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Mağaza bağlantısını değiştir"
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:text-gray-400 dark:hover:bg-white/5"
              >
                <RefreshCw className="size-3.5" />
                Mağazayı Değiştir
              </button>
              <Link
                href="/seller/products"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:text-gray-300 dark:hover:bg-white/5"
              >
                <Package className="size-4" />
                Tüm Ürünler
              </Link>
            </div>
          )}
        </div>

        {/* Action kartları */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/seller/products"
            className="group flex flex-col gap-4 rounded-3xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-white p-6 transition-all hover:border-green-300 hover:shadow-lg dark:border-green-500/20 dark:from-green-500/5 dark:to-transparent"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-500/15">
              <Zap className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 dark:text-white">Müşteri Simülasyonu</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                12 farklı alıcı profiliyle ürününü test et. Kimin neden satın alıp almadığını gör.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
              Ürün seç
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/seller/products"
            className="group flex flex-col gap-4 rounded-3xl border-2 border-gray-100 bg-white p-6 transition-all hover:border-gray-200 hover:shadow-lg dark:border-white/8 dark:bg-[#111] dark:hover:border-white/15"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/8">
              <Bot className="size-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 dark:text-white">AI İçerik Optimizasyonu</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Başlık, açıklama ve özellik listesi için AI önerileri al. Dönüşüm oranını artır.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400">
              Ürün seç
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        {/* Ürün listesi */}
        {isConnected && productQueue.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Ürünlerin</h2>
              {products.length > 6 && (
                <Link
                  href="/seller/products"
                  className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  Tümünü gör <ArrowRight className="size-4" />
                </Link>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
              {productQueue.map((product, i) => (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4",
                    i > 0 && "border-t border-gray-100 dark:border-white/8"
                  )}
                >
                  {/* Görsel */}
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                    {product.primaryImage ? (
                      <Image src={product.primaryImage} alt={product.title} fill sizes="44px" className="object-contain p-1" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="size-4 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Bilgi */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{product.title}</p>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{product.category}</p>
                  </div>

                  {/* Aksiyon butonları */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/seller/product/${product.id}/simulation`}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-green-500 px-3 text-xs font-bold text-white hover:bg-green-600"
                    >
                      <Zap className="size-3" />
                      Simüle Et
                    </Link>
                    <Link
                      href={`/seller/product/${product.id}/ai-edit`}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/8"
                    >
                      <Bot className="size-3" />
                      AI Düzenle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bağlı değil + popup kapatıldıysa (skip) basit CTA */}
        {!isConnected && !showOnboarding && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center dark:border-white/10">
            <Store className="mx-auto mb-3 size-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Mağaza bağlı değil</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="mt-4 text-sm font-bold text-green-600 hover:text-green-700 dark:text-green-400"
            >
              Bağla →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
