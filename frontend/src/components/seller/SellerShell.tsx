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
    <div className="min-h-screen bg-[#F6F7F9]">
      <div className="flex min-h-screen">
        <SellerSidebar />
        <div className="min-w-0 flex-1">
          <SellerTopbar title={title} description={description} />
          <main className="mx-auto max-w-[1280px] px-5 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
