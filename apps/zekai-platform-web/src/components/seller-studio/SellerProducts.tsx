"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Package, RefreshCw, Search, Settings, Store, Tag } from "lucide-react";
import { getSellerProducts, getStoreConnections, type SellerProduct, type StoreConnection } from "@/lib/api/seller";
import { resolveCommerceImage } from "@/lib/utils";

const FOCUS_REFRESH_MIN_MS = 3_000;

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatFetchedAt(date: Date) {
  return date.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SellerProducts() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [storeConn, setStoreConn] = useState<StoreConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const lastFetchedAtRef = useRef<number>(0);
  const isConnectedRef = useRef(false);

  const markFetched = useCallback(() => {
    const now = Date.now();
    lastFetchedAtRef.current = now;
    setLastFetchedAt(new Date(now));
  }, []);

  const pullProducts = useCallback(async (refresh: boolean) => {
    const prods = await getSellerProducts(refresh);
    setProducts(prods);
    markFetched();
    return prods;
  }, [markFetched]);

  const loadInitial = useCallback(async () => {
    setFetchError(null);
    try {
      const conns = await getStoreConnections();
      const conn = conns.find((c) => c.hasApiKey && c.status === "Connected") ?? null;
      setStoreConn(conn);
      isConnectedRef.current = conn !== null;

      if (conn) {
        await pullProducts(false);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
      setFetchError("Ürün listesi yüklenemedi. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  }, [pullProducts]);

  const handleRefresh = useCallback(async () => {
    if (!isConnectedRef.current) return;

    setRefreshing(true);
    setFetchError(null);
    try {
      await pullProducts(true);
    } catch (e) {
      console.error("Failed to refresh products:", e);
      setFetchError("Ürün listesi güncellenemedi. Lütfen tekrar dene.");
    } finally {
      setRefreshing(false);
    }
  }, [pullProducts]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    function handleFocus() {
      if (!isConnectedRef.current) return;
      if (Date.now() - lastFetchedAtRef.current < FOCUS_REFRESH_MIN_MS) return;
      void pullProducts(true).catch((e) => {
        console.error("Failed to refresh products on focus:", e);
      });
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [pullProducts]);

  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))
    );
  }, [products, search]);

  const isConnected = storeConn !== null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Store className="size-7 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-base font-bold text-foreground">Mağaza bağlı değil</h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          Ürünlerini görmek için önce mağaza bağlantısı kurman gerekiyor.
        </p>
        <Link
          href="/seller/settings"
          className="mt-5 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-600 transition-colors"
        >
          <Settings className="size-4" />
          Ayarlara Git
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ürünlerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} ürün · {storeConn.storeName}
            {lastFetchedAt ? ` · ${formatFetchedAt(lastFetchedAt)}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Güncelleniyor…" : "Yenile"}
        </button>
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {fetchError}
        </div>
      )}

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün adı ile ara..."
          className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-green-400"
        />
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${refreshing ? "opacity-60" : ""}`}>
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/seller/product/${product.id}`}
            className="flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-border/80"
          >
            <div className="relative m-4 size-36 shrink-0 overflow-hidden rounded-xl bg-muted">
              {product.primaryImage ? (
                <Image src={resolveCommerceImage(product.primaryImage)} alt={product.title} fill sizes="144px" className="object-contain p-3" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Package className="size-10" />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
              <div className="flex items-start gap-2">
                <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">{product.title}</h3>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1">
                {[
                  { icon: <Tag className="size-3" />, label: "Fiyat", value: formatPrice(product.price) },
                  { icon: <Package className="size-3" />, label: "Stok", value: String(product.stock) },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center gap-1 text-muted-foreground">{stat.icon}<span className="text-[11px]">{stat.label}</span></div>
                    <p className="mt-0.5 text-sm font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] text-muted-foreground">
                Son güncelleme: {new Date(product.updatedAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <Package className="mx-auto mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? "Arama kriterine uyan ürün bulunamadı." : "Henüz ürün eklenmemiş."}
          </p>
        </div>
      )}
    </div>
  );
}
