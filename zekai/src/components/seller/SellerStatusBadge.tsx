import type { SellerProductStatus } from "@/types/seller";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusCopy: Record<SellerProductStatus, string> = {
  urgent: "Acil",
  watch: "İzlemede",
  healthy: "Sağlıklı",
};

const statusCopyActions: Record<SellerProductStatus, string> = {
  urgent: "Acil",
  watch: "İzlemede",
  healthy: "Öneri",
};

const statusClasses: Record<SellerProductStatus, string> = {
  urgent: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  watch: "border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]",
  healthy: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
};

export function SellerStatusBadge({
  status,
  className,
  variant = "default",
}: {
  status: SellerProductStatus;
  className?: string;
  /** Aksiyon özetlerinde sağlıklı öncelik "Öneri" olarak gösterilir. */
  variant?: "default" | "actions";
}) {
  const label =
    variant === "actions" ? statusCopyActions[status] : statusCopy[status];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 font-bold", statusClasses[status], className)}
    >
      {label}
    </Badge>
  );
}
