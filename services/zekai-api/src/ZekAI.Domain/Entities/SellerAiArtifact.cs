namespace ZekAI.Domain.Entities;

/// <summary>
/// Seller tarafinda pahali AI ciktilarinin yeniden kullanilabilir kaydi.
/// Publish edilebilir urun/sosyal taslaklari tipli tablolarinda kalir; simulasyon,
/// bundle ve standalone gorsel ciktilari burada saklanir.
/// </summary>
public class SellerAiArtifact
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string CommerceProductId { get; set; } = "";
    public string ArtifactType { get; set; } = "";
    public string Label { get; set; } = "";
    public string InputHash { get; set; } = "";
    public string PayloadJson { get; set; } = "{}";
    public string AiModel { get; set; } = "";
    public string Source { get; set; } = "gemini";
    public string Status { get; set; } = "ready";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }

    public ZekaiUser? User { get; set; }
}
