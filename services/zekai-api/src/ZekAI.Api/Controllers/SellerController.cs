using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize]
public class SellerController(SellerService seller) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Store Connections ──────────────────────────────────────────────────

    [HttpGet("connections")]
    public async Task<IActionResult> GetConnections()
        => Ok(await seller.GetConnectionsAsync(UserId));

    [HttpPost("connections")]
    public async Task<IActionResult> ConnectStore([FromBody] StoreConnectRequest req)
    {
        try { return Ok(await seller.ConnectStoreAsync(UserId, req)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("connections/{connectionId:guid}")]
    public async Task<IActionResult> DisconnectStore(Guid connectionId)
    {
        try { await seller.DisconnectStoreAsync(UserId, connectionId); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("connections/sync")]
    public async Task<IActionResult> SyncStore()
    {
        try { await seller.SyncAsync(UserId); return Ok(new { message = "Senkronizasyon tamamlandı." }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Profile (proxied from commerce-api) ───────────────────────────────

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        try { return Ok(await seller.GetProfileAsync(UserId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Products (proxied from commerce-api) ──────────────────────────────

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        try { return Ok(await seller.GetProductsAsync(UserId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("products/{productId}")]
    public async Task<IActionResult> GetProduct(string productId)
    {
        try
        {
            var product = await seller.GetProductAsync(UserId, productId);
            return product is null ? NotFound() : Ok(product);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("products/{productId}")]
    public async Task<IActionResult> UpdateProduct(string productId, [FromBody] object payload)
    {
        try
        {
            var success = await seller.PublishUpdateAsync(UserId, productId, payload);
            return success ? Ok(new { message = "Ürün güncellendi." }) : BadRequest(new { message = "Güncelleme başarısız." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/publish-update")]
    public async Task<IActionResult> PublishUpdate(string productId, [FromBody] object payload)
    {
        try
        {
            var success = await seller.PublishUpdateAsync(UserId, productId, payload);
            return success ? Ok(new { message = "Ürün güncellendi." }) : BadRequest(new { message = "Güncelleme başarısız." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("products/{productId}/publish")]
    public async Task<IActionResult> PublishProduct(string productId, [FromBody] PublishRequest req)
    {
        try
        {
            var success = await seller.PublishProductAsync(UserId, productId, req.Published);
            return success
                ? Ok(new { message = req.Published ? "Ürün Akıllı Market'e yayınlandı." : "Ürün gizlendi." })
                : BadRequest(new { message = "İşlem başarısız." });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Social Media Content (proxied from commerce-api) ─────────────────

    [HttpPost("products/{productId}/social-content")]
    public async Task<IActionResult> GenerateSocialContent(string productId, [FromBody] object body)
    {
        try
        {
            var result = await seller.GenerateSocialContentAsync(UserId, productId, body);
            return result is null ? BadRequest(new { message = "İçerik üretilemedi." }) : Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── AI Content & Simulation ────────────────────────────────────────────

    [HttpPost("products/{productId}/ai-content")]
    public async Task<IActionResult> GenerateAiContent(
        string productId,
        [FromBody] AiContentRequest? req = null)
    {
        try
        {
            var result = await seller.GenerateAiContentAsync(UserId, productId, req?.SimulationInsight);
            return result is null ? StatusCode(503, new { message = "AI servisi yanıt vermedi." }) : Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/simulate")]
    public async Task<IActionResult> SimulateProduct(string productId)
    {
        try
        {
            var result = await seller.SimulateProductAsync(UserId, productId);
            return result is null ? StatusCode(503, new { message = "AI servisi yanıt vermedi." }) : Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/simulate-stream")]
    public async Task SimulateProductStream(
        string productId,
        [FromServices] IHttpClientFactory httpClientFactory)
    {
        SimulationProductPayload payload;
        try
        {
            payload = await seller.GetSimulationPayloadAsync(UserId, productId);
        }
        catch (KeyNotFoundException ex)
        {
            Response.StatusCode = 404;
            await Response.WriteAsJsonAsync(new { message = ex.Message });
            return;
        }
        catch (InvalidOperationException ex)
        {
            Response.StatusCode = 400;
            await Response.WriteAsJsonAsync(new { message = ex.Message });
            return;
        }

        var aiPayload = new
        {
            product_title = payload.ProductTitle,
            category = payload.Category,
            price = (double)payload.Price,
            description = payload.Description,
            features = payload.Features,
        };

        var client = httpClientFactory.CreateClient("AiService");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/seller/simulate-stream")
        {
            Content = new StringContent(JsonSerializer.Serialize(aiPayload), Encoding.UTF8, "application/json"),
        };
        request.Headers.Accept.ParseAdd("text/event-stream");

        using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, HttpContext.RequestAborted);
        if (!response.IsSuccessStatusCode)
        {
            Response.StatusCode = (int)response.StatusCode;
            await Response.WriteAsJsonAsync(new { message = "AI servisi simülasyon başlatamadı." });
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";
        await using var stream = await response.Content.ReadAsStreamAsync(HttpContext.RequestAborted);
        await stream.CopyToAsync(Response.Body, HttpContext.RequestAborted);
    }

    [HttpPost("products/{productId}/ai-image")]
    public async Task<IActionResult> GenerateProductImage(string productId)
    {
        try
        {
            var result = await seller.GenerateProductImageAsync(UserId, productId);
            return result is null ? StatusCode(503, new { message = "AI servisi yanıt vermedi." }) : Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/ai-images")]
    public async Task<IActionResult> GenerateProductImages(string productId)
    {
        try
        {
            var result = await seller.GenerateProductImagesAsync(UserId, productId);
            return result is null ? StatusCode(503, new { message = "AI servisi yanıt vermedi." }) : Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("products/{productId}/image")]
    public async Task<IActionResult> UpdateProductImage(string productId, [FromBody] UpdateProductImageRequest req)
    {
        try
        {
            var result = await seller.UpdateProductImageAsync(UserId, productId, req.ImageBase64, req.MimeType);
            return result is null ? BadRequest(new { message = "Görsel güncellenemedi." }) : Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Analytics (proxied from commerce-api) ─────────────────────────────

    [HttpGet("products/{productId}/bundles")]
    public async Task<IActionResult> GetProductBundles(string productId)
    {
        try { return Ok(await seller.GetProductBundlesAsync(UserId, productId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/bundle-recommendations")]
    public async Task<IActionResult> GenerateBundleRecommendations(string productId)
    {
        try { return Ok(await seller.GenerateBundleRecommendationsAsync(UserId, productId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/bundles")]
    public async Task<IActionResult> CreateProductBundle(string productId, [FromBody] object body)
    {
        try { return Ok(await seller.CreateProductBundleAsync(UserId, productId, body)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("products/{productId}/bundles/{bundleId:guid}")]
    public async Task<IActionResult> UpdateProductBundle(string productId, Guid bundleId, [FromBody] object body)
    {
        try { return Ok(await seller.UpdateProductBundleAsync(UserId, productId, bundleId, body)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/bundles/{bundleId:guid}/publish")]
    public async Task<IActionResult> PublishProductBundle(string productId, Guid bundleId, [FromBody] object body)
    {
        try { return Ok(await seller.PublishProductBundleAsync(UserId, productId, bundleId, body)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/bundles/{bundleId:guid}/archive")]
    public async Task<IActionResult> ArchiveProductBundle(string productId, Guid bundleId)
    {
        try { return Ok(await seller.ArchiveProductBundleAsync(UserId, productId, bundleId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("analytics/kpis")]
    public async Task<IActionResult> GetKpis()
    {
        try { return Ok(await seller.ProxyGetAsync(UserId, "/api/seller/analytics/kpis")); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

}
