"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, cartItemCount } from "@/lib/store/cart-store";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);

  return (
    <Link
      href="/cart"
      className="relative flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] transition-colors hover:border-[#FF6000] hover:text-[#FF6000]"
    >
      <ShoppingCart className="size-5" />
      <span className="hidden lg:inline">Sepetim</span>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 flex size-5 items-center justify-center rounded-full bg-[#FF6000] text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
