"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, cartItemCount } from "@/lib/store/cart-store";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const count = cartItemCount(items);

  return (
    <Button
      asChild
      variant="ghost"
      className="relative h-11 gap-2 rounded-xl px-3 font-semibold text-[#111827]"
    >
      <Link href="/cart">
        <ShoppingCart className="size-5" />
        <span className="hidden lg:inline">Sepetim</span>
        {count > 0 && (
          <span className="absolute -right-0.5 top-0 flex size-5 items-center justify-center rounded-full bg-[#FF6000] text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}
