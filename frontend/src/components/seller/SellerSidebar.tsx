"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Home,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard", href: "/seller", icon: Home, active: true },
  { label: "Ürünlerim", href: "/seller/products", icon: Package, active: true },
  { label: "Siparişler", href: "#", icon: ShoppingBag, active: false },
  { label: "İadeler", href: "/seller/returns", icon: RotateCcw, active: true },
  { label: "Yorumlar", href: "#", icon: MessageSquareText, active: false },
  { label: "AI Analiz Merkezi", href: "#", icon: Bot, active: false },
  { label: "Mağaza Ayarları", href: "#", icon: Settings, active: false },
];

export function SellerSidebar() {
  const pathname = usePathname();

  return (
    // Sidebar: tam ekran yüksekliği, kendi içinde overflow yok — alt kısımlar kesilmez
    <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-[#E5E7EB] bg-white lg:flex">

      {/* HEADER — shrink-0: asla küçülmez, her zaman en üstte */}
      <div className="shrink-0 border-b border-[#E5E7EB] px-6 py-5">
        <Link href="/seller" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#FF6000] text-lg font-extrabold text-white">
            Z
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[#111827]">
              Zekai Seller
            </p>
            <p className="text-xs font-medium text-[#6B7280]">Satıcı Paneli</p>
          </div>
        </Link>
      </div>

      {/* NAV — flex-1 + ScrollArea: nav uzarsa sidebar içinde scroll eder */}
      <ScrollArea className="flex-1">
        <nav className="space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = pathname === item.href;

            if (!item.active) {
              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-[#9CA3AF]"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px]">
                    Yakında
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
                  selected
                    ? "bg-[#FFF4EC] text-[#FF6000]"
                    : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* FOOTER — shrink-0: sidebar scroll etse bile footer hep altta sabit */}
      <div className="shrink-0">
        <Separator className="bg-[#E5E7EB]" />
        <div className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#F9FAFB]">
                <Avatar size="sm">
                  <AvatarFallback className="bg-[#FF6000] text-xs font-extrabold text-white">
                    MK
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#111827]">
                    TeknoPazar Plus
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">Mehmet Kaya</p>
                </div>
                <Badge className="shrink-0 rounded-full border-[#DDD6FE] bg-[#F5F3FF] text-[10px] font-bold text-[#5B2EFF]">
                  Seller Plus
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="#" className="font-semibold">
                  Mağaza profili
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#" className="font-semibold">
                  Ayarlar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-semibold text-[#DC2626] focus:text-[#DC2626]">
                Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
