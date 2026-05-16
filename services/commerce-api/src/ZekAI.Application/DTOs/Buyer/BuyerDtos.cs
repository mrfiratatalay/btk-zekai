namespace ZekAI.Application.DTOs.Buyer;

public record CreateOrderRequest(string ProductId, int Quantity, string DeliveryAddress, string PaymentMethod = "Kredi Kartı");

public record OrderDto(
    Guid Id,
    string OrderNumber,
    decimal Total,
    string Status,
    string DeliveryAddress,
    string PaymentMethod,
    DateTime OrderedAt,
    DateTime? DeliveredAt,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    string ProductId,
    string Title,
    string Image,
    string SellerName,
    decimal Price,
    int Quantity
);

