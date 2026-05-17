"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookmarkCheck,
  GitCompare,
  LayoutDashboard,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalysesStore, useCompareStore } from "@/lib/buyer-store";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";

const NAV_ITEMS = [
  { href: "/platform", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/platform/saved", label: "Kaydedilenler", icon: BookmarkCheck, exact: false },
  { href: "/platform/compare", label: "Karşılaştır", icon: GitCompare, exact: false },
  { href: "/platform/projects", label: "Karar Odaları", icon: FolderOpen, exact: false },
] as const;

export function PlatformNav() {
  const pathname = usePathname();
  const router = useRouter();
  const savedCount = useAnalysesStore((s) => s.analyses.length);
  const compareCount = useCompareStore((s) => s.ids.length);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8">

        {/* Logo */}
        <Link href="/platform" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center size-8 rounded-lg bg-[#adff41] shadow-sm">
            <span className="text-sm font-black text-[#1a2e00] leading-none">Z</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-black text-foreground tracking-tight">
              Zek<span className="text-[#5a8a00] dark:text-[#adff41]">AI</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">
              Karar Merkezi
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Nav links */}
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150",
                  active
                    ? "bg-[#adff41]/15 text-[#5a8a00] dark:text-[#adff41]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4 shrink-0", active ? "text-[#5a8a00] dark:text-[#adff41]" : "")} />
                <span className="hidden md:inline">{label}</span>
                {href === "/platform/saved" && savedCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#adff41] px-1.5 text-[11px] font-black text-[#1a2e00]">
                    {savedCount}
                  </span>
                )}
                {href === "/platform/compare" && compareCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-black text-amber-900">
                    {compareCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mx-1 h-6 w-px bg-border/60" />

          <ThemeToggle />

          {/* User avatar + dropdown */}
          {user && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted",
                  menuOpen && "bg-muted"
                )}
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[#adff41] text-[12px] font-black text-[#1a2e00]">
                  {initials}
                </div>
                <span className="hidden text-sm font-semibold text-foreground md:block">
                  {user.fullName.split(" ")[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {/* Kullanıcı bilgisi */}
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="size-4 shrink-0" />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export function notifyStoreUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zekai-store-update"));
  }
}
