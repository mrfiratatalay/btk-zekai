import type { SellerImprovement, SellerProductPerformance } from "@/types/seller";

export function getSellerImprovements(product: SellerProductPerformance): SellerImprovement[] {
  const improvements: SellerImprovement[] = [];

  if (product.returnRate >= 12 || product.healthScore < 70) {
    improvements.push({
      id: "return-risk",
      title: "Iade riskini azalt",
      currentState: `%${product.returnRate.toFixed(1)} iade orani`,
      suggestedChange: "Garanti, iade kosullari ve urun sinirlarini acikca belirt.",
      rationale: product.mainIssue || "Urun beklentisi ile sayfa vaadi arasinda fark olusuyor.",
      expectedImpact: `+${Math.round(product.improvableRevenueMonthly * 0.35).toLocaleString("tr-TR")} TL potansiyel`,
      priority: "urgent",
    });
  }

  if (product.conversionRate < 4.5) {
    improvements.push({
      id: "conversion",
      title: "Donusum mesajini guclendir",
      currentState: `%${product.conversionRate.toFixed(1)} donusum`,
      suggestedChange: "Baslikta ana kullanim senaryosunu, aciklamada kanitlari one cikar.",
      rationale: "Ziyaretci urunun hangi ihtiyaca net cevap verdigini hizli goremiyor.",
      expectedImpact: `+%${Math.max(8, Math.round((5 - product.conversionRate) * 6))} donusum`,
      priority: product.status === "urgent" ? "urgent" : "watch",
    });
  }

  if (product.aiRiskScore >= 55) {
    improvements.push({
      id: "trust",
      title: "Guven sinyallerini gorunur yap",
      currentState: `${product.aiRiskScore}/100 AI risk skoru`,
      suggestedChange: "Servis, kutu icerigi, kargo ve gercek kullanim gorsellerini ust bolume tasi.",
      rationale: "Risk skoru yuksek urunlerde alici kararindan once guven kaniti arar.",
      expectedImpact: "Daha dusuk vazgecme",
      priority: "urgent",
    });
  }

  improvements.push({
    id: "photos",
    title: "Eksik gorselleri tamamla",
    currentState: "Urun gorsel kaniti sinirli",
    suggestedChange: "Kutu icerigi, olcek ve kullanim halini gosteren fotograf ekle.",
    rationale: "Gorsel belirsizlik iade ve vazgecme riskini artirir.",
    expectedImpact: "Daha net beklenti",
    priority: "watch",
  });

  return improvements.slice(0, 4);
}
