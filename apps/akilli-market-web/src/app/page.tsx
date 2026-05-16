import { Suspense } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <Suspense fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-[#F3F4F6]" />
            ))}
          </div>
        }>
          <ShopProductGrid />
        </Suspense>
      </main>
    </div>
  );
}
