import { BuyerDashboard } from "@/components/platform/BuyerDashboard";

export const metadata = {
  title: "Alıcı Karar Merkezi | ZekAI",
  description:
    "Ürün analizlerini kaydet, karşılaştır ve alışveriş kararlarını yönet.",
};

export default function PlatformPage() {
  return <BuyerDashboard />;
}
