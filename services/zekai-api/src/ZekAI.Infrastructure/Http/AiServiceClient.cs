using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ZekAI.Application.DTOs;

namespace ZekAI.Infrastructure.Http;

public class AiServiceClient(HttpClient http)
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    // ── Social Content ────────────────────────────────────────────────────────

    public async Task<AiSocialContentResult?> GenerateSocialContentAsync(
        string productTitle, string category, decimal price,
        string? description, List<string> features, string tone)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            price = (double)price,
            description,
            features,
            tone,
        };

        var response = await http.PostAsJsonAsync("/seller/social-content", payload, JsonOpts);
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<AiSocialContentResult>(JsonOpts);
    }

    // ── Content Generation (Vision + Thinking) ────────────────────────────────

    public async Task<AiContentResult?> GenerateProductContentAsync(
        string productTitle, string category, decimal price,
        string? currentDescription, List<string> currentFeatures,
        string? imageUrl = null,
        SimulationInsightDto? simulationInsight = null)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            price = (double)price,
            current_description = currentDescription,
            current_features = currentFeatures,
            image_url = imageUrl,
            simulation_context = simulationInsight is null ? null : new
            {
                buy_count          = simulationInsight.BuyCount,
                skip_count         = simulationInsight.SkipCount,
                undecided_count    = simulationInsight.UndecidedCount,
                skipper_reasons    = simulationInsight.SkipperReasons,
                undecided_concerns = simulationInsight.UndecidedConcerns,
                recommendations    = simulationInsight.Recommendations,
            },
        };

        var response = await http.PostAsJsonAsync("/seller/ai-content", payload, JsonOpts);
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<AiContentResult>(JsonOpts);
    }

    // ── Simulation (Dynamic Personas + Thinking) ──────────────────────────────

    public async Task<AiSimulationResult?> SimulateProductAsync(
        string productTitle, string category, decimal price,
        string? description, List<string> features)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            price = (double)price,
            description,
            features,
        };

        var response = await http.PostAsJsonAsync("/seller/simulate", payload, JsonOpts);
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<AiSimulationResult>(JsonOpts);
    }

    // ── Single Image (legacy) ─────────────────────────────────────────────────

    public async Task<AiImageResult?> GenerateProductImageAsync(
        string productTitle, string category, string? description)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            description,
            style = "ecommerce",
        };

        var response = await http.PostAsJsonAsync("/seller/ai-image", payload, JsonOpts);
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<AiImageResult>(JsonOpts);
    }

    // ── 3-Shot Images (studio / unboxing / lifestyle) ─────────────────────────

    public async Task<AiImagesResult?> GenerateProductImagesAsync(
        string productTitle, string category, string? description)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            description,
        };

        var response = await http.PostAsJsonAsync("/seller/ai-images", payload, JsonOpts);
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<AiImagesResult>(JsonOpts);
    }

    // ── Bundle Recommendations (AI) ───────────────────────────────────────────

    public async Task<AiBundleRecommendResponse?> GenerateBundleRecommendationsAsync(
        AiBundleCandidate primary, List<AiBundleCandidate> candidates)
    {
        var payload = new { primary, candidates };
        var response = await http.PostAsJsonAsync("/seller/bundle-recommend", payload, JsonOpts);
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<AiBundleRecommendResponse>(JsonOpts);
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record AiTiktokScene(string Time, string Text);

public record AiSocialContentResult(
    string Instagram,
    List<AiTiktokScene> Tiktok,
    string Twitter
);

public record AiContentResult(
    string Title,
    string ShortDescription,
    string Description,
    List<string> Features,
    string WhatIImproved
);

public record AiPersonaResult(
    string Id,
    string Name,
    int Age,
    string City,
    string Segment,
    string Profile,
    string CaresAbout,
    string Decision,
    string Reason,
    List<string> LookedAt,
    string Recommendation,
    string Monologue
);

public record AiSimulationResult(List<AiPersonaResult> Personas);

public record AiImageResult(
    string ImageBase64,
    string MimeType,
    string Description
);

public record AiImageItem(
    string Type,
    string Label,
    string ImageBase64,
    string MimeType
);

public record AiImagesResult(List<AiImageItem> Images);

public record AiBundleCandidate(
    string Id,
    string Title,
    string Category,
    double Price,
    string? Description,
    List<string> Features
);

public record AiBundleRec(
    string ComplementaryProductId,
    int SemanticScore,
    string WhyTogether,
    string BundleTitle,
    string BundleShortDescription,
    string BundleCampaignText,
    string CtaLabel,
    int SuggestedDiscount
);

public record AiBundleRecommendResponse(
    List<AiBundleRec> Recommendations,
    string? MissingOpportunityNote
);
