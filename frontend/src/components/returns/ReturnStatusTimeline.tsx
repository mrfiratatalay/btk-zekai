import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { ReturnTimelineItem } from "@/types/return";
import { cn } from "@/lib/utils";

export function ReturnStatusTimeline({
  items,
}: {
  items: ReturnTimelineItem[];
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#111827]">İade durumu</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const completed = item.status === "completed";
          const current = item.status === "current";

          return (
            <div key={item.label} className="flex gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                  completed && "bg-[#16A34A] text-white",
                  current && "bg-[#5B2EFF] text-white",
                  !completed && !current && "bg-[#F3F4F6] text-[#9CA3AF]",
                )}
              >
                {completed ? (
                  <CheckCircle2 className="size-5" />
                ) : current ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Circle className="size-4" />
                )}
              </span>
              <div>
                <p className="font-extrabold text-[#111827]">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
