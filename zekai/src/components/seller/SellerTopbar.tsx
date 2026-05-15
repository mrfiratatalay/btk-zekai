"use client";

import Link from "next/link";
import { Bell, ChevronDown, Sparkles } from "lucide-react";
import { sellerStore } from "@/lib/mock-data/seller";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SellerTopbar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const avatarLetters = initialsFromName(sellerStore.ownerName);

  return (
    <header className="border-b border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-1 rounded-full border-[#DDD6FE] bg-[#F5F3FF] text-[#5B2EFF]">
            <Sparkles className="size-3.5" />
            AI tarama hazır
          </Badge>
          <Button variant="outline" size="icon-lg" className="rounded-xl bg-white">
            <Bell className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-2.5 py-2 text-left transition hover:bg-[#F9FAFB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6000] md:gap-3 md:px-3"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-[#FF6000] text-xs font-bold text-white">
                    {avatarLetters}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 flex-1 text-sm md:block">
                  <p className="truncate font-extrabold text-[#111827]">
                    {sellerStore.storeName}
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {sellerStore.ownerName}
                  </p>
                </div>
                <ChevronDown className="size-4 shrink-0 text-[#9CA3AF]" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="#" className="font-semibold">
                  Mağaza profili
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#" className="font-semibold">
                  Hesap ayarları
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="font-semibold opacity-100">
                Plan: Seller Plus
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="font-semibold focus:text-[#DC2626]"
              >
                Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
