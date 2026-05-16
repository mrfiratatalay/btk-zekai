namespace ZekAI.Application.DTOs;

public record StoreConnectRequest(string CommerceEmail, string CommercePassword);

// Matches the frontend StoreConnection interface (platform, storeName, status, lastSyncAt, productCount)
public record StoreConnectionDto(
    string Platform,
    string StoreName,
    string Status,
    DateTime? LastSyncAt,
    int ProductCount
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
