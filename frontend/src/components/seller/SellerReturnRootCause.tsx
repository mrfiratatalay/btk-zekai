import { sellerReturnReasons } from "@/lib/mock-data/seller";
import { Progress } from "@/components/ui/progress";

export function SellerReturnRootCause() {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Son 60 gün iade", value: "28" },
          { label: "İade oranı", value: "%23" },
          { label: "Sektör ortalaması", value: "%12" },
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

      <section className="space-y-4">
        {sellerReturnReasons.map((reason) => (
          <div
            key={reason.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#111827]">
                  %{reason.percent} {reason.label}
                </h3>
                <p className="mt-2 text-sm italic leading-6 text-[#6B7280]">
                  “{reason.sampleComplaint}”
                </p>
              </div>
              <div className="md:w-56">
                <Progress value={reason.percent} className="h-2 bg-[#FEF3C7]" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl bg-[#F8FAFC] p-4">
                <p className="text-sm font-extrabold text-[#111827]">Kök neden</p>
                <p className="mt-2 text-sm leading-6 text-[#374151]">
                  {reason.rootCause}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-4">
                <p className="text-sm font-extrabold text-[#111827]">Çözüm</p>
                <p className="mt-2 text-sm leading-6 text-[#374151]">
                  {reason.solution}
                </p>
              </div>
              <div className="rounded-xl bg-[#F0FDF4] p-4">
                <p className="text-sm font-extrabold text-[#166534]">Tahmini etki</p>
                <p className="mt-2 text-sm leading-6 text-[#166534]">
                  {reason.expectedImpact}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
