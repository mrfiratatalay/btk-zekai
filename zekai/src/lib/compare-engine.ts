/**
 * compare-engine.ts
 *
 * Birden fazla SavedAnalysis'i karşılaştırıp kazanan + açıklama üretir.
 * Tüm hesaplama client-side, mock data'ya dayanır.
 */

import type { SavedAnalysis } from "@/types/analysis";

export type CompareResult = {
  winnerId: string;
  winnerTitle: string;
  reasoning: string;
  table: CompareRow[];
};

export type CompareRow = {
  id: string;
  productTitle: string;
  fitScore: number;
  trustScore: number;
  priceScore: number;
  returnRiskPercent: number;
  // kompozit skor (yüksek = daha iyi)
  compositeScore: number;
  verdict: "best" | "ok" | "risky";
};

/**
 * Ağırlıklı kompozit skor hesaplar.
 * İade riski tersine çevrilir (düşük risk = iyi).
 */
function calcComposite(a: SavedAnalysis): number {
  const { fitScore, trustScore, priceScore, returnRiskPercent } = a.scores;
  const returnGood = 100 - returnRiskPercent;
  // ağırlıklar: uygunluk %35, güven %25, fiyat %20, iade %20
  return (
    fitScore * 0.35 +
    trustScore * 0.25 +
    priceScore * 0.2 +
    returnGood * 0.2
  );
}

export function compareAnalyses(
  analyses: SavedAnalysis[],
  userNeed?: string
): CompareResult {
  if (analyses.length === 0) {
    return {
      winnerId: "",
      winnerTitle: "",
      reasoning: "Karşılaştırılacak ürün bulunamadı.",
      table: [],
    };
  }

  const rows: CompareRow[] = analyses.map((a) => {
    const composite = calcComposite(a);
    return {
      id: a.id,
      productTitle: a.productTitle,
      fitScore: a.scores.fitScore,
      trustScore: a.scores.trustScore,
      priceScore: a.scores.priceScore,
      returnRiskPercent: a.scores.returnRiskPercent,
      compositeScore: Math.round(composite),
      verdict: "ok", // geçici, aşağıda belirlenir
    };
  });

  // En yüksek kompozit skor = kazanan
  const sorted = [...rows].sort((a, b) => b.compositeScore - a.compositeScore);
  const winner = sorted[0];
  const worst = sorted[sorted.length - 1];

  // verdict ata
  rows.forEach((row) => {
    if (row.id === winner.id) {
      row.verdict = "best";
    } else if (row.id === worst.id && sorted.length > 2) {
      row.verdict = "risky";
    } else {
      row.verdict = "ok";
    }
  });

  // Açıklama oluştur
  const winnerAnalysis = analyses.find((a) => a.id === winner.id)!;
  const needContext = userNeed
    ? `Yazdığın ihtiyaca göre ("${userNeed.slice(0, 60)}${userNeed.length > 60 ? "..." : ""}") `
    : "";

  const reasons: string[] = [];

  if (winnerAnalysis.scores.fitScore >= 70) {
    reasons.push("uygunluk skoru en yüksek");
  }
  if (winnerAnalysis.scores.trustScore >= 70) {
    reasons.push("satıcı güven sinyali güçlü");
  }
  if (winnerAnalysis.scores.priceScore >= 65) {
    reasons.push("fiyat/değer dengesi iyi");
  }
  if (winnerAnalysis.scores.returnRiskPercent <= 30) {
    reasons.push("iade riski düşük");
  }
  if (winnerAnalysis.overallRiskPercent <= 35) {
    reasons.push("pişmanlık riski en düşük");
  }

  const reasonText =
    reasons.length > 0
      ? reasons.join(", ") + "."
      : "genel skor dengesi en iyi bu ürün için.";

  const reasoning = `${needContext}en mantıklı seçim **${winner.productTitle}** — ${reasonText}`;

  return {
    winnerId: winner.id,
    winnerTitle: winner.productTitle,
    reasoning,
    table: rows,
  };
}
