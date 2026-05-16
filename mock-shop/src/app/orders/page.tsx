import { BuyerOrders } from "@/components/shop/BuyerOrders";
import { ShopHeader } from "@/components/shop/ShopHeader";

export const metadata = {
  title: "Siparişlerim | Akıllı Market",
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      <BuyerOrders />
    </div>
  );
}
