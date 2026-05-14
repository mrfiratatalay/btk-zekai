"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PackageCheck, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/mock-data/products";
import { BuyerFitDialog } from "@/components/shop/BuyerFitDialog";

export function StickyPurchaseBar({
  product,
  heroRef,
}: {
  product: Product;
  heroRef: React.RefObject<HTMLElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [heroRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 px-6 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <Image src={product.image} alt={product.title} fill sizes="40px" className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{product.title}</p>
              <p className="text-base font-black text-slate-900">{formatPrice(product.price)}</p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2">
              <BuyerFitDialog
                product={product}
                triggerClassName="h-10 w-full rounded-xl bg-gradient-to-r from-[#5B2EFF] to-[#7C2DFF] text-sm font-bold text-white hover:from-[#4C1FDC] hover:to-[#6D28D9]"
              />
              <Button className="h-10 w-full rounded-xl bg-[#FF6000] text-sm font-bold text-white hover:bg-[#E65700]">
                <PackageCheck className="size-4" />
                Sepete Ekle
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
