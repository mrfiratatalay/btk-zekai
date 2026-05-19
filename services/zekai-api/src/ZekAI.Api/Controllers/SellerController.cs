using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs;
using ZekAI.Infrastructure.Http;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize]
public class SellerController(SellerService seller) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private IActionResult AiServiceError(AiServiceException ex)
    {
        var message = ex.ResponseBody;
        try
        {
            using var doc = JsonDocument.Parse(ex.ResponseBody);
            if (doc.RootElement.TryGetProperty("detail", out var detail))
                message = detail.GetString() ?? message;
            else if (doc.RootElement.TryGetProperty("message", out var msg))
                message = msg.GetString() ?? message;
        }
        catch
        {
            // Keep raw body when AI service returns plain text.
        }

        return StatusCode(ex.StatusCode, new { message, aiServiceStatus = ex.StatusCode });
    }

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
        catch (AiServiceException ex) { return AiServiceError(ex); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
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
        catch (AiServiceException ex) { return AiServiceError(ex); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/seo")]
    public async Task<IActionResult> GenerateSeo(string productId)
    {
        try
        {
            var result = await seller.GenerateSeoAsync(UserId, productId);
            return result is null ? StatusCode(503, new { message = "SEO analizi üretilemedi." }) : Ok(result);
        }
        catch (AiServiceException ex) { return AiServiceError(ex); }
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
        catch (AiServiceException ex) { return AiServiceError(ex); }
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
            reviews = payload.Reviews.Take(12).Select(r => new
            {
                author_name = r.AuthorName,
                rating = r.Rating,
                title = r.Title,
                text = r.Text,
                verified_purchase = r.VerifiedPurchase,
            }),
        };

        var cachedArtifact = await seller.GetCachedSimulationArtifactAsync(UserId, productId);
        if (cachedArtifact is not null)
        {
            Response.ContentType = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";
            await WriteSseAsync(new { type = "step", message = "Kayıtlı müşteri simülasyonu kullanılıyor." });
            if (cachedArtifact.Payload.TryGetProperty("personas", out var cachedPersonas) &&
                cachedPersonas.ValueKind == JsonValueKind.Array)
            {
                foreach (var persona in cachedPersonas.EnumerateArray())
                    await WriteSseAsync(new { type = "persona", persona });
            }
            await WriteSseAsync(new { type = "done", artifactId = cachedArtifact.Id, _cached = true });
            return;
        }

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
            var body = await response.Content.ReadAsStringAsync(HttpContext.RequestAborted);
            await Response.WriteAsJsonAsync(new { message = body, aiServiceStatus = (int)response.StatusCode });
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";
        await using var stream = await response.Content.ReadAsStreamAsync(HttpContext.RequestAborted);
        using var reader = new StreamReader(stream);
        var personas = new List<JsonElement>();
        var completed = false;

        while (!HttpContext.RequestAborted.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(HttpContext.RequestAborted);
            if (line is null) break;

            await Response.WriteAsync(line + "\n", HttpContext.RequestAborted);
            await Response.Body.FlushAsync(HttpContext.RequestAborted);

            if (!line.StartsWith("data:", StringComparison.OrdinalIgnoreCase)) continue;
            var json = line["data:".Length..].Trim();
            if (string.IsNullOrWhiteSpace(json)) continue;

            try
            {
                using var eventDoc = JsonDocument.Parse(json);
                var root = eventDoc.RootElement;
                if (!root.TryGetProperty("type", out var typeEl)) continue;
                var type = typeEl.GetString();
                if (type == "persona" && root.TryGetProperty("persona", out var personaEl))
                    personas.Add(personaEl.Clone());
                else if (type == "done")
                    completed = true;
            }
            catch
            {
                // Stream still reaches the UI; malformed lines are only skipped for persistence.
            }
        }

        if (completed && personas.Count > 0 && !HttpContext.RequestAborted.IsCancellationRequested)
        {
            await seller.SaveSimulationArtifactAsync(UserId, productId, new { personas, _mock = false });
        }
    }

    [HttpPost("products/{productId}/ai-image")]
    public async Task<IActionResult> GenerateProductImage(
        string productId,
        [FromBody] AiImageRequest? req = null)
    {
        try
        {
            var style = string.IsNullOrWhiteSpace(req?.Style) ? "studio" : req.Style;
            var result = await seller.GenerateProductImageAsync(UserId, productId, style);
            return result is null ? StatusCode(503, new { message = "AI servisi yanıt vermedi." }) : Ok(result);
        }
        catch (AiServiceException ex) { return AiServiceError(ex); }
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
        catch (AiServiceException ex) { return AiServiceError(ex); }
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

    // ── Product Drafts (AI çıktısı DB'de saklanır → ücretsiz tekrar yayın) ──

    [HttpGet("products/{productId}/drafts")]
    public async Task<IActionResult> GetProductDrafts(string productId)
    {
        try { return Ok(await seller.GetProductDraftsAsync(UserId, productId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("drafts")]
    public async Task<IActionResult> GetAllDrafts()
        => Ok(await seller.GetAllDraftsAsync(UserId));

    [HttpGet("ai-artifacts")]
    public async Task<IActionResult> GetAllAiArtifacts()
        => Ok(await seller.GetAllAiArtifactsAsync(UserId));

    [HttpGet("products/{productId}/ai-artifacts")]
    public async Task<IActionResult> GetProductAiArtifacts(string productId)
        => Ok(await seller.GetProductAiArtifactsAsync(UserId, productId));

    [HttpDelete("ai-artifacts/{artifactId:guid}")]
    public async Task<IActionResult> DeleteAiArtifact(Guid artifactId)
    {
        var ok = await seller.DeleteAiArtifactAsync(UserId, artifactId);
        return ok ? Ok(new { message = "AI çıktısı arşivlendi." }) : NotFound(new { message = "AI çıktısı bulunamadı." });
    }

    [HttpPost("ai-artifacts/{artifactId:guid}/restore")]
    public async Task<IActionResult> RestoreAiArtifact(Guid artifactId)
    {
        var ok = await seller.RestoreAiArtifactAsync(UserId, artifactId);
        return ok ? Ok(new { message = "AI çıktısı geri yüklendi." }) : NotFound(new { message = "AI çıktısı bulunamadı." });
    }

    [HttpDelete("drafts/{draftId:guid}")]
    public async Task<IActionResult> DeleteDraft(Guid draftId)
    {
        var ok = await seller.DeleteDraftAsync(UserId, draftId);
        return ok ? Ok(new { message = "Taslak arşivlendi." }) : NotFound(new { message = "Taslak bulunamadı." });
    }

    [HttpPost("drafts/{draftId:guid}/restore")]
    public async Task<IActionResult> RestoreDraft(Guid draftId)
    {
        var ok = await seller.RestoreDraftAsync(UserId, draftId);
        return ok ? Ok(new { message = "Taslak geri yüklendi." }) : NotFound(new { message = "Taslak bulunamadı." });
    }

    [HttpPost("drafts/{draftId:guid}/publish")]
    public async Task<IActionResult> PublishDraft(Guid draftId)
    {
        try
        {
            var ok = await seller.PublishDraftAsync(UserId, draftId);
            return ok ? Ok(new { message = "Taslak yayınlandı." }) : BadRequest(new { message = "Yayınlama başarısız." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Social Media Drafts (markete gitmez; varyasyon saklama) ───────────

    [HttpGet("products/{productId}/social-drafts")]
    public async Task<IActionResult> GetProductSocialDrafts(string productId)
    {
        try { return Ok(await seller.GetProductSocialDraftsAsync(UserId, productId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/social-drafts")]
    public async Task<IActionResult> SaveSocialDraft(string productId, [FromBody] SaveSocialDraftRequest req)
    {
        try { return Ok(await seller.SaveSocialDraftAsync(UserId, productId, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("social-drafts")]
    public async Task<IActionResult> GetAllSocialDrafts()
        => Ok(await seller.GetAllSocialDraftsAsync(UserId));

    [HttpDelete("social-drafts/{draftId:guid}")]
    public async Task<IActionResult> DeleteSocialDraft(Guid draftId)
    {
        var ok = await seller.DeleteSocialDraftAsync(UserId, draftId);
        return ok ? Ok(new { message = "Taslak arşivlendi." }) : NotFound(new { message = "Taslak bulunamadı." });
    }

    [HttpPost("social-drafts/{draftId:guid}/restore")]
    public async Task<IActionResult> RestoreSocialDraft(Guid draftId)
    {
        var ok = await seller.RestoreSocialDraftAsync(UserId, draftId);
        return ok ? Ok(new { message = "Taslak geri yüklendi." }) : NotFound(new { message = "Taslak bulunamadı." });
    }

    [HttpPost("social-drafts/{draftId:guid}/activate")]
    public async Task<IActionResult> ActivateSocialDraft(Guid draftId)
    {
        var ok = await seller.SetActiveSocialDraftAsync(UserId, draftId);
        return ok ? Ok(new { message = "Aktif içerik güncellendi." }) : NotFound(new { message = "Taslak bulunamadı." });
    }

    // ── Analytics (proxied from commerce-api) ─────────────────────────────

    [HttpGet("products/{productId}/bundles")]
    public async Task<IActionResult> GetProductBundles(string productId)
    {
        try { return Ok(await seller.GetProductBundlesAsync(UserId, productId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/bundle-recommendations")]
    public async Task<IActionResult> GenerateBundleRecommendations(
        string productId,
        [FromBody] BundleRecommendationRequest? req = null)
    {
        try { return Ok(await seller.GenerateBundleRecommendationsAsync(UserId, productId, req?.Force ?? false)); }
        catch (AiServiceException ex) { return AiServiceError(ex); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
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

    private async Task WriteSseAsync(object payload)
    {
        await Response.WriteAsync($"data: {JsonSerializer.Serialize(payload)}\n\n", HttpContext.RequestAborted);
        await Response.Body.FlushAsync(HttpContext.RequestAborted);
    }

    // ── Customer Voice ─────────────────────────────────────────────────────

    [HttpGet("products/{productId}/customer-voice")]
    public async Task<IActionResult> GetCustomerVoice(string productId)
    {
        try { return Ok(await seller.GetCustomerVoiceAsync(UserId, productId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("products/{productId}/customer-voice/generate")]
    public async Task<IActionResult> GenerateCustomerVoice(string productId)
    {
        try { return Ok(await seller.GenerateCustomerVoiceAsync(UserId, productId)); }
        catch (AiServiceException ex) { return AiServiceError(ex); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("customer-voice/reply-drafts/{draftId:int}")]
    public async Task<IActionResult> UpdateReplyDraft(int draftId, [FromBody] UpdateReplyDraftRequest req)
    {
        try { return Ok(await seller.UpdateReplyDraftAsync(UserId, draftId, req.SuggestedReply)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("customer-voice/reply-drafts/{draftId:int}/publish")]
    public async Task<IActionResult> PublishReplyDraft(int draftId)
    {
        try { return Ok(await seller.PublishReviewReplyDraftAsync(UserId, draftId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("customer-voice/faq-drafts/{draftId:int}")]
    public async Task<IActionResult> UpdateFaqDraft(int draftId, [FromBody] UpdateFaqDraftRequest req)
    {
        try { return Ok(await seller.UpdateFaqDraftAsync(UserId, draftId, req.Question, req.Answer)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("customer-voice/faq-drafts/{draftId:int}/publish")]
    public async Task<IActionResult> PublishFaqDraft(int draftId, [FromBody] PublishFaqDraftRequest req)
    {
        try { return Ok(await seller.PublishFaqDraftAsync(UserId, draftId, req.SortOrder)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
