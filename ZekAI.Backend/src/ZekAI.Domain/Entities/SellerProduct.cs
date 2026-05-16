using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class SellerProduct
{
    public int Id { get; set; }
    public Guid SellerId { get; set; }
    public string ProductId { get; set; } = "";

    // Performance metrics
    public int Sales30d { get; set; }
    public double ReturnRate { get; set; }
    public double ConversionRate { get; set; }
    public int AiRiskScore { get; set; }
    public int HealthScore { get; set; }
    public decimal LostProfitMonthly { get; set; }
    public decimal ImprovableRevenueMonthly { get; set; }
    public ProductStatus Status { get; set; }
    public string MainIssue { get; set; } = "";
    public string LastAction { get; set; } = "";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Seller? Seller { get; set; }
    public Product? Product { get; set; }
}
