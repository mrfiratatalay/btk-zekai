namespace ZekAI.Domain.Entities;

public class ProductFaq
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public Guid SellerId { get; set; }
    public string Question { get; set; } = "";
    public string Answer { get; set; } = "";
    public string CategoryTag { get; set; } = "";
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
    public Seller? Seller { get; set; }
}
