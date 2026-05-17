using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/buyer")]
[Authorize(Roles = "Buyer")]
public class BuyerController(BuyerService buyer, FavoriteService favorites) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Orders ─────────────────────────────────────────────────────────────

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
        => Ok(await buyer.GetOrdersAsync(UserId));

    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
    {
        try
        {
            var order = await buyer.CreateOrderAsync(UserId, req);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        try { return Ok(await buyer.GetOrderAsync(UserId, id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [HttpPost("orders/{id:guid}/mark-delivered")]
    public async Task<IActionResult> MarkDelivered(Guid id)
    {
        try { return Ok(await buyer.MarkDeliveredAsync(UserId, id)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Favorites ──────────────────────────────────────────────────────────

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites()
        => Ok(await favorites.GetFavoritesAsync(UserId));

    [HttpPost("favorites/{productId}")]
    public async Task<IActionResult> AddFavorite(string productId)
    {
        try
        {
            await favorites.AddFavoriteAsync(UserId, productId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("favorites/{productId}")]
    public async Task<IActionResult> RemoveFavorite(string productId)
    {
        await favorites.RemoveFavoriteAsync(UserId, productId);
        return NoContent();
    }
}
