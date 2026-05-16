"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/lib/api/auth";
import { useCartStore } from "@/lib/store/cart-store";
import { useRouter } from "next/navigation";

export function AccountButton() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const user = getCurrentUser();
    setName(user?.fullName ?? null);
  }, []);

  function handleLogout() {
    logout();
    clearCart();
    setName(null);
    router.push("/");
  }

  if (name) {
    return (
      <div className="flex items-center gap-1">
        <span className="hidden max-w-[100px] truncate text-sm font-semibold text-[#111827] lg:inline">
          {name.split(" ")[0]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9 w-9 rounded-xl text-[#9CA3AF] hover:text-[#DC2626]"
          title="Çıkış Yap"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      className="h-11 gap-2 rounded-xl px-3 font-semibold text-[#111827]"
    >
      <Link href="/login">
        <UserRound className="size-5" />
        <span className="hidden lg:inline">Giriş Yap</span>
      </Link>
    </Button>
  );
}
