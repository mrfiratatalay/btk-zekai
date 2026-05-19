namespace ZekAI.Domain.Entities;

/// <summary>
/// Satıcının "AI ile Düzenle" ekranında ürettiği/düzenlediği içeriğin DB'de
/// saklanan anlık görüntüsü. Çoklu varyasyon: ürün başına birden fazla taslak
/// tutulur. Yayınlama bu kayıttan kopyalanır → tekrar AI maliyeti oluşmaz.
/// </summary>
public class SellerProductDraft
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Taslağı oluşturan ZekAI satıcı kullanıcısı.</summary>
    public Guid UserId { get; set; }

    /// <summary>commerce-api ürün kimliği (slug).</summary>
    public string CommerceProductId { get; set; } = "";

    public string Label { get; set; } = "";

    // ── İçerik anlık görüntüsü ────────────────────────────────────────────
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string FeaturesJson { get; set; } = "{}";
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int Stock { get; set; }
    public string Brand { get; set; } = "";
    public string CargoText { get; set; } = "";
    public int CategoryId { get; set; }

    /// <summary>
    /// Commerce storage'a kaydedilmiş üretilen görseller:
    /// [{ "type": "studio", "label": "Stüdyo", "url": "/images/products/..." }]
    /// </summary>
    public string ImagesJson { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ZekaiUser? User { get; set; }
}
