using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using ZekAI.Application.DTOs;

namespace ZekAI.Infrastructure.Http;

public class CommerceApiClient(HttpClient http)
{
    private void SetBearerToken(string token)
        => http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    private static async Task<string> BuildErrorMessageAsync(HttpResponseMessage response, string fallback)
    {
        var body = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(body))
            return $"{fallback} Commerce API status: {(int)response.StatusCode}.";

        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("message", out var message))
                return message.GetString() ?? fallback;
            if (doc.RootElement.TryGetProperty("title", out var title))
                return title.GetString() ?? fallback;
        }
        catch (JsonException)
        {
            // Plain text / developer exception page.
        }

        var firstLine = body.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).FirstOrDefault();
        if (string.IsNullOrWhiteSpace(firstLine)) return fallback;
        return firstLine.Length > 350 ? firstLine[..350] : firstLine;
    }

    public async Task<CommerceAuthResponse?> LoginAsync(string email, string password)
    {
        var response = await http.PostAsJsonAsync("/api/auth/login", new { email, password });
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<CommerceAuthResponse>();
    }

    public async Task<ProductPreviewResponse?> GetProductByUrlAsync(string productUrl)
    {
        var encoded = Uri.EscapeDataString(productUrl);
        var response = await http.GetAsync($"/api/products/from-url?url={encoded}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<ProductPreviewResponse>();
    }

    public async Task<ProductPreviewResponse?> GetProductByIdAsync(string productId)
    {
        var response = await http.GetAsync($"/api/products/{productId}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<ProductPreviewResponse>();
    }

    public async Task<List<CommerceProductDto>> GetSellerProductsAsync(string commerceToken)
    {
        SetBearerToken(commerceToken);
        var response = await http.GetAsync("/api/seller/products");
        if (!response.IsSuccessStatusCode) return [];
        return await response.Content.ReadFromJsonAsync<List<CommerceProductDto>>() ?? [];
    }

    public async Task<bool> UpdateProductAsync(string commerceToken, string productId, object updatePayload)
    {
        SetBearerToken(commerceToken);
        var response = await http.PutAsJsonAsync($"/api/seller/products/{productId}", updatePayload);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(await BuildErrorMessageAsync(response, "Ürün Akıllı Market'te güncellenemedi."));
        return response.IsSuccessStatusCode;
    }

    public async Task<bool> PublishProductAsync(string commerceToken, string productId, bool published)
    {
        SetBearerToken(commerceToken);
        var response = await http.PutAsJsonAsync($"/api/seller/products/{productId}/publish", new { published });
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(await BuildErrorMessageAsync(response, "Ürün Akıllı Market'te yayınlanamadı."));
        return response.IsSuccessStatusCode;
    }

    public async Task<JsonDocument?> UpdateProductImageAsync(string commerceToken, string productId, string imageBase64, string mimeType)
    {
        SetBearerToken(commerceToken);
        var response = await http.PutAsJsonAsync($"/api/seller/products/{productId}/image", new { imageBase64, mimeType });
        if (!response.IsSuccessStatusCode) return null;
        var json = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json);
    }

    // Proxy: raw JSON pass-through for complex commerce responses
    public async Task<JsonDocument?> ProxyGetAsync(string commerceToken, string path)
    {
        SetBearerToken(commerceToken);
        var response = await http.GetAsync(path);
        if (!response.IsSuccessStatusCode) return null;
        var json = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json);
    }

    public async Task<CommerceProductDetailDto?> GetSellerProductDetailAsync(string commerceToken, string productId)
    {
        SetBearerToken(commerceToken);
        var response = await http.GetAsync($"/api/seller/products/{productId}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<CommerceProductDetailDto>(
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    public async Task<JsonDocument?> ProxyPutAsync(string commerceToken, string path, object body)
    {
        SetBearerToken(commerceToken);
        var response = await http.PutAsJsonAsync(path, body);
        if (!response.IsSuccessStatusCode) return null;
        var json = await response.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json);
    }

    public async Task<JsonDocument?> ProxyPostAsync(string commerceToken, string path, object body)
    {
        SetBearerToken(commerceToken);
        var response = await http.PostAsJsonAsync(path, body);
        if (!response.IsSuccessStatusCode) return null;
        if (response.Content.Headers.ContentLength == 0) return JsonDocument.Parse("{}");
        var json = await response.Content.ReadAsStringAsync();
        if (string.IsNullOrWhiteSpace(json)) return JsonDocument.Parse("{}");
        return JsonDocument.Parse(json);
    }

    public async Task<CommerceSellerProfileDto?> GetSellerProfileAsync(string commerceToken)
    {
        SetBearerToken(commerceToken);
        var response = await http.GetAsync("/api/seller/me");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<CommerceSellerProfileDto>();
    }

    public async Task<CommerceProductDetailDto?> GetProductDetailAsync(string productId)
    {
        var response = await http.GetAsync($"/api/products/{productId}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<CommerceProductDetailDto>(
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    public async Task<List<CommerceReviewDto>> GetProductReviewsAsync(string productId)
    {
        var response = await http.GetAsync($"/api/products/{productId}/reviews");
        if (!response.IsSuccessStatusCode) return [];
        return await response.Content.ReadFromJsonAsync<List<CommerceReviewDto>>(
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
    }
}

public record CommerceAuthResponse(string Token, string RefreshToken, CommerceUserDto User);
public record CommerceUserDto(Guid Id, string Email, string FullName, string Role);
public record CommerceSellerProfileDto(Guid Id, string StoreName, string OwnerName, int TrustScore, double StoreRating, int TotalReviewCount, bool FastShipping, int ReturnDays);
public record CommerceProductDetailDto(
    string Id, string Title, string Brand, string SellerName, string Category,
    decimal Price, decimal? OriginalPrice, double Rating, int ReviewCount, int Stock,
    List<string>? Images, string? ShortDescription, string? Description,
    Dictionary<string, string>? Features, List<string>? Badges, string? CargoText);

public record CommerceReviewDto(int Id, string AuthorName, int Rating, string Title, string Text, bool VerifiedPurchase);
