import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface ZekaiLogoProps {
  size?: LogoSize;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

const sizeMap = {
  sm: { box: "size-7", z: "text-[13px]", brand: "text-sm", sub: "text-[9px]", spark: 7 },
  md: { box: "size-8", z: "text-[15px]", brand: "text-base", sub: "text-[10px]", spark: 8 },
  lg: { box: "size-10", z: "text-[18px]", brand: "text-xl", sub: "text-xs", spark: 9 },
};

export function ZekaiLogo({ size = "md", showText = true, subtitle, className }: ZekaiLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon box */}
      <div className={cn("relative flex items-center justify-center rounded-xl bg-[#ADFF41] shadow-sm shrink-0", s.box)}>
        <span className={cn("font-black text-[#1a2e00] leading-none select-none", s.z)}>Z</span>
        {/* Spark — 4-pointed star in top-right corner */}
        <svg
          className="absolute"
          style={{ top: 2, right: 2, width: s.spark, height: s.spark }}
          viewBox="0 0 10 10"
          fill="none"
        >
          <line x1="5" y1="0" x2="5" y2="10" stroke="#1a2e00" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
          <line x1="0" y1="5" x2="10" y2="5" stroke="#1a2e00" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
          <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" stroke="#1a2e00" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
          <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" stroke="#1a2e00" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-black text-foreground tracking-tight", s.brand)}>ZekAI</span>
          {subtitle && (
            <span className={cn("font-semibold tracking-widest text-muted-foreground/50 uppercase", s.sub)}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
