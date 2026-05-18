namespace ZekAI.Application.DTOs.Buyer;

public record CheckoutItemRequest(string ProductId, int Quantity);
public record CheckoutBundleRequest(Guid BundleId, int Quantity);

public record CreateCheckoutOrderRequest(
    List<CheckoutItemRequest> Items,
    List<CheckoutBundleRequest> Bundles,
    string DeliveryAddress,
    string PaymentMethod = "Kredi Karti"
);

public record OrderDto(
    Guid Id,
    string OrderNumber,
    decimal Subtotal,
    decimal DiscountTotal,
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
    Guid? BundleId,
    string? BundleTitle,
    decimal OriginalUnitPrice,
    decimal DiscountAmount,
    decimal Price,
    int Quantity
);
