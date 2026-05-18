using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/buyer")]
[Authorize]
public class KombinController : ControllerBase
{
    [HttpPost("kombin-analyze")]
    public async Task KombinAnalyze(
        [FromBody] KombinAnalyzeRequest req,
        [FromServices] IHttpClientFactory httpClientFactory)
    {
        if (req.Products is null || req.Products.Count == 0)
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsJsonAsync(new { message = "En az 1 ürün gereklidir." });
            return;
        }

        var aiPayload = new
        {
            goal = req.Goal,
            budget = req.Budget,
            use_cases = req.UseCases ?? new List<string>(),
            priorities = req.Priorities ?? new List<string>(),
            style = req.Style ?? new List<string>(),
            products = req.Products.Select(p => new
            {
                id = p.Id,
                title = p.Title,
                category = p.Category ?? "",
                price = p.Price,
                image_url = p.ImageUrl,
            }).ToList(),
        };

        var client = httpClientFactory.CreateClient("AiService");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/buyer/kombin-analyze")
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
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record KombinProductDto(
    string Id,
    string Title,
    string? Category,
    double Price,
    string? ImageUrl
);

public record KombinAnalyzeRequest(
    string Goal,
    double Budget,
    List<string>? UseCases,
    List<string>? Priorities,
    List<string>? Style,
    List<KombinProductDto> Products
);
