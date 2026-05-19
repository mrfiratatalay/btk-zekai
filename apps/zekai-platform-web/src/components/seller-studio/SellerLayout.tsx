"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, FileStack, LogOut, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";
import { getAllAiArtifacts, getAllDrafts, getAllSocialDrafts } from "@/lib/api/seller";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ZekaiLogo } from "@/components/ui/ZekaiLogo";

const NAV_ITEMS = [
  { label: "Ürünlerim", href: "/seller/products", icon: Package },
  { label: "Kayıtlarım", href: "/seller/drafts", icon: FileStack },
  { label: "Ayarlar", href: "/seller/settings", icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Simülasyon ekranı tam ekran immersive bir deneyim olmalı:
  // sidebar, header ve mobile bottom nav tamamen gizlenir.
  // Sadece /seller/product/[id]/simulation route'unda devreye girer.
  const isFullscreenRoute = pathname.endsWith("/simulation");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    setUser(u);
    const saved = localStorage.getItem("seller_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    async function loadRecordCount() {
      const [drafts, socialDrafts, artifacts] = await Promise.all([
        getAllDrafts().catch(() => []),
        getAllSocialDrafts().catch(() => []),
        getAllAiArtifacts().catch(() => []),
      ]);
      if (!cancelled) setRecordsCount(drafts.length + socialDrafts.length + artifacts.length);
    }

    loadRecordCount();
    window.addEventListener("seller-records-updated", loadRecordCount);
    return () => {
      cancelled = true;
      window.removeEventListener("seller-records-updated", loadRecordCount);
    };
  }, [user]);

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

  if (isFullscreenRoute) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
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
              <ZekaiLogo size="md" />
            </div>
          )}
          {collapsed && <ZekaiLogo size="md" showText={false} />}
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
            const showBadge = href === "/seller/drafts" && recordsCount > 0;
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
                {!collapsed && showBadge && (
                  <span className="ml-auto rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                    {recordsCount > 99 ? "99+" : recordsCount}
                  </span>
                )}
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
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 lg:hidden">
            <ZekaiLogo size="md" />
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle className="text-muted-foreground hover:bg-muted" />
        </header>

        {/* Content — pb-20 on mobile to clear bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">{children}</main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
        <div className="flex">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            const showBadge = href === "/seller/drafts" && recordsCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 transition-colors",
                  active
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative">
                  <Icon className="size-5" />
                  {showBadge && (
                    <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-green-500 px-1 text-[9px] font-black leading-4 text-white">
                      {recordsCount > 9 ? "9+" : recordsCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-3 text-muted-foreground transition-colors hover:text-red-500"
          >
            <LogOut className="size-5" />
            <span className="text-[10px] font-semibold">Çıkış</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
