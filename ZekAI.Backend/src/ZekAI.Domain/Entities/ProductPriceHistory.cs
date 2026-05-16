namespace ZekAI.Domain.Entities;

public class ProductPriceHistory
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public string Day { get; set; } = "";
    public decimal Price { get; set; }
    public decimal MarketMedian { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
}
