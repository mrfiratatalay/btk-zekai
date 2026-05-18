using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class ProductBundle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SellerId { get; set; }
    public string PrimaryProductId { get; set; } = "";
    public string ComplementaryProductId { get; set; } = "";
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string CampaignText { get; set; } = "";
    public string CtaLabel { get; set; } = "Paketi Sepete Ekle";
    public decimal DiscountPercent { get; set; } = 5;
    public ProductBundleStatus Status { get; set; } = ProductBundleStatus.Draft;
    public string RecommendationReason { get; set; } = "";
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ArchivedAt { get; set; }

    public Seller? Seller { get; set; }
    public Product? PrimaryProduct { get; set; }
    public Product? ComplementaryProduct { get; set; }
}
