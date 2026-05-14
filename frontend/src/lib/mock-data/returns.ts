import type { ReturnRequest } from "@/types/return";

export const returnRequests: ReturnRequest[] = [
  {
    id: "demo-return-1",
    orderId: "order-seramik-1002",
    productId: "seramik-taki-seti-beyaz",
    productTitle: "Seramik Takı Seti - Beyaz",
    productImage:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    buyerName: "Ahmet Yılmaz",
    sellerName: "Atölye Luna",
    reason: "damaged",
    reasonLabel: "Hasarlı geldi",
    buyerClaim:
      "Kutuyu açtığımda ürün kırık çıktı. Parçalardan biri kopmuş ve kutu içinde dağılmıştı.",
    sellerResponse:
      "Ürün sağlam paketlenerek gönderildi. Kargo tutanağında hasar yok ve fotoğrafta kullanım izi olabilecek izler var.",
    status: "arbiter_review",
    amount: 380,
    requestedAt: "11 Mayıs 2026",
    updatedAt: "13 Mayıs 2026",
    evidenceImages: [
      "Kırık parça fotoğrafı",
      "Kargo kutusu fotoğrafı",
      "Ürün yakın plan fotoğrafı",
    ],
    timeline: [
      {
        label: "İade talebi açıldı",
        description: "Alıcı hasarlı ürün iddiasını iletti.",
        status: "completed",
      },
      {
        label: "Satıcı yanıt verdi",
        description: "Satıcı sağlam gönderim ve kullanım izi itirazı sundu.",
        status: "completed",
      },
      {
        label: "AI Hakem incelemesi başladı",
        description: "Kanıtlar ve zaman çizelgesi değerlendiriliyor.",
        status: "current",
      },
      {
        label: "Çözüm önerilecek",
        description: "Taraflara kısmi çözüm önerisi sunulacak.",
        status: "pending",
      },
    ],
  },
  {
    id: "return-watch-2",
    orderId: "order-pulsewave-1001",
    productId: "bluetooth-kulaklik-pro-x1",
    productTitle: "PulseWave Pro X1 Bluetooth 5.3 Kablosuz Kulaklık",
    productImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    buyerName: "Zeynep Aksoy",
    sellerName: "TeknoPazar Plus",
    reason: "not_as_expected",
    reasonLabel: "Beklediğim gibi değil",
    buyerClaim: "Mikrofon online görüşmede yeterince net değil.",
    status: "seller_review",
    amount: 1015,
    requestedAt: "14 Mayıs 2026",
    updatedAt: "14 Mayıs 2026",
    evidenceImages: ["Mikrofon test ekran görüntüsü"],
    timeline: [
      {
        label: "İade talebi açıldı",
        description: "Satıcı yanıtı bekleniyor.",
        status: "current",
      },
      {
        label: "Satıcı yanıtı",
        description: "Satıcı kabul veya itiraz ile yanıt verecek.",
        status: "pending",
      },
    ],
  },
];

export function getReturnById(returnId: string) {
  return returnRequests.find((request) => request.id === returnId);
}
