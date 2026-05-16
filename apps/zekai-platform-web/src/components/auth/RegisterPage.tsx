"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock, Mail, Phone, Sparkles, Store, User } from "lucide-react";
import { register } from "@/lib/api/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type Role = "buyer" | "seller";

const BUYER_STEPS  = ["Kişisel", "Güvenlik", "Bütçe", "Tamam"];
const SELLER_STEPS = ["Kişisel", "Güvenlik", "Mağaza", "Tamam"];

const BUDGET_OPTIONS = [
  { label: "₺500 – 2.000", value: "low" },
  { label: "₺2.000 – 5.000", value: "mid" },
  { label: "₺5.000 – 15.000", value: "high" },
  { label: "₺15.000+", value: "ultra" },
];

const CATEGORY_OPTIONS = ["Elektronik", "Giyim", "Ev & Yaşam", "Spor", "Aksesuar", "Diğer"];

const inputCls = "w-full rounded-2xl border border-border bg-muted py-3 text-sm text-foreground outline-none transition-all focus:border-foreground focus:ring-2 focus:ring-foreground/20 dark:focus:border-[#ADFF41] dark:focus:ring-[#ADFF41]/20";

// Field bileşeni RegisterPage dışında tanımlanmalı —
// içeride tanımlanırsa her render'da yeni tip olarak algılanır ve unmount/remount olur.
function Field({
  label,
  iconEl,
  children,
}: {
  label: string;
  iconEl?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block pl-1 text-xs font-semibold text-foreground/70">{label}</label>
      <div className="relative">
        {iconEl && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {iconEl}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("buyer");
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    budget: "", storeName: "", category: "", monthlyProducts: "",
  });

  const steps = role === "buyer" ? BUYER_STEPS : SELLER_STEPS;
  const progress = ((step + 1) / steps.length) * 100;

  function f(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  function next() {
    setError("");
    if (step === 0 && (!form.firstName || !form.email)) { setError("Ad ve e-posta zorunludur."); return; }
    if (step === 0 && !form.email.includes("@")) { setError("Geçerli bir e-posta gir."); return; }
    if (step === 1 && form.password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    if (step === 1 && form.password !== form.confirmPassword) { setError("Şifreler eşleşmiyor."); return; }
    setStep((s) => s + 1);
  }

  async function finish() {
    setError("");
    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await register(form.email, form.password, fullName, role);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { borderRadius: "16px" };

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

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm" style={{ borderRadius: "24px" }}>
          {step < 3 ? (
            <>
              {/* Role toggle — step 0 only */}
              {step === 0 && (
                <div className="mb-6 flex rounded-2xl bg-muted p-1" style={{ borderRadius: "16px" }}>
                  {(["buyer", "seller"] as Role[]).map((r) => (
                    <button key={r} type="button"
                      onClick={() => { setRole(r); setStep(0); setError(""); }}
                      className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all"
                      style={{
                        borderRadius: "12px",
                        backgroundColor: role === r ? "var(--card)" : "transparent",
                        color: role === r ? "var(--card-foreground)" : "var(--muted-foreground)",
                        boxShadow: role === r ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {r === "buyer" ? <Mail className="size-4" /> : <Store className="size-4" />}
                      {r === "buyer" ? "Alıcı" : "Satıcı"}
                    </button>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#C1F25D] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Adım {step + 1}/{steps.length}</span>
                  <span>{steps[step]}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Step 0: Personal */}
                {step === 0 && (
                  <>
                    <div className="mb-2 text-center">
                      <h2 className="text-xl font-bold text-foreground">Hesap Oluştur</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{role === "buyer" ? "Alıcı" : "Satıcı"} hesabı açıyorsunuz</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Ad" iconEl={<User className="size-4" />}>
                        <input value={form.firstName} onChange={f("firstName")} placeholder="Adınız"
                          className={`${inputCls} pl-9 pr-3`} style={inputStyle} />
                      </Field>
                      <Field label="Soyad">
                        <input value={form.lastName} onChange={f("lastName")} placeholder="Soyadınız"
                          className={`${inputCls} px-4`} style={inputStyle} />
                      </Field>
                    </div>
                    <Field label="E-posta" iconEl={<Mail className="size-4" />}>
                      <input type="email" value={form.email} onChange={f("email")} placeholder="ornek@mail.com"
                        className={`${inputCls} pl-10 pr-4`} style={inputStyle} />
                    </Field>
                    <Field label="Telefon (opsiyonel)" iconEl={<Phone className="size-4" />}>
                      <input value={form.phone} onChange={f("phone")} placeholder="+90 5XX XXX XX XX"
                        className={`${inputCls} pl-10 pr-4`} style={inputStyle} />
                    </Field>
                  </>
                )}

                {/* Step 1: Security */}
                {step === 1 && (
                  <>
                    <div className="mb-2 text-center">
                      <h2 className="text-xl font-bold text-foreground">Güvenlik</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Güçlü bir şifre belirleyin.</p>
                    </div>
                    <Field label="Şifre" iconEl={<Lock className="size-4" />}>
                      <input type={show ? "text" : "password"} value={form.password} onChange={f("password")}
                        placeholder="En az 6 karakter" className={`${inputCls} pl-10 pr-10`} style={inputStyle} />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </Field>
                    <Field label="Şifre Tekrar" iconEl={<Lock className="size-4" />}>
                      <input type={show ? "text" : "password"} value={form.confirmPassword} onChange={f("confirmPassword")}
                        placeholder="Tekrar girin" className={`${inputCls} pl-10 pr-4`} style={inputStyle} />
                    </Field>
                  </>
                )}

                {/* Step 2 BUYER: Budget */}
                {step === 2 && role === "buyer" && (
                  <>
                    <div className="mb-2 text-center">
                      <h2 className="text-xl font-bold text-foreground">Aylık Alışveriş Bütçeniz?</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Analizleri kişiselleştirmek için.</p>
                    </div>
                    <div className="mb-4 rounded-2xl border border-border bg-muted py-4 text-center">
                      <p className="text-3xl font-bold text-foreground">
                        {BUDGET_OPTIONS.find((o) => o.value === form.budget)?.label ?? "Seçiniz"}
                      </p>
                      <p className="text-xs text-muted-foreground">Aylık bütçe</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {BUDGET_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button"
                          onClick={() => setForm((p) => ({ ...p, budget: opt.value }))}
                          className="rounded-2xl py-3 text-sm font-semibold transition-all"
                          style={{
                            borderRadius: "12px",
                            border: `1.5px solid ${form.budget === opt.value ? "var(--foreground)" : "var(--border)"}`,
                            backgroundColor: form.budget === opt.value ? "var(--foreground)" : "transparent",
                            color: form.budget === opt.value ? "var(--background)" : "var(--foreground)",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 2 SELLER: Store */}
                {step === 2 && role === "seller" && (
                  <>
                    <div className="mb-2 text-center">
                      <h2 className="text-xl font-bold text-foreground">Mağaza Bilgileri</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Seller Studio&apos;yu kişiselleştireceğiz.</p>
                    </div>
                    <Field label="Mağaza Adı" iconEl={<Store className="size-4" />}>
                      <input value={form.storeName} onChange={f("storeName")} placeholder="Mağazanızın adı"
                        className={`${inputCls} pl-10 pr-4`} style={inputStyle} />
                    </Field>
                    <div>
                      <label className="mb-1.5 block pl-1 text-xs font-semibold text-foreground/70">Ana Kategori</label>
                      <select value={form.category} onChange={f("category")}
                        className="w-full rounded-2xl border border-border bg-muted py-3 px-4 text-sm text-foreground outline-none transition-all focus:border-foreground dark:focus:border-[#ADFF41]"
                        style={inputStyle}>
                        <option value="">Kategori seçin</option>
                        {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <Field label="Aylık Ürün Sayısı (tahmini)">
                      <input type="number" value={form.monthlyProducts} onChange={f("monthlyProducts")} placeholder="Örn: 50"
                        className={`${inputCls} px-4`} style={inputStyle} />
                    </Field>
                  </>
                )}
              </div>

              {/* Navigation */}
              <div className="mt-6 flex gap-3">
                {step > 0 && (
                  <button type="button" onClick={() => setStep((s) => s - 1)}
                    className="flex-1 rounded-2xl border py-3.5 text-sm font-semibold text-foreground transition-all hover:border-foreground border-border"
                    style={{ borderRadius: "16px", borderWidth: "1.5px" }}>
                    Geri
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" onClick={next}
                    className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white transition-colors"
                    style={{ borderRadius: "16px", backgroundColor: "var(--foreground)" }}>
                    Devam Et
                  </button>
                ) : (
                  <button type="button" onClick={finish} disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-black transition-colors disabled:opacity-60 bg-[#C1F25D] hover:bg-[#aadc2d]"
                    style={{ borderRadius: "16px" }}>
                    {loading ? "Oluşturuluyor..." : <><span>Hesabı Oluştur</span><ArrowRight className="size-4" /></>}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Step 3: Success */
            <div className="py-6 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#C1F25D]/20">
                <CheckCircle className="size-10 text-[#5a8a00] dark:text-[#ADFF41]" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Hesabınız Hazır!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {role === "buyer" ? "Alıcı hesabınız oluşturuldu." : "Satıcı hesabınız oluşturuldu."}
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-muted p-4 text-left">
                <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
                <p className="text-sm text-muted-foreground">{form.email}</p>
                {role === "seller" && form.storeName && (
                  <p className="mt-1 text-sm text-muted-foreground">{form.storeName} · {form.category}</p>
                )}
              </div>
              <button type="button" onClick={() => router.push(role === "seller" ? "/seller" : "/platform")}
                className="mt-6 w-full rounded-2xl py-3.5 text-sm font-bold text-black transition-colors bg-[#C1F25D] hover:bg-[#aadc2d]"
                style={{ borderRadius: "16px" }}>
                {role === "buyer" ? "Analiz Platformuna Git" : "Seller Studio'ya Git"}
              </button>
            </div>
          )}

          {step === 0 && (
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Hesabın var mı?{" "}
              <Link href="/login" className="font-bold text-foreground hover:underline">Giriş Yap</Link>
            </p>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Ana Sayfaya Dön</Link>
        </p>
      </div>
    </div>
  );
}
