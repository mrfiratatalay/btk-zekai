"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  "Elektronik",
  "Giyim",
  "Ev & Yaşam",
  "Anne & Bebek",
  "Kozmetik",
  "Spor & Outdoor",
  "Kitap",
  "Mutfak",
  "Aksesuar",
  "Kişisel Bakım",
];

export function CategoryStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  function selectCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === activeCategory) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/shop?${params.toString()}`);
  }

  function clearCategory() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <nav className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* suppressHydrationWarning on each button — browser extensions (LastPass/Roboform)
            inject fdprocessedid on buttons which causes harmless hydration mismatch */}
        <button
          type="button"
          onClick={clearCategory}
          suppressHydrationWarning
          className={cn(
            "flex min-w-max items-center gap-2 text-sm font-bold transition",
            activeCategory === "" ? "text-[#FF6000]" : "text-[#111827] hover:text-[#FF6000]"
          )}
        >
          <Menu className="size-5" />
          Tüm Kategoriler
        </button>

        <div className="flex min-w-max flex-1 items-center justify-center gap-8">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              suppressHydrationWarning
              onClick={() => selectCategory(category)}
              className={cn(
                "relative text-sm font-semibold transition",
                activeCategory === category
                  ? "text-[#FF6000]"
                  : "text-[#111827] hover:text-[#FF6000]"
              )}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 rounded-full bg-[#FF6000]" />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          suppressHydrationWarning
          className="ml-auto flex min-w-max items-center gap-2 text-sm font-bold text-[#FF6000]"
        >
          <Percent className="size-5" />
          Fırsatlar
        </button>
      </div>
    </nav>
  );
}
