export default function MockShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="shop-theme min-h-screen bg-white text-[#111827]">{children}</div>;
}
