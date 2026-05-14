import { CheckCircle2 } from "lucide-react";
import type { ArbiterEvidencePoint } from "@/types/arbiter";

function EvidenceList({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "seller" | "buyer";
  items: ArbiterEvidencePoint[];
}) {
  const toneClass =
    tone === "seller"
      ? "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]"
      : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#111827]">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`rounded-xl border p-4 ${toneClass}`}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-extrabold">{item.title}</p>
                <p className="mt-1 text-sm leading-6">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArbiterEvidencePanel({
  sellerEvidence,
  buyerEvidence,
}: {
  sellerEvidence: ArbiterEvidencePoint[];
  buyerEvidence: ArbiterEvidencePoint[];
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <EvidenceList
        title="Satıcının haklı olduğu noktalar"
        tone="seller"
        items={sellerEvidence}
      />
      <EvidenceList
        title="Alıcının haklı olduğu noktalar"
        tone="buyer"
        items={buyerEvidence}
      />
    </section>
  );
}
