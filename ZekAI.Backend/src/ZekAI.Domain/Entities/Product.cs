namespace ZekAI.Domain.Entities;

public class Product
{
    public string Id { get; set; } = "";       // "bluetooth-kulaklik-pro-x1" slug
    public string Title { get; set; } = "";
    public string Brand { get; set; } = "";
    public string SellerName { get; set; } = "";
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string FeaturesJson { get; set; } = "{}";   // JSON dict
    public string BadgesJson { get; set; } = "[]";     // JSON array
    public string CargoText { get; set; } = "";
    public int Stock { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Category? Category { get; set; }
    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<ProductReview> Reviews { get; set; } = [];
    public ICollection<ProductPriceHistory> PriceHistory { get; set; } = [];
    public SellerProduct? SellerProduct { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}
