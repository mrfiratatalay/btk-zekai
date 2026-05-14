import { FileImage } from "lucide-react";

export function ReturnEvidenceGrid({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#111827]">Kanıt görselleri</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-[#F8FAFC] p-4 text-center"
          >
            <FileImage className="size-7 text-[#6B7280]" />
            <p className="mt-3 text-sm font-bold text-[#374151]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
