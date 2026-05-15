"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Home,
  Package,
  Settings,
  Sparkles,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { label: "Genel Bakış", href: "/seller", icon: Home },
  { label: "Ürünlerim", href: "/seller/products", icon: Package },
  { label: "AI Optimizasyon", href: "/seller/optimize", icon: Bot },
  { label: "Analitik", href: "/seller/analytics", icon: BarChart3 },
  { label: "Ayarlar", href: "/seller/settings", icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#ADFF41]">
            <Sparkles className="size-4 text-[#0D0F0B]" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground leading-none">
              Seller Studio
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">by ZekAI</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[#ADFF41]/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("size-4 shrink-0", active && "text-[#ADFF41]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Store info */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-[#ADFF41] text-[#0D0F0B] text-xs font-bold">ME</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">Mehmet Elektronik</p>
              <p className="truncate text-xs text-muted-foreground">Seller Plus</p>
            </div>
          </div>
          <Link href="/" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Store className="size-3.5" />
            ZekAI&apos;ye dön
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#ADFF41]">
              <Sparkles className="size-3.5 text-[#0D0F0B]" />
            </div>
            <span className="text-sm font-extrabold text-foreground">Seller Studio</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            {NAV.find((n) => pathname === n.href || (n.href !== "/seller" && pathname.startsWith(n.href)))?.label ?? "Genel Bakış"}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge className="hidden sm:flex gap-1 rounded-full border-0 bg-[#ADFF41]/15 text-[#5a8a00] dark:text-[#ADFF41]">
              <Sparkles className="size-3" />
              AI Hazır
            </Badge>
            <ThemeToggle className="text-muted-foreground" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
