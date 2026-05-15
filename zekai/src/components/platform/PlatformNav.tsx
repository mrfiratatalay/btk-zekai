"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookmarkCheck,
  GitCompare,
  LayoutDashboard,
  FolderOpen,
  Bell,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getSavedAnalyses, getCompareQueue } from "@/lib/buyer-store";

const NAV_ITEMS = [
  { href: "/platform", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/platform/saved", label: "Kaydedilenler", icon: BookmarkCheck, exact: false },
  { href: "/platform/compare", label: "Karşılaştır", icon: GitCompare, exact: false },
  { href: "/platform/projects", label: "Karar Odaları", icon: FolderOpen, exact: false },
] as const;

export function PlatformNav() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    function refresh() {
      setSavedCount(getSavedAnalyses().length);
      setCompareCount(getCompareQueue().length);
    }
    refresh();
    // storage değişimlerini dinle (aynı sekme)
    window.addEventListener("storage", refresh);
    // custom event (aynı sekme içi güncellemeler için)
    window.addEventListener("zekai-store-update", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("zekai-store-update", refresh);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/platform"
          className="flex items-center gap-1.5 text-sm font-black shrink-0"
        >
          Zek
          <span className="text-[#5a8a00] dark:text-[#adff41]">AI</span>
          <span className="ml-1 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
            Karar Merkezi
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "bg-[#adff41]/10 text-[#5a8a00] dark:text-[#adff41]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{label}</span>
                {/* Badge */}
                {href === "/platform/saved" && savedCount > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#adff41]/20 px-1 text-[10px] font-bold text-[#5a8a00] dark:text-[#adff41]">
                    {savedCount}
                  </span>
                )}
                {href === "/platform/compare" && compareCount > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                    {compareCount}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-[#5a8a00] dark:bg-[#adff41]" />
                )}
              </Link>
            );
          })}

          {/* Bildirim Zili (Mock) */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative rounded-full p-2 transition-colors",
                showNotifications ? "bg-[#adff41]/10 text-[#5a8a00] dark:text-[#adff41]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 border border-background" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[320px] rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                    <h4 className="text-xs font-semibold text-foreground">Takip Bildirimleri</h4>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                    <div className="rounded-lg bg-red-500/5 dark:bg-red-500/10 p-3 hover:bg-muted transition-colors cursor-pointer">
                      <p className="text-xs text-foreground leading-relaxed">
                        <span className="font-semibold text-red-500 dark:text-red-400">Fiyat Düştü:</span> Takip ettiğin kulaklığın fiyatı 1.015 TL’den 849 TL’ye düştü. Ancak son yorumlarda mikrofon şikâyetleri arttı. Risk hâlâ orta.
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1.5 block">2 saat önce</span>
                    </div>

                    <div className="rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Karar Odası:</span> "Yeni Laptop Alacağım" projesindeki cihazlardan biri bugün en iyi fiyat/performans adayı oldu.
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1.5 block">5 saat önce</span>
                    </div>

                    <div className="rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Sinyal Güncellemesi:</span> Kaydettiğin kahve makinesinde son yorumlar daha olumlu. Güven skoru yükseldi.
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1.5 block">Dün</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** localStorage değişikliğini diğer bileşenlere haber ver */
export function notifyStoreUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zekai-store-update"));
  }
}
