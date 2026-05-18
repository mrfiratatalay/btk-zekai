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

        // Fetch reviews
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
        await using var stream = await response.Content.ReadAsStreamAsync(HttpContext.RequestAborted);
        await stream.CopyToAsync(Response.Body, HttpContext.RequestAborted);
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
