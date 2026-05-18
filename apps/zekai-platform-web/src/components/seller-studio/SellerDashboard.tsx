"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Bot, ChevronRight, Loader2,
  RefreshCw, Sparkles, Store, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getStoreConnections, connectStore, disconnectStore,
  type StoreConnection,
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
  onDone: (conn: StoreConnection) => void;
  onSkip: () => void;
}

function OnboardingPopup({ onDone, onSkip }: OnboardingPopupProps) {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const conn = await connectStore(apiKey.trim(), storeName.trim() || selectedPlatform, selectedPlatform);
      setStep(3);
      setTimeout(() => onDone(conn), 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl">

        {/* Step indicators + Skip */}
        <div className="flex items-center gap-1.5 px-8 pt-6">
          {([1, 2, 3] as OnboardingStep[]).map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                s <= step ? "bg-green-500" : "bg-muted"
              )}
            />
          ))}
          <button
            onClick={onSkip}
            className="ml-2 shrink-0 cursor-pointer text-xs text-muted-foreground hover:text-gray-600 dark:hover:text-gray-200"
          >
            Atla
          </button>
        </div>

        {/* Step 1 — Platform seç */}
        {step === 1 && (
          <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            <h2 className="text-xl font-black text-foreground">Platformunu seç</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
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
                      ? "border-border bg-card hover:border-border"
                      : "border-border bg-background"
                  )}
                >
                  {!p.available && (
                    <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                      Yakında
                    </span>
                  )}
                  <div className={cn(
                    "flex size-8 items-center justify-center rounded-xl",
                    selectedPlatform === p.id ? "bg-green-500/15" : "bg-muted"
                  )}>
                    <Store className={cn("size-4", selectedPlatform === p.id ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
                  </div>
                  <p className={cn("text-sm font-bold", selectedPlatform === p.id ? "text-green-700 dark:text-green-300" : "text-foreground")}>
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
          <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            <button onClick={() => setStep(1)} className="mb-4 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-gray-600 dark:hover:text-gray-200">
              ← Geri
            </button>
            <h2 className="text-xl font-black text-foreground">API Anahtarını Gir</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Akıllı Market satıcı panelinizden API anahtarınızı kopyalayıp yapıştırın.
            </p>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/8">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Nasıl bulurum?</p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Akıllı Market → Satıcı Paneli → <strong>API Erişimi</strong> bölümünden anahtarınızı kopyalayın.
              </p>
              <p className="mt-2 text-xs text-blue-500 dark:text-blue-500">
                Demo: <code className="font-mono">am_live_demo_mehmet_elektronik_2024</code>
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleConnect} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Mağaza Adı</label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Örn: Mehmet Elektronik"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">API Anahtarı</label>
                <textarea
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="am_live_..."
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
          <div className="px-5 pb-6 pt-5 text-center sm:px-8 sm:pb-8 sm:pt-6">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-500/10">
              <Sparkles className="size-8 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-foreground">Mağazan Bağlandı!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Dashboard hazırlanıyor...</p>
            <div className="mt-6 flex justify-center">
              <Loader2 className="size-6 animate-spin text-green-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function SellerDashboard() {
  const user = getCurrentUser();

  const [storeConn, setStoreConn] = useState<StoreConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const connections = await getStoreConnections().catch(() => [] as StoreConnection[]);
        const active = connections.find((c) => c.hasApiKey && c.status === "Connected") ?? null;
        if (active) {
          setStoreConn(active);
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

  function handleOnboardingDone(conn: StoreConnection) {
    setStoreConn(conn);
    setShowOnboarding(false);
  }

  async function handleReset() {
    if (storeConn) {
      await disconnectStore(storeConn.id).catch(() => null);
    }
    setStoreConn(null);
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

  return (
    <>
      {/* Onboarding popup */}
      {showOnboarding && (
        <OnboardingPopup
          onDone={handleOnboardingDone}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      <div className={cn("space-y-8", showOnboarding && "pointer-events-none select-none blur-sm")}>

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Merhaba, {user?.fullName?.split(" ")[0] ?? "Satıcı"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isConnected
                ? `${storeConn.storeName} · ${storeConn.productCount} ürün`
                : "Başlamak için mağazanı bağla"}
            </p>
          </div>
          {!isConnected && (
            <button
              onClick={() => setShowOnboarding(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 sm:w-auto"
            >
              <Store className="size-4" />
              Mağazamı Bağla
            </button>
          )}
          {isConnected && (
            <button
              onClick={handleReset}
              title="Mağaza bağlantısını değiştir"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted sm:w-auto"
            >
              <RefreshCw className="size-3.5" />
              Mağazayı Değiştir
            </button>
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
              <p className="text-lg font-black text-foreground">Müşteri Simülasyonu</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-muted-foreground">
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
            className="group flex flex-col gap-4 rounded-3xl border-2 border-border bg-card p-6 transition-all hover:shadow-lg"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Bot className="size-6 text-gray-600 dark:text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">AI İçerik Optimizasyonu</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-muted-foreground">
                Başlık, açıklama ve özellik listesi için AI önerileri al. Dönüşüm oranını artır.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-muted-foreground">
              Ürün seç
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        {/* Bağlı değil + popup kapatıldıysa basit CTA */}
        {!isConnected && !showOnboarding && (
          <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
            <Store className="mx-auto mb-3 size-8 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500 dark:text-muted-foreground">Mağaza bağlı değil</p>
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
