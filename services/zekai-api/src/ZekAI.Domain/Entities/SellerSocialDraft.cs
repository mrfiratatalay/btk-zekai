namespace ZekAI.Domain.Entities;

/// <summary>
/// Sosyal medya AI çıktısının DB'de saklanan taslağı. Markete gitmez —
/// satıcının kendi sosyal hesabında kullanacağı varyasyonlar. Çoklu varyasyon;
/// ürün başına bir tanesi "Aktif" işaretlenebilir.
/// </summary>
public class SellerSocialDraft
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    /// <summary>commerce-api ürün kimliği (slug).</summary>
    public string CommerceProductId { get; set; } = "";

    public string Label { get; set; } = "";

    public string Tone { get; set; } = "";
    public string Purpose { get; set; } = "";

    /// <summary>Seçili platformlar: ["instagram","tiktok","twitter"]</summary>
    public string PlatformsJson { get; set; } = "[]";

    /// <summary>Üretilen içerik paketinin tamamı (SocialMediaContent JSON).</summary>
    public string ContentJson { get; set; } = "{}";

    /// <summary>Ürün için seçili/aktif varyasyon.</summary>
    public bool IsActive { get; set; }

    public string InputHash { get; set; } = "";
    public string AiModel { get; set; } = "";
    public string Source { get; set; } = "manual";

    /// <summary>"ready" (aktif) / "archived" (geri alınabilir).</summary>
    public string Status { get; set; } = "ready";

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ZekaiUser? User { get; set; }
}
