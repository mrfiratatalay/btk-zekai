using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public Guid BuyerId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal Total { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string DeliveryAddress { get; set; } = "";
    public string PaymentMethod { get; set; } = "";
    public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredAt { get; set; }

    public User? Buyer { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
}
