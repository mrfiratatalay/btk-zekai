namespace ZekAI.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public Guid OrderId { get; set; }
    public string ProductId { get; set; } = "";
    public string Title { get; set; } = "";
    public string SellerName { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }

    public Order? Order { get; set; }
    public Product? Product { get; set; }
}
