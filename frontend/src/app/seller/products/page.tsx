import { SellerProductTable } from "@/components/seller/SellerProductTable";
import { SellerShell } from "@/components/seller/SellerShell";

export default function SellerProductsPage() {
  return (
    <SellerShell
      title="Ürünlerim"
      description="Ürünlerini satış, iade, risk ve kaçırılan kâr sinyallerine göre önceliklendir."
    >
      <SellerProductTable />
    </SellerShell>
  );
}
