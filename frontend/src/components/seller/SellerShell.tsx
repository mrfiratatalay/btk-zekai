import type { ReactNode } from "react";
import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerTopbar } from "@/components/seller/SellerTopbar";

export function SellerShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    // Root: tam viewport yüksekliği, taşma yok
    <div className="flex h-screen overflow-hidden bg-[#F6F7F9]">
      {/* Sidebar sabit kalır, içerikle scroll etmez */}
      <SellerSidebar />

      {/* Sağ taraf: topbar + main, kendi içinde flex kolon */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SellerTopbar title={title} description={description} />

        {/* Sadece bu alan scroll eder, sidebar etkilenmez */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1280px] px-5 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
