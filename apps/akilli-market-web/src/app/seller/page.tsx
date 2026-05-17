"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertTriangle, Check, Copy, Eye, EyeOff, ExternalLink, Key, Loader2, Package, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getSellerProducts, deleteProduct, getApiKey, regenerateApiKey, type SellerProduct } from "@/lib/api/seller";
import { getCurrentUser, type AuthUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { ShopHeader } from "@/components/shop/ShopHeader";

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser || currentUser.role !== "Seller") {
      window.location.href = "/login?returnUrl=/seller";
      return;
    }

    getApiKey().then(setApiKey).catch(() => setApiKey(null));
    getSellerProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleCopy() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleRegenerate() {
    if (!confirm("Yeni anahtar oluşturulacak. Eski anahtar geçersiz olacak ve ZekAI bağlantısını yeniden kurman gerekecek. Devam et?")) return;
    setRegenerating(true);
    try {
      const newKey = await regenerateApiKey();
      setApiKey(newKey);
      setKeyRevealed(true);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Anahtar oluşturulamadı.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinden emin misin?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Ürün silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Tutarlı navbar — AccountButton içinde logout sağ üstte */}
      <ShopHeader />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Başlık + Ürün Ekle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111827]">
              Satıcı Paneli
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              {user?.fullName} ·{" "}
              {loading ? "Yükleniyor..." : `${products.length} ürün`}
            </p>
          </div>
          <Link href="/seller/products/new">
            <Button className="cursor-pointer gap-2 rounded-xl bg-[#FF6000] text-white hover:bg-[#E65700]">
              <Plus className="size-4" />
              Yeni Ürün Ekle
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Boş durum */}
        {!loading && products.length === 0 && !error && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
            <Package className="size-12 text-[#D1D5DB]" />
            <div>
              <p className="font-bold text-[#111827]">Henüz ürün eklemediniz</p>
              <p className="mt-1 text-sm text-[#6B7280]">İlk ürününüzü ekleyerek başlayın.</p>
            </div>
            <Link href="/seller/products/new">
              <Button className="cursor-pointer rounded-xl bg-[#FF6000] text-white hover:bg-[#E65700]">
                İlk Ürünü Ekle
              </Button>
            </Link>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}

        {/* Ürün tablosu */}
        {!loading && products.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#6B7280]">Ürün</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Kategori</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280]">Fiyat</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280]">Stok</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280]">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                          {p.primaryImage ? (
                            <Image
                              src={p.primaryImage}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="size-5 text-[#D1D5DB]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-semibold text-[#111827]">{p.title}</p>
                          <p className="text-xs text-[#9CA3AF]">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#111827]">
                      ₺{p.price.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.stock === 0 ? "font-semibold text-red-500" : "text-[#6B7280]"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/seller/products/${p.id}/edit`}>
                          <button className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]">
                            <Pencil className="size-3.5" />
                            Düzenle
                          </button>
                        </Link>
                        <Link href={`/product/${p.id}`} target="_blank">
                          <button className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]">
                            <ExternalLink className="size-3.5" />
                            Gör
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                          {deletingId === p.id ? "Siliniyor..." : "Sil"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* API Entegrasyonu */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          {/* Başlık */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#F3F4F6]">
                <Key className="size-4 text-[#374151]" />
              </div>
              <div>
                <p className="font-bold text-[#111827]">API Entegrasyonu</p>
                <p className="text-xs text-[#9CA3AF]">ZekAI gibi harici araçları mağazanıza bağlayın</p>
              </div>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-200">
              Aktif
            </span>
          </div>

          <div className="p-6">
            {/* Uyarı */}
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-700">
                API anahtarınız hesabınıza tam erişim sağlar. <strong>Kimseyle paylaşmayın.</strong>{" "}
                Tehlikeye girdiğini düşünüyorsanız <strong>Yeni Anahtar Oluştur</strong> butonunu kullanın. Eski anahtar geçersiz olur.
              </p>
            </div>

            {/* Anahtar alanı */}
            <p className="mb-2 text-xs font-semibold text-[#6B7280]">Gizli Anahtar</p>
            <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
              <code className="flex-1 overflow-hidden px-4 py-3 font-mono text-xs text-[#374151]">
                {apiKey
                  ? keyRevealed
                    ? apiKey
                    : `${apiKey.slice(0, 12)}${"•".repeat(24)}${apiKey.slice(-6)}`
                  : "••••••••••••••••••••••••••••••••••••"}
              </code>
              <div className="flex shrink-0 items-center divide-x divide-[#E5E7EB] border-l border-[#E5E7EB]">
                <button
                  onClick={() => setKeyRevealed((v) => !v)}
                  disabled={!apiKey}
                  title={keyRevealed ? "Gizle" : "Göster"}
                  className="flex h-full items-center gap-1.5 px-3 py-3 text-xs text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-40"
                >
                  {keyRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  <span className="hidden sm:inline">{keyRevealed ? "Gizle" : "Göster"}</span>
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!apiKey}
                  className="flex h-full items-center gap-1.5 px-4 py-3 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6] disabled:opacity-40"
                >
                  {copied
                    ? <><Check className="size-3.5 text-green-500" /> Kopyalandı</>
                    : <><Copy className="size-3.5" /> Kopyala</>}
                </button>
              </div>
            </div>

            {/* Regenerate */}
            <div className="mt-4">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#374151] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {regenerating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Yeni Anahtar Oluştur
              </button>
            </div>

            {/* Alt bilgi */}
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#F9FAFB] px-4 py-4">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#FF6000]/10">
                <span className="text-xs font-black text-[#FF6000]">Z</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#374151]">ZekAI ile bağlanmak için</p>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  ZekAI Seller Studio&apos;yu açın → <strong>Mağazamı Bağla</strong> →{" "}
                  <strong>Akıllı Market</strong>&apos;i seçin → Anahtarı yapıştırın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
