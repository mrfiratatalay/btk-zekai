import { Bell, Sparkles } from "lucide-react";
import { sellerStore } from "@/lib/mock-data/seller";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SellerTopbar({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="border-b border-[#E5E7EB] bg-white">
      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-1 rounded-full border-[#DDD6FE] bg-[#F5F3FF] text-[#5B2EFF]">
            <Sparkles className="size-3.5" />
            AI tarama hazır
          </Badge>
          <Button variant="outline" size="icon-lg" className="rounded-xl bg-white">
            <Bell className="size-4" />
          </Button>
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
            <Avatar size="sm">
              <AvatarFallback className="bg-[#FF6000] text-xs font-bold text-white">
                MK
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-sm md:block">
              <p className="font-extrabold text-[#111827]">{sellerStore.storeName}</p>
              <p className="text-xs text-[#6B7280]">{sellerStore.ownerName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
