"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, LogOut, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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

const NAV_ITEMS = [
  { label: "Ürünlerim", href: "/seller/products", icon: Package },
  { label: "Ayarlar", href: "/seller/settings", icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    const saved = localStorage.getItem("seller_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleCollapse() {
    setCollapsed((v) => {
      localStorage.setItem("seller_sidebar_collapsed", String(!v));
      return !v;
    });
    setMenuOpen(false);
  }

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className={cn("flex h-16 shrink-0 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-between px-4")}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <ZekAILogo size={26} />
              <span className="text-base font-black tracking-tight text-foreground">ZekAI</span>
            </div>
          )}
          {collapsed && <ZekAILogo size={24} />}
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "mt-0"
            )}
            title={collapsed ? "Genişlet" : "Daralt"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-xl px-2 py-2.5 text-sm font-semibold transition-all",
                  collapsed ? "justify-center" : "gap-3 px-3",
                  active
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("size-[18px] shrink-0", active ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div ref={menuRef} className="relative shrink-0 border-t border-border p-2">
          {menuOpen && !collapsed && (
            <div className="absolute bottom-full left-2 right-2 mb-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-lg z-10">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="truncate text-xs font-bold text-foreground">{user?.fullName ?? ""}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.email ?? ""}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="size-4 shrink-0" />
                Çıkış Yap
              </button>
            </div>
          )}

          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Çıkış Yap"
              className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-green-500 text-[11px] font-black text-white">
                {initials}
              </div>
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted",
                menuOpen && "bg-muted"
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-[11px] font-black text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-foreground">{user?.fullName ?? ""}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>
              <ChevronUp className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", !menuOpen && "rotate-180")} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 lg:hidden">
            <ZekAILogo size={22} />
            <span className="text-base font-black text-foreground">ZekAI</span>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle className="text-muted-foreground hover:bg-muted" />
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
