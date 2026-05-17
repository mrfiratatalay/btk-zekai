import type { Metadata } from "next";
import "./globals.css";
import { StoreInitializer } from "@/components/shop/StoreInitializer";

export const metadata: Metadata = {
  title: "Akıllı Market — Alışveriş Sitesi",
  description: "Binlerce ürün, uygun fiyatlar, güvenli alışveriş.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-white antialiased">
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
