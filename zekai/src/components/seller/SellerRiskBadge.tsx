import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

function getRiskTone(score: number) {
  if (score >= 71) {
    return {
      label: "Yüksek risk",
      icon: CircleAlert,
      className: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
    };
  }

  if (score >= 41) {
    return {
      label: "İzle",
      icon: AlertTriangle,
      className: "border-[#FCD34D] bg-[#FFFBEB] text-[#B45309]",
    };
  }

  return {
    label: "Sağlıklı",
    icon: CheckCircle2,
    className: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
  };
}

export function SellerRiskBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const tone = getRiskTone(score);
  const Icon = tone.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-extrabold",
        tone.className,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {score}
      <span className="font-semibold">{tone.label}</span>
    </span>
  );
}
