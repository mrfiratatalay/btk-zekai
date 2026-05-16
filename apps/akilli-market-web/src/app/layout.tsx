import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Akıllı Market — Alışveriş Sitesi",
  description: "Binlerce ürün, uygun fiyatlar, güvenli alışveriş.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
