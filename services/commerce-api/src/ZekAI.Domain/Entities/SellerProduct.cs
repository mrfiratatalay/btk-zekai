namespace ZekAI.Domain.Entities;

public class SellerProduct
{
    public int Id { get; set; }
    public Guid SellerId { get; set; }
    public string ProductId { get; set; } = "";
    public bool IsPublished { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Seller? Seller { get; set; }
    public Product? Product { get; set; }
}
