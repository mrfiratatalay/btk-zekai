import { BuyerReturns } from "@/components/shop/BuyerReturns";
import { ShopHeader } from "@/components/shop/ShopHeader";

export const metadata = {
  title: "İadelerim | Akıllı Market",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      <BuyerReturns />
    </div>
  );
}
