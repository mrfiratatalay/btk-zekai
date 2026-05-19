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
[Route("api/buyer")]
[Authorize]
public class BuyerController(BuyerService buyer, CommerceApiClient commerce) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try { return Ok(await buyer.GetProfileAsync(UserId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateBuyerProfileRequest req)
    {
        try { return Ok(await buyer.UpdateProfileAsync(UserId, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("kombins")]
    public async Task<IActionResult> GetKombins()
        => Ok(await buyer.GetKombinsAsync(UserId));

    [HttpPost("kombins")]
    public async Task<IActionResult> SaveKombin([FromBody] SaveKombinRequest req)
        => Ok(await buyer.SaveKombinAsync(UserId, req));

    [HttpDelete("kombins/{id}")]
    public async Task<IActionResult> DeleteKombin(string id)
    {
        try { await buyer.DeleteKombinAsync(UserId, id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("product-preview")]
    public async Task<IActionResult> ProductPreview([FromBody] ProductPreviewRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.ProductUrl))
            return BadRequest(new { message = "productUrl zorunludur." });
        var product = await buyer.GetProductPreviewAsync(req.ProductUrl);
        return product is null ? NotFound(new { message = "Ürün bulunamadı." }) : Ok(product);
    }

    [HttpGet("analyses")]
    public async Task<IActionResult> GetAnalyses()
        => Ok(await buyer.GetAnalysesAsync(UserId));

    [HttpPost("analyses")]
    public async Task<IActionResult> SaveAnalysis([FromBody] SaveAnalysisRequest req)
        => Ok(await buyer.SaveAnalysisAsync(UserId, req));

    [HttpPut("analyses/{id:guid}")]
    public async Task<IActionResult> UpdateAnalysis(Guid id, [FromBody] UpdateAnalysisRequest req)
    {
        try { return Ok(await buyer.UpdateAnalysisAsync(UserId, id, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("analyses/{id:guid}")]
    public async Task<IActionResult> DeleteAnalysis(Guid id)
    {
        try { await buyer.DeleteAnalysisAsync(UserId, id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects()
        => Ok(await buyer.GetProjectsAsync(UserId));

    [HttpPost("projects")]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest req)
        => Ok(await buyer.CreateProjectAsync(UserId, req));

    [HttpPut("projects/{id}")]
    public async Task<IActionResult> UpdateProject(string id, [FromBody] UpdateProjectRequest req)
    {
        try { return Ok(await buyer.UpdateProjectAsync(UserId, id, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("projects/{id}")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        try { await buyer.DeleteProjectAsync(UserId, id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("projects/{id}/analyses/{analysisExternalId}")]
    public async Task<IActionResult> AddAnalysisToProject(string id, string analysisExternalId)
    {
        try { return Ok(await buyer.AddAnalysisToProjectAsync(UserId, id, analysisExternalId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("projects/{id}/analyses/{analysisExternalId}")]
    public async Task<IActionResult> RemoveAnalysisFromProject(string id, string analysisExternalId)
    {
        try { return Ok(await buyer.RemoveAnalysisFromProjectAsync(UserId, id, analysisExternalId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // ── AI Agent Buyer Analysis (SSE stream) ───────────────────────────────────

    [HttpPost("analyze")]
    public async Task AnalyzeBuyer(
        [FromBody] BuyerAnalyzeRequest req,
        [FromServices] IHttpClientFactory httpClientFactory)
    {
        if (string.IsNullOrWhiteSpace(req.ProductId) || string.IsNullOrWhiteSpace(req.BuyerNeed))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsJsonAsync(new { message = "productId ve buyerNeed zorunludur." });
            return;
        }

        // Fetch product details from commerce-api
        var product = await commerce.GetProductDetailAsync(req.ProductId);
        if (product is null)
        {
            Response.StatusCode = StatusCodes.Status404NotFound;
            await Response.WriteAsJsonAsync(new { message = "Ürün bulunamadı." });
            return;
        }

        var cached = await buyer.GetAnalysisCacheAsync(UserId, product, req.BuyerNeed);
        if (cached is not null)
        {
            Response.ContentType = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";
            await WriteSseAsync("cache", "Önceki tamamlanmış analiz bulundu.", HttpContext.RequestAborted);
            await WriteSseAsync("buyer_advisor", "Cache sonucu kullanılıyor.", "advisor_raporu", new { cached = true }, HttpContext.RequestAborted);
            await WriteSseAsync("decision", cached.ResultJson, "final_rapor", MergeCachedFinalReport(cached.ResultJson), HttpContext.RequestAborted);
            return;
        }

        // Fetch reviews only when a fresh AI analysis is needed.
        var reviews = await commerce.GetProductReviewsAsync(req.ProductId);

        // Build ai-service payload
        var aiPayload = new
        {
            product_id = product.Id,
            product_title = product.Title,
            product_category = product.Category,
            product_price = (double)product.Price,
            product_description = product.Description,
            product_features = product.Features?.Values.ToList() ?? new List<string>(),
            product_image_url = product.Images?.FirstOrDefault(),
            product_rating = product.Rating,
            product_review_count = product.ReviewCount,
            buyer_need = req.BuyerNeed,
            reviews = reviews.Take(25).Select(r => new
            {
                id = r.Id.ToString(),
                rating = r.Rating,
                comment = r.Text,
                userName = r.AuthorName,
            }).ToList(),
        };

        var client = httpClientFactory.CreateClient("AiService");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/buyer/analyze")
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

        string? finalReportJson = null;
        bool usedSearch = false;
        string model = "";

        await using var stream = await response.Content.ReadAsStreamAsync(HttpContext.RequestAborted);
        using var reader = new StreamReader(stream, Encoding.UTF8);
        while (!HttpContext.RequestAborted.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(HttpContext.RequestAborted);
            if (line is null) break;

            await Response.WriteAsync(line + "\n", HttpContext.RequestAborted);
            if (line.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                TryCaptureFinalReport(line, ref finalReportJson, ref usedSearch, ref model);
            }

            if (line.Length == 0)
            {
                await Response.Body.FlushAsync(HttpContext.RequestAborted);
            }
        }

        if (!string.IsNullOrWhiteSpace(finalReportJson) && !HttpContext.RequestAborted.IsCancellationRequested)
        {
            await buyer.SaveAnalysisCacheAsync(UserId, product, req.BuyerNeed, finalReportJson, usedSearch, model);
        }
    }

    private async Task WriteSseAsync(
        string author,
        string text,
        CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Serialize(new
        {
            author,
            content = new { parts = new[] { new { text } } }
        });
        await Response.WriteAsync($"data: {payload}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private async Task WriteSseAsync(
        string author,
        string text,
        string stateKey,
        object stateValue,
        CancellationToken cancellationToken)
    {
        var payload = JsonSerializer.Serialize(new
        {
            author,
            content = new { parts = new[] { new { text } } },
            actions = new { state_delta = new Dictionary<string, object> { [stateKey] = stateValue } }
        });
        await Response.WriteAsync($"data: {payload}\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private static object MergeCachedFinalReport(string resultJson)
    {
        using var doc = JsonDocument.Parse(resultJson);
        var dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(doc.RootElement.GetRawText()) ?? [];
        dict["cached"] = true;
        return dict;
    }

    private static void TryCaptureFinalReport(
        string line,
        ref string? finalReportJson,
        ref bool usedSearch,
        ref string model)
    {
        try
        {
            var json = line["data:".Length..].Trim();
            if (string.IsNullOrWhiteSpace(json)) return;

            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("actions", out var actions)) return;
            if (!actions.TryGetProperty("state_delta", out var delta)) return;
            if (!delta.TryGetProperty("final_rapor", out var report)) return;

            finalReportJson = report.GetRawText();
            if (report.TryGetProperty("used_search", out var usedSearchProp))
                usedSearch = usedSearchProp.ValueKind == JsonValueKind.True;
            if (report.TryGetProperty("model", out var modelProp))
                model = modelProp.GetString() ?? "";
        }
        catch
        {
            // Non-final or malformed SSE data should not break the stream proxy.
        }
    }

    [HttpPost("agent/sessions/{sessionId}")]
    public async Task<IActionResult> EnsureAgentSession(
        string sessionId,
        [FromBody] EnsureAgentSessionRequest req,
        [FromServices] IHttpClientFactory httpClientFactory)
    {
        if (string.IsNullOrWhiteSpace(req.AppName) || string.IsNullOrWhiteSpace(req.UserId))
            return BadRequest(new { message = "appName ve userId zorunludur." });

        var client = httpClientFactory.CreateClient("AiService");
        var path = $"/apps/{Uri.EscapeDataString(req.AppName)}/users/{Uri.EscapeDataString(req.UserId)}/sessions/{Uri.EscapeDataString(sessionId)}";
        using var existing = await client.GetAsync(path);
        if (existing.IsSuccessStatusCode)
            return Ok(new { status = "ready" });

        if (existing.StatusCode != System.Net.HttpStatusCode.NotFound)
            return StatusCode((int)existing.StatusCode, new { message = "AI session kontrolu basarisiz." });

        using var created = await client.PostAsync(
            path,
            new StringContent("{}", Encoding.UTF8, "application/json"));

        if (!created.IsSuccessStatusCode)
            return StatusCode((int)created.StatusCode, new { message = "AI session olusturulamadi." });

        return Ok(new { status = "created" });
    }

    [HttpPost("agent/run-sse")]
    public async Task RunAgentSse(
        [FromBody] AgentRunRequest req,
        [FromServices] IHttpClientFactory httpClientFactory)
    {
        if (string.IsNullOrWhiteSpace(req.App_Name) ||
            string.IsNullOrWhiteSpace(req.User_Id) ||
            string.IsNullOrWhiteSpace(req.Session_Id))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsJsonAsync(new { message = "app_name, user_id ve session_id zorunludur." });
            return;
        }

        var client = httpClientFactory.CreateClient("AiService");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/run_sse")
        {
            Content = new StringContent(JsonSerializer.Serialize(req), Encoding.UTF8, "application/json"),
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
        await using var stream = await response.Content.ReadAsStreamAsync(HttpContext.RequestAborted);
        await stream.CopyToAsync(Response.Body, HttpContext.RequestAborted);
    }
}
