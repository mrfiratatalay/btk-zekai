"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles, TrendingUp } from "lucide-react";
import { login } from "@/lib/api/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type Role = "buyer" | "seller";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) { setError("Geçerli bir e-posta gir."); return; }
    if (password.length < 4) { setError("Şifre çok kısa."); return; }
    setLoading(true);
    try {
      const res = await login(email, password);
      const returnUrl = searchParams.get("returnUrl");
      router.push(returnUrl ?? (res.user.role === "Seller" ? "/seller" : "/platform"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Giriş başarısız. Bilgilerinizi kontrol edin.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#C1F25D]">
            <Sparkles className="size-5 text-black" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">ZekAI</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm" style={{ borderRadius: "24px" }}>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Hoş geldiniz</h1>
            <p className="mt-1 text-sm text-muted-foreground">Hesabınıza giriş yapın.</p>
          </div>

          {/* Role toggle */}
          <div className="mb-6 flex rounded-2xl bg-muted p-1" style={{ borderRadius: "16px" }}>
            {(["buyer", "seller"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
                style={{
                  borderRadius: "12px",
                  backgroundColor: role === r ? "var(--card)" : "transparent",
                  color: role === r ? "var(--card-foreground)" : "var(--muted-foreground)",
                  boxShadow: role === r ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {r === "buyer" ? <Mail className="size-4" /> : <TrendingUp className="size-4" />}
                {r === "buyer" ? "Alıcı" : "Satıcı"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400" style={{ borderRadius: "12px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block pl-1 text-xs font-semibold text-foreground/70">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  required
                  className="w-full border-0 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-black dark:focus:ring-[#ADFF41] bg-muted"
                  style={{ borderRadius: "16px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block pl-1 text-xs font-semibold text-foreground/70">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  required
                  className="w-full border-0 py-3 pl-10 pr-12 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-black dark:focus:ring-[#ADFF41] bg-muted"
                  style={{ borderRadius: "16px" }}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                Şifremi unuttum?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-black transition-colors disabled:opacity-60 bg-[#C1F25D] hover:bg-[#aadc2d]"
              style={{ borderRadius: "16px" }}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">veya</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Google", "Apple"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground border-border"
                  style={{ borderRadius: "16px", borderWidth: "1.5px" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/register" className="font-bold text-foreground hover:underline">Ücretsiz Kaydol</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfaya Dön</Link>
        </p>
      </div>
    </div>
  );
}
