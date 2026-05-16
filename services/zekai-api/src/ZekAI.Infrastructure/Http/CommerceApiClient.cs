using System.Net.Http.Headers;
using System.Net.Http.Json;
using ZekAI.Application.DTOs;

namespace ZekAI.Infrastructure.Http;

public class CommerceApiClient(HttpClient http)
{
    public void SetBearerToken(string token)
        => http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

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
        return response.IsSuccessStatusCode;
    }
}

public record CommerceAuthResponse(string Token, string RefreshToken, Guid UserId, string Email, string FullName, string Role);
