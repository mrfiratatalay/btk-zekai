namespace ZekAI.Domain.Entities;

public class Cart
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public User? Buyer { get; set; }
    public List<CartItem> Items { get; set; } = [];
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CartItem
{
    public int Id { get; set; }
    public Guid CartId { get; set; }
    public Cart? Cart { get; set; }
    public string ProductId { get; set; } = "";
    public string Title { get; set; } = "";
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public Guid? BundleId { get; set; }
    public string? BundleTitle { get; set; }
    public string Image { get; set; } = "";
    public int Quantity { get; set; }
    public int Stock { get; set; }
}
