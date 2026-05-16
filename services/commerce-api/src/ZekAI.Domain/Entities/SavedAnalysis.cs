namespace ZekAI.Domain.Entities;

public class SavedAnalysis
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public string ExternalId { get; set; } = "";
    public string ProductId { get; set; } = "";
    public string ProductTitle { get; set; } = "";
    public string ProductImage { get; set; } = "";
    public string ProductPrice { get; set; } = "";
    public string SellerName { get; set; } = "";
    public string UserNeedText { get; set; } = "";
    public double OverallRiskPercent { get; set; }
    public string RecommendationLevel { get; set; } = "caution";
    public string ScoresJson { get; set; } = "{}";
    public string Status { get; set; } = "thinking";
    public string? UserNote { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public User? Buyer { get; set; }
}
