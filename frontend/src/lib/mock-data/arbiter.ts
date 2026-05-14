import type { ArbiterCase } from "@/types/arbiter";

export const arbiterCases: ArbiterCase[] = [
  {
    id: "demo-case-1",
    returnId: "demo-return-1",
    productId: "seramik-taki-seti-beyaz",
    productTitle: "Seramik Takı Seti - Beyaz",
    productImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    orderAmount: 380,
    deliveryDate: "6 Mayıs 2026",
    returnOpenedAt: "11 Mayıs 2026",
    buyerClaim: "Kutuyu açtığımda ürün kırıktı.",
    sellerClaim:
      "Ürün sağlam gönderildi, kargo tutanağında hasar yok. Fotoğrafta kullanım izi var.",
    sellerRightPercent: 65,
    buyerRightPercent: 35,
    resolution: {
      recommendedRefundPercent: 40,
      refundAmount: 152,
      sellerKeepsAmount: 228,
      buyerOutcome: "Alıcıya ₺152 kısmi iade yapılır.",
      sellerOutcome: "Satıcı ₺228 tutarı korur.",
      operationalImpact: "Ürün alıcıda kalır, iade kargo maliyeti oluşmaz.",
    },
    sellerEvidence: [
      {
        id: "cargo-report",
        title: "Kargo tutanağında hasar yok",
        description: "Teslim kaydında dış paket hasarı görünmüyor.",
      },
      {
        id: "late-return",
        title: "İade 5 gün sonra açıldı",
        description: "Hasar iddiası teslimden hemen sonra bildirilmedi.",
      },
      {
        id: "usage-marks",
        title: "Fotoğrafta kullanım izi olabilecek izler var",
        description: "Görsel kanıt net kırık yanında olası kullanım izleri de içeriyor.",
      },
      {
        id: "message",
        title: "Mesajlaşmada önce olumlu ifade var",
        description: "Alıcı ilk mesajında ürünün güzel göründüğünü yazmış.",
      },
    ],
    buyerEvidence: [
      {
        id: "broken-piece",
        title: "Fotoğrafta kırık parça var",
        description: "Alıcının yüklediği görselde ürün parçası kırık görünüyor.",
      },
      {
        id: "fragile-claim",
        title: "Ürün açıklaması dayanıklılığı abartıyor",
        description: "Sayfadaki dayanıklılık iddiası kırılgan ürün için güçlü kanıtla desteklenmiyor.",
      },
      {
        id: "missing-warning",
        title: "Kullanım uyarısı eksik",
        description: "Seramik ürünün darbe ve kullanım hassasiyeti sayfada yeterince görünür değil.",
      },
    ],
    reviewSteps: [
      "Alıcı iddiası inceleniyor",
      "Satıcı itirazı inceleniyor",
      "Kanıtlar toplanıyor",
      "Görseller değerlendiriliyor",
      "Zaman çizelgesi kontrol ediliyor",
      "Karar metni hazırlanıyor",
    ],
  },
];

export function getArbiterCaseById(caseId: string) {
  return arbiterCases.find((arbiterCase) => arbiterCase.id === caseId);
}
