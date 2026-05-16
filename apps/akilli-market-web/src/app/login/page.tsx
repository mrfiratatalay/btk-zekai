"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login } from "@/lib/api/auth";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = searchParams.get("returnUrl") ?? "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm px-4">
      <h1 className="mb-1 text-2xl font-extrabold text-[#111827]">Giriş Yap</h1>
      <p className="mb-6 text-sm text-[#6B7280]">
        Hesabın yok mu?{" "}
        <Link href="/register" className="font-bold text-[#FF6000] hover:underline">Ücretsiz Kaydol</Link>
      </p>
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrenizi girin" required className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-10 pr-12 text-sm outline-none focus:border-[#FF6000]" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700] disabled:opacity-60">
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
        <p className="mb-1 font-semibold text-[#111827]">Test hesapları</p>
        <p>Alıcı: <span className="font-mono text-xs">burak@ornekstore.com</span> / <span className="font-mono text-xs">Buyer123!</span></p>
      </div>
    </div>
  );
}

export default function MarketLoginPage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      <Suspense><LoginForm /></Suspense>
    </div>
  );
}
