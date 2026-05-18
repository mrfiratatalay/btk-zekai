namespace ZekAI.Application.DTOs.Buyer;

public record AddToCartRequest(string ProductId, int Quantity = 1);
public record AddBundleToCartRequest(int Quantity = 1);
public record UpdateCartItemRequest(int Quantity);
public record UpdateCartBundleRequest(int Quantity);

public record CartItemDto(
    int Id,
    string ProductId,
    string Title,
    decimal Price,
    decimal OriginalPrice,
    decimal DiscountAmount,
    string Image,
    int Quantity,
    int Stock,
    Guid? BundleId,
    string? BundleTitle
);

public record CartDto(
    Guid Id,
    List<CartItemDto> Items
);
