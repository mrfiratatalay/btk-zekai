"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Package, Search, Store, Tag, X } from "lucide-react";
import { getSellerProducts, getSellerStore, connectStore, type SellerProduct, type StoreConnection } from "@/lib/api/seller";

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SellerProducts() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [storeConn, setStoreConn] = useState<StoreConnection | null>(null);
  const [loading, setLoading] = useState(true);

  // Connect modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectApiKey, setConnectApiKey] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState("");

  function closeConnectModal() {
    setShowConnectModal(false);
    setConnectApiKey("");
    setConnectError("");
  }

  async function handleConnectStore(e: React.FormEvent) {
    e.preventDefault();
    setConnectError("");
    setConnectLoading(true);
    try {
      const conn = await connectStore("Akıllı Market", connectApiKey);
      setStoreConn(conn);
      closeConnectModal();
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
    return products.filter((p) =>
      p.title.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))
    );
  }, [products, search]);

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
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Demo API anahtarı:</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Akıllı Market → Satıcı Paneli → Ayarlar → API Erişimi</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#161616]">

              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6 dark:border-white/8">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-500/10">
                    <Store className="size-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mağaza Bağlantısı</h3>
                    <p className="text-sm text-gray-400">Akıllı Market API anahtarınızla bağlanın</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeConnectModal}
                  className="flex size-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/8 dark:hover:text-gray-300"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleConnectStore} className="px-7 py-6 space-y-5">

                {/* Platform badge */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Platform</label>
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 dark:border-white/10 dark:bg-white/5">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Akıllı Market</span>
                    <span className="ml-auto text-xs text-gray-400">Bağlı platform</span>
                  </div>
                </div>

                {/* API Key field */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">API Anahtarı</label>
                  <input
                    type="text"
                    value={connectApiKey}
                    onChange={(e) => setConnectApiKey(e.target.value)}
                    placeholder="Satıcı panelinizden kopyaladığınız anahtarı yapıştırın"
                    required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                {/* How to get API key hint */}
                <div className="rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-500/8">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">API anahtarını nereden alırsınız?</p>
                  <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400/80">
                    Akıllı Market → Satıcı Paneli → Ayarlar → API Erişimi
                  </p>
                </div>

                {/* Error */}
                {connectError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {connectError}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={connectLoading || !connectApiKey.trim()}
                    className="h-12 w-full rounded-xl bg-green-500 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {connectLoading ? "Bağlanıyor..." : "Mağazayı Bağla"}
                  </button>
                  <button
                    type="button"
                    onClick={closeConnectModal}
                    className="h-11 w-full rounded-xl text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                  >
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünlerim</h1>
        <p className="mt-1 text-sm text-gray-400">
          {products.length} ürün · {storeConn.storeName}
        </p>
      </div>

      {/* Arama */}
      <div className="relative w-64">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün adı ile ara..."
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      {/* Ürün grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/seller/product/${product.id}`}
            className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-gray-300 dark:border-white/10 dark:bg-[#111] dark:hover:border-white/20"
          >
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
              <div className="mt-3 grid grid-cols-2 gap-1">
                {[
                  { icon: <Tag className="size-3" />, label: "Fiyat", value: formatPrice(product.price) },
                  { icon: <Package className="size-3" />, label: "Stok", value: String(product.stock) },
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
        ))}
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
