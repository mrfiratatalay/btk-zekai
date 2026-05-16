namespace ZekAI.Domain.Entities;

public class BuyerAnalysis
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string ExternalId { get; set; } = ""; // analysisId from frontend
    public string ProductId { get; set; } = "";
    public string ProductTitle { get; set; } = "";
    public string ProductImage { get; set; } = "";
    public decimal ProductPrice { get; set; }
    public string SellerName { get; set; } = "";
    public string UserNeedText { get; set; } = "";
    public int OverallRiskPercent { get; set; }
    public string RecommendationLevel { get; set; } = ""; // safe | caution | risky
    public string ScoresJson { get; set; } = "{}";
    public string? Status { get; set; }
    public string? UserNote { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public ZekaiUser? User { get; set; }
    public ICollection<ShoppingProjectAnalysis> ProjectLinks { get; set; } = [];
}
