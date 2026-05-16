"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShoppingBag, Store, User } from "lucide-react";
import { register } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

type Role = "buyer" | "seller";

export default function MarketRegisterPage() {
  const [role, setRole] = useState<Role>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    setLoading(true);
    try {
      await register(email, password, fullName, role);
      window.location.href = role === "seller" ? "/seller" : "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-1">
          <span className="text-2xl font-extrabold text-[#111827]">Akıllı</span>
          <span className="text-2xl font-extrabold text-[#FF6000]">Market</span>
        </Link>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
          {/* Tabs */}
          <div className="mb-6 flex rounded-xl border border-[#E5E7EB] p-1">
            <button
              type="button"
              onClick={() => { setRole("buyer"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                role === "buyer" ? "bg-[#FF6000] text-white shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <ShoppingBag className="size-4" />
              Alıcı Hesabı
            </button>
            <button
              type="button"
              onClick={() => { setRole("seller"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                role === "seller" ? "bg-[#FF6000] text-white shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <Store className="size-4" />
              Satıcı Hesabı
            </button>
          </div>

          <h1 className="mb-1 text-xl font-extrabold text-[#111827]">
            {role === "buyer" ? "Alıcı Hesabı Oluştur" : "Satıcı Hesabı Oluştur"}
          </h1>
          <p className="mb-6 text-sm text-[#6B7280]">
            {role === "buyer"
              ? "Ürünleri incele, sepetine ekle, sipariş ver."
              : "Ürünlerini listele ve satışa başla."}
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827]">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  required
                  className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#FF6000]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827]">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  required
                  className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#FF6000]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827]">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                  className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-12 text-sm outline-none focus:border-[#FF6000]"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700] disabled:opacity-60"
            >
              {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Kaydol"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="font-bold text-[#FF6000] hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
