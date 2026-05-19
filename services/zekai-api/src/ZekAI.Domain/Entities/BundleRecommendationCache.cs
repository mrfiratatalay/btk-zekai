namespace ZekAI.Domain.Entities;

public class BundleRecommendationCache
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SellerKey { get; set; } = "";
    public string PrimaryProductId { get; set; } = "";
    public string ProductListHash { get; set; } = "";
    public string ResponseJson { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(7);
    public DateTime? LastUsedAt { get; set; }
}
