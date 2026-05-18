"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Loader2, Plus, Store, Trash2, X } from "lucide-react";
import { getCurrentUser } from "@/lib/api/auth";
import {
  getStoreConnections,
  connectStore,
  disconnectStore,
  type StoreConnection,
} from "@/lib/api/seller";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "akilli-market", label: "Akıllı Market", available: true },
  { id: "trendyol", label: "Trendyol", available: false },
  { id: "hepsiburada", label: "Hepsiburada", available: false },
  { id: "n11", label: "N11", available: false },
];

/* ─── Connect Modal ───────────────────────────────────────────────────────── */
function ConnectModal({ onClose, onConnected }: {
  onClose: () => void;
  onConnected: (conn: StoreConnection) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [platform, setPlatform] = useState("akilli-market");
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const platformLabel = PLATFORMS.find(p => p.id === platform)?.label ?? platform;
      const conn = await connectStore(apiKey.trim(), storeName.trim() || platformLabel, platform);
      onConnected(conn);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-sm font-bold text-foreground">
            {step === 1 ? "Platform seç" : "Bağlantı bilgileri"}
          </h3>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pb-4">
          {[1, 2].map((s) => (
            <div key={s} className={cn("h-0.5 flex-1 rounded-full transition-all duration-300", s <= step ? "bg-green-500" : "bg-muted")} />
          ))}
        </div>

        {step === 1 && (
          <div className="px-5 pb-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={!p.available}
                  onClick={() => p.available && setPlatform(p.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all",
                    p.available ? "cursor-pointer" : "cursor-not-allowed opacity-35 border-border/50",
                    p.available && platform === p.id ? "border-green-500 bg-green-500/8 dark:bg-green-500/10" : "",
                    p.available && platform !== p.id ? "border-border hover:border-green-500/40 hover:bg-green-500/5" : ""
                  )}
                >
                  <Store className={cn("size-5", platform === p.id ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-bold", platform === p.id ? "text-green-700 dark:text-green-300" : "text-foreground")}>{p.label}</span>
                  {!p.available && <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/50">Yakında</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 active:scale-95 transition-all"
            >
              Devam <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleConnect} className="px-5 pb-5 space-y-4">
            <button type="button" onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Geri
            </button>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Mağaza Adı <span className="font-normal opacity-50">(opsiyonel)</span>
                </label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Örn: Fırat Elektronik"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">API Anahtarı</label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="am_live_..."
                  required
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none focus:border-green-500 transition-colors"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Akıllı Market → Satıcı Paneli → <strong>API Erişimi</strong>
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/40">
                  Demo: am_live_demo_mehmet_elektronik_2024
                </p>
              </div>
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Bağlanıyor..." : "Mağazayı Bağla"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Ana Sayfa ───────────────────────────────────────────────────────────── */
export function SellerSettings() {
  const user = getCurrentUser();
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    getStoreConnections()
      .then(setConnections)
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDisconnect(id: string) {
    setDisconnecting(id);
    setErrorMsg("");
    try {
      await disconnectStore(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Bağlantı kesilemedi.");
    } finally {
      setDisconnecting(null);
    }
  }

  function handleConnected(conn: StoreConnection) {
    setConnections((prev) => [...prev.filter((c) => c.id !== conn.id), conn]);
    setSuccessMsg("Mağaza başarıyla bağlandı!");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      {showModal && <ConnectModal onClose={() => setShowModal(false)} onConnected={handleConnected} />}

      <div className="max-w-2xl">

        {/* ── Profil hero ── */}
        <div className="flex items-center gap-5 pb-8 border-b border-border">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-xl font-black text-white shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-black text-foreground">{user?.fullName ?? "—"}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email ?? "—"}</p>
          </div>
          <span className="shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400">
            Satıcı
          </span>
        </div>

        {/* ── Mağaza Bağlantıları ── */}
        <div className="pt-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Mağaza Bağlantıları</p>
              <p className="mt-0.5 text-xs text-muted-foreground">API anahtarınla mağazanı bağla, ürünler otomatik çekilsin.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3.5 py-2.5 text-sm font-bold text-white hover:bg-green-600 active:scale-95 transition-all sm:w-auto sm:py-2"
            >
              <Plus className="size-4" />
              Mağaza Ekle
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : connections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <Store className="mx-auto mb-3 size-8 text-muted-foreground/20" />
              <p className="text-sm font-semibold text-foreground">Henüz bağlı mağaza yok</p>
              <p className="mt-1 text-xs text-muted-foreground">Mağazanı bağladıktan sonra ürünlerin buraya çekilecek.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 transition-colors"
              >
                <Plus className="size-4" />
                Mağaza Bağla
              </button>
            </div>
          ) : (
            <div>
              {connections.map((conn, i) => (
                <div
                  key={conn.id}
                  className={cn("group flex items-center gap-4 py-4", i > 0 && "border-t border-border")}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                    <Store className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{conn.storeName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {PLATFORMS.find(p => p.id === conn.platform)?.label ?? conn.platform}
                      {" · "}{conn.productCount} ürün
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">Bağlı</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    disabled={disconnecting === conn.id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground/40 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    {disconnecting === conn.id
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Trash2 className="size-3.5" />}
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mesajlar */}
        {errorMsg && (
          <p className="mt-4 text-sm text-red-500">{errorMsg}</p>
        )}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-4" />
            {successMsg}
          </div>
        )}
      </div>
    </>
  );
}
