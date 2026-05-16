using Microsoft.AspNetCore.Mvc;
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

    [HttpGet("{id}/price-history")]
    public async Task<IActionResult> GetPriceHistory(string id)
        => Ok(await products.GetPriceHistoryAsync(id));
}

[ApiController]
[Route("api/categories")]
public class CategoriesController(ProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await products.GetCategoriesAsync());
}
