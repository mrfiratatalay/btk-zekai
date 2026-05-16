namespace ZekAI.Application.DTOs.Buyer;

public record ShoppingProjectDto(
    string Id,
    string Title,
    string Goal,
    decimal? Budget,
    DateTime CreatedAt,
    List<string> SavedAnalysisIds
);

public record CreateShoppingProjectRequest(
    string? ExternalId,
    string Title,
    string Goal,
    decimal? Budget,
    List<string>? SavedAnalysisIds
);

public record UpdateShoppingProjectRequest(
    string? Title,
    string? Goal,
    decimal? Budget,
    List<string>? SavedAnalysisIds
);
