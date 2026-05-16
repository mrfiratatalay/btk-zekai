"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Store, UserRound } from "lucide-react";
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

  // Giriş yapılmış
  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        {/* Satıcı Paneli — sadece satıcılar */}
        {user.role === "Seller" && (
          <Link
            href="/seller"
            className="hidden cursor-pointer items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] transition-colors hover:border-[#FF6000] hover:text-[#FF6000] lg:flex"
          >
            <Store className="size-4" />
            Satıcı Paneli
          </Link>
        )}

        {/* İsim + Çıkış — tek bordered buton */}
        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
        >
          <UserRound className="size-4" />
          <span className="hidden max-w-[80px] truncate lg:inline">
            {user.fullName.split(" ")[0]}
          </span>
          <LogOut className="size-3.5 text-[#9CA3AF] transition-colors group-hover:text-red-400" />
        </button>
      </div>
    );
  }

  // Giriş yapılmamış
  return (
    <Link
      href="/login"
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] transition-colors hover:border-[#FF6000] hover:text-[#FF6000]"
    >
      <UserRound className="size-4" />
      <span className="hidden lg:inline">Giriş Yap</span>
    </Link>
  );
}
