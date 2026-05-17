using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs.Seller;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize(Roles = "Seller")]
public class SellerController(SellerService seller) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("apikey")]
    public async Task<IActionResult> GetApiKey()
    {
        try { return Ok(new { apiKey = await seller.GetApiKeyAsync(UserId) }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost("apikey/regenerate")]
    public async Task<IActionResult> RegenerateApiKey()
    {
        try { return Ok(new { apiKey = await seller.RegenerateApiKeyAsync(UserId) }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        try { return Ok(await seller.GetProfileAsync(UserId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // ── Products ───────────────────────────────────────────────────────────

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
        => Ok(await seller.GetProductsAsync(UserId));

    [HttpGet("products/{productId}")]
    public async Task<IActionResult> GetProduct(string productId)
    {
        var p = await seller.GetProductAsync(UserId, productId);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest req)
    {
        try
        {
            var product = await seller.CreateProductAsync(UserId, req);
            return CreatedAtAction(nameof(GetProduct), new { productId = product.Id }, product);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("products/{productId}")]
    public async Task<IActionResult> UpdateProduct(string productId, [FromBody] UpdateProductContentRequest req)
    {
        try
        {
            await seller.UpdateProductContentAsync(UserId, productId, req);
            return Ok(new { message = "Ürün güncellendi." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("products/{productId}")]
    public async Task<IActionResult> DeleteProduct(string productId)
    {
        try
        {
            await seller.DeleteProductAsync(UserId, productId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("products/{productId}/publish")]
    public async Task<IActionResult> PublishProduct(string productId, [FromBody] PublishProductRequest req)
    {
        try
        {
            await seller.SetProductPublishedAsync(UserId, productId, req.Published);
            return Ok(new { message = req.Published ? "Ürün yayınlandı." : "Ürün gizlendi." });
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // ── Social Media Content ───────────────────────────────────────────────

    [HttpPost("products/{productId}/social-content")]
    public async Task<IActionResult> GenerateSocialContent(string productId, [FromBody] GenerateSocialContentRequest req)
    {
        try
        {
            var result = await seller.GenerateSocialContentAsync(UserId, productId, req.Tone);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

}
