"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Eye, EyeOff, Lock, Mail, ShoppingBag, Store } from "lucide-react";
import { login } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { DemoLoginCards } from "@/components/demo/DemoLoginCards";
import { isDemoMode } from "@/lib/api/transport";

type Tab = "buyer" | "seller";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("buyer");
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
      const res = await login(email, password);
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        window.location.href = res.user.role === "Seller" ? "/seller" : "/";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Giriş başarısız. Bilgilerinizi kontrol edin.");
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

          {isDemoMode && <DemoLoginCards returnUrl={searchParams.get("returnUrl")} />}

          {/* Tabs */}
          <div className="mb-6 flex rounded-xl border border-[#E5E7EB] p-1">
            <button
              type="button"
              onClick={() => { setTab("buyer"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tab === "buyer"
                  ? "bg-[#FF6000] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <ShoppingBag className="size-4" />
              Alıcı Girişi
            </button>
            <button
              type="button"
              onClick={() => { setTab("seller"); setError(""); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                tab === "seller"
                  ? "bg-[#FF6000] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <Store className="size-4" />
              Satıcı Girişi
            </button>
          </div>

          <h1 className="mb-1 text-xl font-extrabold text-[#111827]">
            {tab === "buyer" ? "Alıcı Hesabına Giriş" : "Satıcı Hesabına Giriş"}
          </h1>
          <p className="mb-6 text-sm text-[#6B7280]">
            {tab === "buyer"
              ? "Siparişlerinizi takip edin, sepetinizi yönetin."
              : "Ürünlerinizi yönetin ve satışlarınızı takip edin."}
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Şifrenizi girin"
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
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          {/* Demo hesaplar */}
          {!isDemoMode && (
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs text-[#6B7280]">
              <p className="mb-1.5 font-semibold text-[#111827]">
                {tab === "buyer" ? "Demo alıcı hesabı:" : "Demo satıcı hesabı:"}
              </p>
              {tab === "buyer" ? (
                <button
                  type="button"
                  onClick={() => { setEmail("burak@ornekstore.com"); setPassword("Buyer123!"); }}
                  className="font-mono hover:text-[#111827] text-left"
                >
                  burak@ornekstore.com / Buyer123!
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setEmail("mehmet@ornekstore.com"); setPassword("Seller123!"); }}
                  className="font-mono hover:text-[#111827] text-left"
                >
                  mehmet@ornekstore.com / Seller123!
                </button>
              )}
            </div>
          )}

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Hesabın yok mu?{" "}
            <Link href="/register" className="font-bold text-[#FF6000] hover:underline">
              Ücretsiz Kaydol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MarketLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
