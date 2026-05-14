"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { SellerProductPerformance, SellerProductStatus } from "@/types/seller";
import { formatSellerPrice, sellerProducts } from "@/lib/mock-data/seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SellerRiskBadge } from "@/components/seller/SellerRiskBadge";
import { SellerStatusBadge } from "@/components/seller/SellerStatusBadge";
import { cn } from "@/lib/utils";

type FilterKey =
  | "all"
  | SellerProductStatus
  | "highest-return"
  | "highest-loss";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tümü" },
  { key: "urgent", label: "Acil" },
  { key: "watch", label: "İzlemede" },
  { key: "healthy", label: "Sağlıklı" },
  { key: "highest-return", label: "En çok iade alan" },
  { key: "highest-loss", label: "En çok kâr kaçıran" },
];

function applyFilter(products: SellerProductPerformance[], filter: FilterKey) {
  if (filter === "all") {
    return products;
  }

  if (filter === "highest-return") {
    return [...products].sort((a, b) => b.returnRate - a.returnRate);
  }

  if (filter === "highest-loss") {
    return [...products].sort((a, b) => b.lostProfitMonthly - a.lostProfitMonthly);
  }

  return products.filter((product) => product.status === filter);
}

export function SellerProductTable({
  products = sellerProducts,
  compact = false,
}: {
  products?: SellerProductPerformance[];
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const byFilter = applyFilter(products, activeFilter);

    if (!normalizedQuery) {
      return byFilter;
    }

    return byFilter.filter(
      (product) =>
        product.title.toLocaleLowerCase("tr-TR").includes(normalizedQuery) ||
        product.category.toLocaleLowerCase("tr-TR").includes(normalizedQuery),
    );
  }, [activeFilter, products, query]);

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      {!compact ? (
        <div className="space-y-4 border-b border-[#E5E7EB] p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-xl border-[#E5E7EB] bg-[#F9FAFB] pl-10"
              placeholder="Ürün adı veya kategori ara"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-bold transition",
                  activeFilter === filter.key
                    ? "border-[#FF6000] bg-[#FFF4EC] text-[#FF6000]"
                    : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#FF6000]/40",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
            <TableHead className="min-w-[300px] px-4 py-3">Ürün</TableHead>
            <TableHead>Fiyat</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Satış 30g</TableHead>
            <TableHead>İade Oranı</TableHead>
            <TableHead>Dönüşüm</TableHead>
            <TableHead>AI Risk</TableHead>
            <TableHead>Kaçırılan Kâr</TableHead>
            <TableHead className="min-w-[220px]">Son Sinyal</TableHead>
            <TableHead className="text-right">Aksiyon</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="56px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/seller/product/${product.id}`}
                      className="line-clamp-2 font-extrabold leading-5 text-[#111827] hover:text-[#FF6000]"
                    >
                      {product.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#6B7280]">{product.category}</span>
                      <SellerStatusBadge status={product.status} />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-bold">{formatSellerPrice(product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.sales30d}</TableCell>
              <TableCell className="font-bold text-[#DC2626]">
                %{product.returnRate}
              </TableCell>
              <TableCell>%{product.conversionRate}</TableCell>
              <TableCell>
                <SellerRiskBadge score={product.aiRiskScore} />
              </TableCell>
              <TableCell className="font-extrabold text-[#111827]">
                {formatSellerPrice(product.lostProfitMonthly)}
              </TableCell>
              <TableCell>
                <p className="max-w-[260px] whitespace-normal text-sm leading-5 text-[#374151]">
                  {product.mainIssue}
                </p>
                <p className="mt-1 max-w-[260px] whitespace-normal text-xs leading-5 text-[#6B7280]">
                  {product.lastAction}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  asChild
                  variant="outline"
                  className="h-9 rounded-lg border-[#E5E7EB] bg-white font-bold"
                >
                  <Link href={`/seller/product/${product.id}`}>Analizi Aç</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
