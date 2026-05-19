namespace ZekAI.Domain.Entities;

public class BuyerAnalysisCache
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string CacheKey { get; set; } = "";
    public string ProductId { get; set; } = "";
    public string NormalizedBuyerNeed { get; set; } = "";
    public string ProductFingerprint { get; set; } = "";
    public string ResultJson { get; set; } = "{}";
    public bool UsedSearch { get; set; }
    public string Model { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);

    public ZekaiUser? User { get; set; }
}
