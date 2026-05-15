import { syntheticPersonas } from "@/lib/mock-data/seller";
import { SyntheticPersonaCard } from "@/components/seller/SyntheticPersonaCard";

const commonIssues = [
  { label: "Mikrofon bilgisi eksik", value: "10/12" },
  { label: "Fotoğraflar yetersiz", value: "8/12" },
  { label: "Yorum kalitesi güven vermiyor", value: "7/12" },
  { label: "Oyun gecikmesi belirsiz", value: "6/12" },
];

export function SyntheticCustomerPanel() {
  const buyCount = syntheticPersonas.filter((persona) => persona.decision === "buy").length;
  const skipCount = syntheticPersonas.filter((persona) => persona.decision === "skip").length;
  const undecidedCount = syntheticPersonas.filter(
    (persona) => persona.decision === "undecided",
  ).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Sentetik müşteri", value: "12" },
          { label: "Satın alırdı", value: `${buyCount}/12` },
          { label: "Satın almazdı", value: `${skipCount}/12` },
          { label: "Kararsız", value: `${undecidedCount}/12` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-bold text-[#6B7280]">{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-[#111827]">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">
              En büyük kayıp sebebi: Mikrofon bilgisi eksik
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#6B7280]">
              Persona paneli ürünün hangi beklentilerde satış kaybettiğini özetler.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {commonIssues.map((issue) => (
            <div key={issue.label} className="rounded-xl bg-[#F8FAFC] p-4">
              <p className="text-2xl font-extrabold text-[#111827]">{issue.value}</p>
              <p className="mt-1 text-sm leading-5 text-[#6B7280]">{issue.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {syntheticPersonas.map((persona) => (
          <SyntheticPersonaCard key={persona.id} persona={persona} />
        ))}
      </section>
    </div>
  );
}
