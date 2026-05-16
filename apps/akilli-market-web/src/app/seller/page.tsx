"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Plus, TrendingUp, AlertCircle, LogOut } from "lucide-react";
import { getSellerProducts, deleteProduct, type SellerProduct } from "@/lib/api/seller";
import { getCurrentUser, logout } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { ShopHeader } from "@/components/shop/ShopHeader";

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "Seller") {
      window.location.href = "/login";
      return;
    }
    getSellerProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu ürünü silmek istediğinden emin misin?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  const statusColor = (status: string) => {
    if (status === "Urgent") return "bg-red-100 text-red-700";
    if (status === "Watch") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111827]">Satıcı Paneli</h1>
            <p className="text-sm text-[#6B7280]">Ürünlerinizi yönetin ve takip edin</p>
          </div>
          <div className="flex gap-3">
            <Link href="/seller/products/new">
              <Button className="gap-2 bg-[#FF6000] text-white hover:bg-[#E65700]">
                <Plus className="size-4" /> Ürün Ekle
              </Button>
            </Link>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOut className="size-4" /> Çıkış
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="size-8 text-[#FF6000]" />
              <div>
                <p className="text-2xl font-bold text-[#111827]">{products.length}</p>
                <p className="text-xs text-[#6B7280]">Toplam Ürün</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-[#111827]">{products.filter(p => p.status === "Healthy").length}</p>
                <p className="text-xs text-[#6B7280]">Sağlıklı Ürün</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-[#111827]">{products.filter(p => p.status === "Urgent").length}</p>
                <p className="text-xs text-[#6B7280]">Acil Ürün</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        {loading && <p className="py-12 text-center text-[#6B7280]">Yükleniyor...</p>}
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {!loading && products.length === 0 && (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 size-12 text-gray-300" />
            <p className="mb-4 text-[#6B7280]">Henüz ürün eklemediniz.</p>
            <Link href="/seller/products/new">
              <Button className="bg-[#FF6000] text-white hover:bg-[#E65700]">İlk Ürününüzü Ekleyin</Button>
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-[#6B7280]">
                  <th className="px-4 py-3 text-left">Ürün</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-right">Fiyat</th>
                  <th className="px-4 py-3 text-right">Stok</th>
                  <th className="px-4 py-3 text-center">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.primaryImage && (
                          <img src={p.primaryImage} alt={p.title} className="size-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-semibold text-[#111827] line-clamp-1">{p.title}</p>
                          <p className="text-xs text-[#6B7280]">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold">₺{p.price.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/seller/products/${p.id}/edit`}>
                          <Button variant="outline" size="sm">Düzenle</Button>
                        </Link>
                        <Link href={`/product/${p.id}`} target="_blank">
                          <Button variant="outline" size="sm">Gör</Button>
                        </Link>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(p.id)}>Sil</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
