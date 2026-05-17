"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, HelpCircle, LayoutDashboard, LogOut, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Ürünlerim", href: "/seller/products", icon: Package },
];

/* ZekAI four-diamond logo mark */
function ZekAILogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="0" y="0" width="12" height="12" rx="3" fill="#22c55e" />
      <rect x="16" y="0" width="12" height="12" rx="3" fill="#22c55e" opacity="0.7" />
      <rect x="0" y="16" width="12" height="12" rx="3" fill="#22c55e" opacity="0.7" />
      <rect x="16" y="16" width="12" height="12" rx="3" fill="#22c55e" opacity="0.4" />
    </svg>
  );
}

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "ME";
  const displayName = user?.fullName ?? "Mehmet Elektronik";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* ── Sidebar ── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-white/8 dark:bg-[#111] lg:flex">

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
          <ZekAILogo size={28} />
          <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">ZekAI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/seller"
                ? pathname === "/seller"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-green-600 dark:text-green-400" : "text-gray-400",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-gray-100 p-4 dark:border-white/8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-500 text-[13px] font-black text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{displayName}</p>
              <p className="truncate text-xs text-gray-400">{user?.email ?? "Satıcı"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7.5 1L2.5 6L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Zekai&apos;ye dön
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-red-500"
            >
              <LogOut className="size-3.5" />
              Çıkış
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-xl dark:border-white/8 dark:bg-[#111]/80">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <ZekAILogo size={22} />
            <span className="text-base font-black text-gray-900 dark:text-white">ZekAI</span>
          </div>
          <div className="hidden lg:block" />

          {/* Right: help + bell + theme */}
          <div className="flex items-center gap-1">
            <button className="flex size-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5">
              <HelpCircle className="size-4" />
            </button>
            <button className="flex size-9 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5">
              <Bell className="size-4" />
            </button>
            <ThemeToggle className="text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" />
            <div className="ml-1 flex size-9 items-center justify-center rounded-full bg-green-500 text-[12px] font-black text-white">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
