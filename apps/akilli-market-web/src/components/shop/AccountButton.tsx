"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, type AuthUser } from "@/lib/api/auth";
import { useCartStore } from "@/lib/store/cart-store";
import { useRouter } from "next/navigation";

export function AccountButton() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  function handleLogout() {
    logout();
    clearCart();
    setUser(null);
    router.push("/");
  }

  if (user) {
    return (
      <div className="flex items-center gap-1">
        {user.role === "Seller" && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden h-9 gap-1.5 rounded-xl px-3 text-xs font-semibold text-green-700 hover:bg-green-50 hover:text-green-800 lg:flex"
          >
            <Link href="/seller">
              <Store className="size-3.5" />
              Satıcı Paneli
            </Link>
          </Button>
        )}
        <span className="hidden max-w-[100px] truncate text-sm font-semibold text-[#111827] lg:inline">
          {user.fullName.split(" ")[0]}
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
