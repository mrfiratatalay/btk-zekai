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

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        try { return Ok(await seller.GetProfileAsync(UserId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("store")]
    public async Task<IActionResult> GetStore()
    {
        var conn = await seller.GetStoreAsync(UserId);
        return conn is null ? NotFound(new { message = "Bağlı mağaza yok." }) : Ok(conn);
    }

    [HttpPost("store/connect")]
    public async Task<IActionResult> ConnectStore([FromBody] ConnectStoreRequest req)
        => Ok(await seller.ConnectStoreAsync(UserId, req));

    [HttpPost("store/sync")]
    public async Task<IActionResult> SyncStore()
    {
        try { return Ok(await seller.SyncStoreAsync(UserId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
        => Ok(await seller.GetProductsAsync(UserId));

    [HttpGet("products/{productId}")]
    public async Task<IActionResult> GetProduct(string productId)
    {
        var p = await seller.GetProductAsync(UserId, productId);
        return p is null ? NotFound() : Ok(p);
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

    [HttpGet("analytics/kpis")]
    public async Task<IActionResult> GetKpis()
        => Ok(await seller.GetKpisAsync(UserId));

    [HttpGet("analytics/return-reasons")]
    public async Task<IActionResult> GetReturnReasons()
        => Ok(await seller.GetReturnReasonsAsync(UserId));

    [HttpGet("returns")]
    public async Task<IActionResult> GetReturns()
        => Ok(await seller.GetReturnsAsync(UserId));

    [HttpPut("returns/{id:guid}/respond")]
    public async Task<IActionResult> RespondToReturn(Guid id, [FromBody] SellerRespondReturnRequest req)
    {
        try { return Ok(await seller.RespondToReturnAsync(UserId, id, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
