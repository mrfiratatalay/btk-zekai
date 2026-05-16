"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, Eye, Package, Search, Sparkles, Star, Store, Tag, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSellerProducts, getSellerStore, connectStore, type SellerProduct, type StoreConnection } from "@/lib/api/seller";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type FilterKey = "all" | "active" | "draft";

function isDraft(stock: number) { return stock < 15; }

export function SellerProducts() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [storeConn, setStoreConn] = useState<StoreConnection | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectEmail, setConnectEmail] = useState("");
  const [connectPassword, setConnectPassword] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState("");

  async function handleConnectStore(e: React.FormEvent) {
    e.preventDefault();
    setConnectError("");
    setConnectLoading(true);
    try {
      const conn = await connectStore(connectEmail, connectPassword);
      setStoreConn(conn);
      setShowConnectModal(false);
      setConnectEmail("");
      setConnectPassword("");
      const prods = await getSellerProducts();
      setProducts(prods);
    } catch (err: unknown) {
      setConnectError(err instanceof Error ? err.message : "Bağlantı kurulamadı.");
    } finally {
      setConnectLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const conn = await getSellerStore().catch(() => null);
        setStoreConn(conn);
        if (conn) {
          const prods = await getSellerProducts();
          setProducts(prods);
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR")))
      .filter((p) => {
        if (filter === "active") return !isDraft(p.stock);
        if (filter === "draft") return isDraft(p.stock);
        return true;
      });
  }, [products, search, filter]);

  const urgentCount = products.filter((p) => p.status === "Urgent").length;
  const isConnected = storeConn !== null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-100 dark:bg-white/8" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/8" />
          ))}
        </div>
      </div>
    );
  }

  // Mağaza bağlı değil — onboarding
  if (!isConnected) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünlerim</h1>
          <p className="mt-1 text-sm text-gray-400">Akıllı Market mağazanı bağladıktan sonra ürünlerin burada görünecek.</p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-10 text-center dark:border-amber-500/30 dark:bg-amber-500/5">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/10">
            <Store className="size-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mağaza Bağlantısı Gerekli</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Ürünlerini ZekAI&apos;a çekmek için önce Akıllı Market satıcı hesabınla bağlantı kurman gerekiyor.
          </p>
          <div className="mt-4 rounded-xl bg-white/80 p-4 text-left max-w-xs mx-auto dark:bg-white/5">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Demo hesap ile dene:</p>
            <p className="mt-1 text-sm font-mono text-green-600 dark:text-green-400">mehmet@ornekstore.com</p>
            <p className="text-sm font-mono text-green-600 dark:text-green-400">Seller123!</p>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white hover:bg-green-600"
          >
            <Store className="size-4" />
            Mağazamı Bağla
          </button>
        </div>

        {/* Connect Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1a1a1a]">
              <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">Akıllı Market&apos;i Bağla</h3>
              <p className="mb-5 text-sm text-gray-500">Akıllı Market satıcı hesabınızla giriş yapın.</p>
              {connectError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {connectError}
                </div>
              )}
              <form onSubmit={handleConnectStore} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">E-posta</label>
                  <input type="email" value={connectEmail} onChange={(e) => setConnectEmail(e.target.value)}
                    placeholder="satis@ornekstore.com" required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-green-500 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">Şifre</label>
                  <input type="password" value={connectPassword} onChange={(e) => setConnectPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-green-500 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                </div>
                <p className="text-xs text-gray-400">
                  Demo: <code className="text-green-600 dark:text-green-400">mehmet@ornekstore.com</code> / <code className="text-green-600 dark:text-green-400">Seller123!</code>
                </p>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={connectLoading}
                    className="flex-1 h-11 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60">
                    {connectLoading ? "Bağlanıyor..." : "Bağla"}
                  </button>
                  <button type="button" onClick={() => { setShowConnectModal(false); setConnectError(""); }}
                    className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mağaza bağlı — gerçek ürünleri göster
  return (
    <div className="space-y-5">
      {/* Başlık */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünlerim</h1>
          <p className="mt-1 text-sm text-gray-400">
            {products.length} ürün · {storeConn.storeName}
          </p>
        </div>
        {bannerVisible && urgentCount > 0 && (
          <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-green-200 bg-green-50 py-2 pl-3 pr-3 dark:border-green-500/20 dark:bg-green-500/10">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-500">
              <Zap className="size-3.5 text-white" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-bold">{urgentCount} ürün</span> acil müdahale bekliyor.
            </p>
            <button onClick={() => setBannerVisible(false)} className="ml-1 text-gray-400 hover:text-gray-600">
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Araçlar */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı ile ara..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "active", "draft"] as FilterKey[]).map((key) => {
            const label = key === "all" ? "Tümü" : key === "active" ? "Aktif" : "Taslak";
            return (
              <button key={key} onClick={() => setFilter(key)}
                className={cn("h-9 rounded-xl px-5 text-sm font-semibold transition-all",
                  filter === key ? "bg-green-500 text-white" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200")}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ürün grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map((product, idx) => {
          const draft = isDraft(product.stock);
          const featured = idx === 0 && filter === "all" && product.status === "Urgent";
          const rating = draft ? "–" : (5 - product.returnRate / 20).toFixed(1);

          return (
            <div key={product.id}
              className={cn("flex flex-col overflow-hidden rounded-2xl bg-white transition-all hover:shadow-md dark:bg-[#111]",
                featured ? "border-2 border-green-500 shadow-md" : "border border-gray-200 shadow-sm dark:border-white/10")}>

              <Link href={`/seller/product/${product.id}`}
                className="relative flex gap-0 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors">
                {featured && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    <Sparkles className="size-3" />
                    Öncelikli
                  </div>
                )}
                <div className="relative m-4 size-36 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                  {product.primaryImage ? (
                    <Image src={product.primaryImage} alt={product.title} fill sizes="144px" className="object-contain p-3" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <Package className="size-10" />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-4">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 dark:text-white">{product.title}</h3>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={cn("text-sm font-bold", draft ? "text-gray-400" : "text-green-600 dark:text-green-400")}>
                      {draft ? "Taslak" : "Aktif"}
                    </span>
                    <span className={cn("size-1.5 rounded-full", draft ? "bg-gray-300" : "bg-green-500")} />
                    {product.status === "Urgent" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">Acil</span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {[
                      { icon: <Tag className="size-3" />, label: "Fiyat", value: formatPrice(product.price) },
                      { icon: <Package className="size-3" />, label: "Stok", value: draft ? "–" : String(product.stock) },
                      { icon: <Star className="size-3" />, label: "Puan", value: rating },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex items-center gap-1 text-gray-400">{stat.icon}<span className="text-[11px]">{stat.label}</span></div>
                        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-[11px] text-gray-400">
                    Son güncelleme: {new Date(product.updatedAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </Link>

              <div className="flex flex-col gap-2 border-t border-gray-100 px-4 pb-4 pt-3 dark:border-white/8">
                <Link href={`/seller/product/${product.id}/simulation`}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white transition-colors hover:bg-green-600">
                  Müşteri Simülasyonuyla Test Et
                  <span className="text-green-200">›</span>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/seller/product/${product.id}/ai-edit`}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5">
                    <Bot className="size-4 text-gray-400" />
                    AI ile Düzenle
                  </Link>
                  <a href={`${process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000"}/product/${product.id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5">
                    <Eye className="size-4 text-gray-400" />
                    Mağazada Gör
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <Package className="mx-auto mb-3 size-8 text-gray-200" />
          <p className="text-sm text-gray-400">
            {search ? "Arama kriterine uyan ürün bulunamadı." : "Henüz ürün eklenmemiş."}
          </p>
        </div>
      )}
    </div>
  );
}
