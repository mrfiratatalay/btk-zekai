"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { register } from "@/lib/api/auth";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";

export default function MarketRegisterPage() {
  const router = useRouter();
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
      await register(email, password, fullName, "buyer");
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      <div className="mx-auto mt-10 w-full max-w-sm px-4 pb-16">
        <h1 className="mb-1 text-2xl font-extrabold text-[#111827]">Hesap Oluştur</h1>
        <p className="mb-6 text-sm text-[#6B7280]">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-bold text-[#FF6000] hover:underline">Giriş Yap</Link>
        </p>
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#111827]">Ad Soyad</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Adınız Soyadınız" required className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#FF6000]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#111827]">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" required className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#FF6000]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#111827]">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-12 text-sm outline-none focus:border-[#FF6000]" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700] disabled:opacity-60">
            {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Kaydol"}
          </Button>
        </form>
      </div>
    </div>
  );
}
