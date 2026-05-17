namespace ZekAI.Application.DTOs.Buyer;

public record FavoriteItemDto(
    string ProductId,
    string Title,
    decimal Price,
    string Image,
    DateTime AddedAt
);
