namespace ZekAI.Application.DTOs.Buyer;

public record AddToCartRequest(string ProductId, int Quantity = 1);
public record UpdateCartItemRequest(int Quantity);

public record CartItemDto(
    int Id,
    string ProductId,
    string Title,
    decimal Price,
    string Image,
    int Quantity,
    int Stock
);

public record CartDto(
    Guid Id,
    List<CartItemDto> Items
);
