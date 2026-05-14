"use client";

import { CheckCircle2, HelpCircle, MapPin, XCircle } from "lucide-react";
import { useState } from "react";
import type { SyntheticPersona } from "@/types/seller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
    bandClass: "bg-[#F0FDF4] border-[#BBF7D0]",
    bannerText: "Bu müşteri ürününüzü satın alırdı.",
    bannerClass: "bg-[#DCFCE7] text-[#166534]",
  },
  skip: {
    label: "Almazdı",
    icon: XCircle,
    className: "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]",
    bandClass: "bg-[#FEF2F2] border-[#FECACA]",
    bannerText: "Bu müşteri ürününüzü satın almazdı.",
    bannerClass: "bg-[#FEE2E2] text-[#991B1B]",
  },
  undecided: {
    label: "Kararsız",
    icon: HelpCircle,
    className: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
    bandClass: "bg-[#FFFBEB] border-[#FDE68A]",
    bannerText: "Bu müşteri kararsız kaldı, ürününüzü almayabilir.",
    bannerClass: "bg-[#FEF9C3] text-[#92400E]",
  },
};

export function SyntheticPersonaCard({
  persona,
}: {
  persona: SyntheticPersona;
}) {
  const config = decisionConfig[persona.decision];
  const Icon = config.icon;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-[#111827]">{persona.name}</h3>
            <p className="flex items-center gap-1 text-sm text-[#6B7280]">
              <MapPin className="size-3" />
              {persona.age}, {persona.city} · {persona.segment}
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
            Detayı gör — {persona.name} ne düşündü?
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-extrabold text-[#111827]">
            <span>{persona.name}</span>
            <Badge className={cn("gap-1 rounded-full border text-sm", config.className)}>
              <Icon className="size-4" />
              {config.label}
            </Badge>
          </DialogTitle>
          <p className="flex items-center gap-1 text-sm text-[#6B7280]">
            <MapPin className="size-3" />
            {persona.age} yaşında · {persona.city} · {persona.segment}
          </p>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6 pt-4">
          {/* Decision banner */}
          <div className={cn("rounded-xl border px-4 py-3 text-sm font-semibold", config.bannerClass)}>
            <Icon className="mb-1 size-4" />
            {config.bannerText}
          </div>

          {/* Profile */}
          <div className="rounded-xl bg-[#F8FAFC] p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#6B7280]">Profil</p>
            <p className="mt-1 text-sm leading-6 text-[#374151]">{persona.profile}</p>
          </div>

          {/* Monologue */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-[#111827]">
              {persona.name} ürün sayfasını gezdi ve şunları söyledi:
            </p>
            <div className="relative rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="absolute left-4 top-4 text-3xl leading-none text-[#E5E7EB] select-none">
                "
              </div>
              <p className="pl-5 text-sm leading-7 text-[#374151] italic">
                {persona.monologue}
              </p>
              <div className="absolute bottom-3 right-4 text-3xl leading-none text-[#E5E7EB] select-none">
                "
              </div>
            </div>
          </div>

          {/* Looked at */}
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

          {/* Recommendation */}
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
            <p className="text-sm font-extrabold text-[#1E40AF]">
              💡 Bu personayı kazanmak için
            </p>
            <p className="mt-2 text-sm leading-6 text-[#1E3A8A]">
              {persona.recommendation}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
