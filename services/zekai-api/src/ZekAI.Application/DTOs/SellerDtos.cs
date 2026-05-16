namespace ZekAI.Application.DTOs;

public record StoreConnectRequest(string CommerceEmail, string CommercePassword);

public record StoreConnectionDto(
    string ProviderName,
    string CommerceSellerId,
    string Status,
    DateTime ConnectedAt,
    DateTime? LastSyncedAt
);

public record CommerceProductDto(
    string Id,
    string Title,
    string PrimaryImage,
    string Category,
    decimal Price,
    int Stock,
    string Status
);
