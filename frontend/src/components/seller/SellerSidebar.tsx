"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Home,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[#E5E7EB] bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-[#E5E7EB] px-6 py-5">
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

        <nav className="flex-1 space-y-1 px-3 py-5">
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

        <div className="m-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
            <BarChart3 className="size-4 text-[#FF6000]" />
            Günlük özet
          </div>
          <p className="mt-2 text-xs leading-5 text-[#6B7280]">
            3 ürün acil öncelikte. En yüksek kayıp bluetooth kulaklıkta.
          </p>
        </div>
      </div>
    </aside>
  );
}
