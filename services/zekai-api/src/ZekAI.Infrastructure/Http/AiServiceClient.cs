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

    private static async Task<T?> ReadAiResponseAsync<T>(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new AiServiceException((int)response.StatusCode, body);
        }

        return await response.Content.ReadFromJsonAsync<T>(JsonOpts);
    }

    // ── Social Content ────────────────────────────────────────────────────────

    public async Task<AiSocialContentResult?> GenerateSocialContentAsync(
        string productTitle, string category, decimal price,
        string? description, List<string> features, string tone, string purpose, List<string> platforms, string? note = null)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            price = (double)price,
            description,
            features,
            tone,
            purpose,
            platforms,
            note,
        };

        var response = await http.PostAsJsonAsync("/seller/social-content", payload, JsonOpts);
        return await ReadAiResponseAsync<AiSocialContentResult>(response);
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
        return await ReadAiResponseAsync<AiContentResult>(response);
    }

    // ── Simulation (Dynamic Personas + Thinking) ──────────────────────────────

    public async Task<AiSimulationResult?> SimulateProductAsync(
        string productTitle, string category, decimal price,
        string? description, List<string> features, List<SimulationReviewDto>? reviews = null)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            price = (double)price,
            description,
            features,
            reviews = (reviews ?? []).Take(12).Select(r => new
            {
                author_name = r.AuthorName,
                rating = r.Rating,
                title = r.Title,
                text = r.Text,
                verified_purchase = r.VerifiedPurchase,
            }),
        };

        var response = await http.PostAsJsonAsync("/seller/simulate", payload, JsonOpts);
        return await ReadAiResponseAsync<AiSimulationResult>(response);
    }

    // ── Single Image (legacy) ─────────────────────────────────────────────────

    public async Task<AiImageResult?> GenerateProductImageAsync(
        string productTitle, string category, string? description, string style)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            description,
            style,
        };

        var response = await http.PostAsJsonAsync("/seller/ai-image", payload, JsonOpts);
        return await ReadAiResponseAsync<AiImageResult>(response);
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
        return await ReadAiResponseAsync<AiImagesResult>(response);
    }

    // ── Bundle Recommendations (AI) ───────────────────────────────────────────

    public async Task<AiBundleRecommendResponse?> GenerateBundleRecommendationsAsync(
        AiBundleCandidate primary, List<AiBundleCandidate> candidates)
    {
        var payload = new { primary, candidates };
        var response = await http.PostAsJsonAsync("/seller/bundle-recommend", payload, JsonOpts);
        return await ReadAiResponseAsync<AiBundleRecommendResponse>(response);
    }

    // ── Customer Voice (Reply Drafts + FAQ Drafts) ────────────────────────────

    public async Task<AiCustomerVoiceResult?> GenerateCustomerVoiceAsync(
        string productTitle, string category, List<AiReviewInput> reviews)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            reviews,
        };
        var response = await http.PostAsJsonAsync("/seller/customer-voice", payload, JsonOpts);
        return await ReadAiResponseAsync<AiCustomerVoiceResult>(response);
    }

    // ── SEO Optimization ──────────────────────────────────────────────────────

    public async Task<AiSeoResult?> GenerateSeoAsync(
        string productTitle, string category, decimal price,
        string? description, List<string> features, string? brand)
    {
        var payload = new
        {
            product_title = productTitle,
            category,
            price = (double)price,
            description,
            features,
            brand,
        };
        var response = await http.PostAsJsonAsync("/seller/seo", payload, JsonOpts);
        return await ReadAiResponseAsync<AiSeoResult>(response);
    }
}

public class AiServiceException(int statusCode, string responseBody) : Exception(responseBody)
{
    public int StatusCode { get; } = statusCode;
    public string ResponseBody { get; } = responseBody;
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record AiInstagramContent(
    string Caption,
    List<string> Hashtags,
    string Cta,
    string OverlayText
);

public record AiTiktokScene(string Title, string Description);

public record AiTiktokContent(
    string Hook,
    List<AiTiktokScene> Scenes,
    string Caption,
    List<string> Hashtags
);

public record AiTwitterContent(
    string Post,
    List<string> Hashtags,
    string Cta
);

public record AiSocialContentResult(
    string Tone,
    string Purpose,
    List<string> Platforms,
    AiInstagramContent? Instagram,
    AiTiktokContent? Tiktok,
    AiTwitterContent? Twitter,
    [property: JsonPropertyName("_mock")] bool Mock = false
);

public record AiContentResult(
    string Title,
    string ShortDescription,
    string Description,
    List<string> Features,
    string WhatIImproved,
    [property: JsonPropertyName("_mock")] bool Mock = false
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
    string Monologue,
    [property: JsonPropertyName("focusArea")] string FocusArea = "features",
    [property: JsonPropertyName("focusLabel")] string FocusLabel = "Özellikleri inceliyor",
    [property: JsonPropertyName("bubbleText")] string BubbleText = "Bu özellikler bana yeter mi?"
);

public record AiSimulationResult(
    List<AiPersonaResult> Personas,
    [property: JsonPropertyName("_mock")] bool Mock = false
);

public record AiImageResult(
    string ImageBase64,
    string MimeType,
    string Description,
    [property: JsonPropertyName("_mock")] bool Mock = false
);

public record AiImageItem(
    string Type,
    string Label,
    string ImageBase64,
    string MimeType
);

public record AiImagesResult(
    List<AiImageItem> Images,
    [property: JsonPropertyName("_mock")] bool Mock = false
);

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
    string? MissingOpportunityNote,
    [property: JsonPropertyName("_mock")] bool Mock = false
);

public record AiReviewInput(
    [property: JsonPropertyName("review_id")] int ReviewId,
    [property: JsonPropertyName("author_name")] string AuthorName,
    int Rating,
    string Text,
    List<string> Tags
);

public record AiReplyDraft(
    [property: JsonPropertyName("review_id")] int ReviewId,
    [property: JsonPropertyName("needs_reply")] bool NeedsReply,
    [property: JsonPropertyName("issue_type")] string IssueType,
    string Sentiment,
    [property: JsonPropertyName("suggested_reply")] string SuggestedReply
);

public record AiFaqDraft(
    string Question,
    string Answer,
    [property: JsonPropertyName("source_review_ids")] List<int> SourceReviewIds,
    [property: JsonPropertyName("category_tag")] string CategoryTag
);

public record AiCustomerVoiceResult(
    [property: JsonPropertyName("reply_drafts")] List<AiReplyDraft> ReplyDrafts,
    [property: JsonPropertyName("faq_drafts")] List<AiFaqDraft> FaqDrafts,
    [property: JsonPropertyName("_mock")] bool Mock = false
);

public record AiSeoResult(
    string FocusKeyword,
    List<string> SecondaryKeywords,
    string SeoTitle,
    string MetaDescription,
    string UrlSlugSuggestion,
    List<string> ImprovementTips,
    [property: JsonPropertyName("_mock")] bool Mock = false
);
