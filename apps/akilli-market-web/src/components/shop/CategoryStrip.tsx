"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategories, type Category } from "@/lib/api/products";

export function CategoryStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") ?? "";
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  function selectCategory(slug: string) {
    if (slug === activeSlug) {
      router.push("/");
    } else {
      router.push(`/?category=${slug}`);
    }
  }

  return (
    <nav className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => router.push("/")}
          suppressHydrationWarning
          className={cn(
            "flex min-w-max cursor-pointer items-center gap-2 text-sm font-bold transition",
            activeSlug === "" ? "text-[#FF6000]" : "text-[#111827] hover:text-[#FF6000]"
          )}
        >
          <LayoutGrid className="size-4" />
          Tüm Ürünler
        </button>

        <div className="flex min-w-max items-center gap-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              suppressHydrationWarning
              onClick={() => selectCategory(cat.slug)}
              className={cn(
                "relative cursor-pointer whitespace-nowrap text-sm font-semibold transition",
                activeSlug === cat.slug
                  ? "text-[#FF6000]"
                  : "text-[#111827] hover:text-[#FF6000]"
              )}
            >
              {cat.name}
              {activeSlug === cat.slug && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 rounded-full bg-[#FF6000]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
