import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { SyntheticPersona } from "@/types/seller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const decisionConfig = {
  buy: {
    label: "Alırdı",
    icon: CheckCircle2,
    className: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
  },
  skip: {
    label: "Almazdı",
    icon: XCircle,
    className: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
  },
  undecided: {
    label: "Kararsız",
    icon: HelpCircle,
    className: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  },
};

export function SyntheticPersonaCard({
  persona,
}: {
  persona: SyntheticPersona;
}) {
  const config = decisionConfig[persona.decision];
  const Icon = config.icon;

  return (
    <Dialog>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-[#111827]">{persona.name}</h3>
            <p className="text-sm text-[#6B7280]">
              {persona.age}, {persona.segment}
            </p>
          </div>
          <Badge className={cn("gap-1 rounded-full border", config.className)}>
            <Icon className="size-3.5" />
            {config.label}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#374151]">{persona.reason}</p>
        <div className="mt-3 rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#6B7280]">
          Öncelik: {persona.caresAbout}
        </div>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-4 h-9 w-full rounded-lg border-[#E5E7EB] bg-white font-bold"
          >
            Detayı gör
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {persona.name} neden {config.label.toLocaleLowerCase("tr-TR")}?
          </DialogTitle>
          <DialogDescription>{persona.profile}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-extrabold text-[#111827]">Üründe baktığı alanlar</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {persona.lookedAt.map((item) => (
                <Badge
                  key={item}
                  className="rounded-full border-[#E5E7EB] bg-[#F8FAFC] text-[#374151]"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <p className="text-sm font-extrabold text-[#111827]">Kazanmak için öneri</p>
            <p className="mt-2 text-sm leading-6 text-[#374151]">
              {persona.recommendation}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
