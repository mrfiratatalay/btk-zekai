import { Menu, Percent } from "lucide-react";

const categories = [
  "Elektronik",
  "Giyim",
  "Ev & Yaşam",
  "Anne & Bebek",
  "Kozmetik",
  "Spor & Outdoor",
  "Kitap",
  "Kişisel Bakım",
  "Oto & Aksesuar",
];

export function CategoryStrip() {
  return (
    <nav className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 overflow-x-auto px-6 py-3">
        <button
          type="button"
          className="flex min-w-max items-center gap-2 text-sm font-bold text-[#111827] transition hover:text-[#FF6000]"
        >
          <Menu className="size-5" />
          Tüm Kategoriler
        </button>

        <div className="flex min-w-max flex-1 items-center justify-center gap-8">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className="text-sm font-semibold text-[#111827] transition hover:text-[#FF6000]"
            >
              {category}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ml-auto flex min-w-max items-center gap-2 text-sm font-bold text-[#FF6000]"
        >
          <Percent className="size-5" />
          Fırsatlar
        </button>
      </div>
    </nav>
  );
}
