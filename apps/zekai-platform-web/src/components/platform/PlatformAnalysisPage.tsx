"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { BuyerAnalysisExperience } from "@/components/platform/BuyerAnalysisExperience";

export function PlatformAnalysisPage({
  analysis,
  product,
}: {
  analysis: BuyerAnalysis;
  product: Product;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/platform"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Yeni Analiz
          </Link>
          <span className="text-sm font-black">
            Zek<span className="text-[#5a8a00] dark:text-[#adff41]">AI</span>{" "}
            <span className="font-normal text-muted-foreground/70">Pişmanlık Riski Raporu</span>
          </span>
          <Link href="/mock-shop" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            Demo Mağaza
          </Link>
        </div>
      </nav>

      <BuyerAnalysisExperience analysis={analysis} product={product} />
    </div>
  );
}
