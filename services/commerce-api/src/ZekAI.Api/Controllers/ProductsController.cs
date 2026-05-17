using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs.Products;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] string? search)
        => Ok(await products.GetAllAsync(category, search));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var product = await products.GetByIdAsync(id);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("{id}/reviews")]
    public async Task<IActionResult> GetReviews(string id)
        => Ok(await products.GetReviewsAsync(id));

    [HttpPost("{id}/reviews")]
    [Authorize(Roles = "Buyer")]
    public async Task<IActionResult> CreateReview(string id, [FromBody] CreateProductReviewRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            var review = await products.CreateReviewAsync(id, userId, req);
            return CreatedAtAction(nameof(GetReviews), new { id }, review);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpGet("{id}/price-history")]
    public async Task<IActionResult> GetPriceHistory(string id)
        => Ok(await products.GetPriceHistoryAsync(id));

    [HttpGet("from-url")]
    public async Task<IActionResult> GetByUrl([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest(new { message = "url parametresi zorunludur." });

        var product = await products.GetByUrlAsync(url);
        return product is null ? NotFound(new { message = "Ürün bulunamadı." }) : Ok(product);
    }
}

[ApiController]
[Route("api/categories")]
public class CategoriesController(ProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await products.GetCategoriesAsync());
}
