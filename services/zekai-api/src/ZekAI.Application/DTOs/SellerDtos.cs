namespace ZekAI.Application.DTOs;

public record StoreConnectRequest(string Platform, string ApiKey);

// Matches the frontend StoreConnection interface (platform, storeName, status, lastSyncAt, productCount)
public record StoreConnectionDto(
    string Platform,
    string StoreName,
    string Status,
    DateTime? LastSyncAt,
    int ProductCount
);

// Mirrors commerce-api's SellerProductDto — must stay in sync
public record CommerceProductDto(
    string Id,
    string Title,
    string PrimaryImage,
    string Category,
    decimal Price,
    int Stock,
    int Sales30d,
    int ReturnRate,
    int ConversionRate,
    int HealthScore,
    decimal LostProfitMonthly,
    decimal ImprovableRevenueMonthly,
    string Status,
    string MainIssue,
    DateTime UpdatedAt
);
