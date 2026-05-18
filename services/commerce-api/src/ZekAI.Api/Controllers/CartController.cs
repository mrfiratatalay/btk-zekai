using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/buyer/cart")]
[Authorize(Roles = "Buyer")]
public class CartController(CartService cart) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetCart()
        => Ok(await cart.GetCartAsync(UserId));

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartRequest req)
    {
        try { return Ok(await cart.AddItemAsync(UserId, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("bundles/{bundleId:guid}")]
    public async Task<IActionResult> AddBundle(Guid bundleId, [FromBody] AddBundleToCartRequest req)
    {
        try { return Ok(await cart.AddBundleAsync(UserId, bundleId, req.Quantity)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("items/{itemId:int}")]
    public async Task<IActionResult> UpdateItem(int itemId, [FromBody] UpdateCartItemRequest req)
    {
        try { return Ok(await cart.UpdateItemAsync(UserId, itemId, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("bundles/{bundleId:guid}")]
    public async Task<IActionResult> UpdateBundle(Guid bundleId, [FromBody] UpdateCartBundleRequest req)
    {
        try { return Ok(await cart.UpdateBundleAsync(UserId, bundleId, req.Quantity)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("bundles/{bundleId:guid}")]
    public async Task<IActionResult> RemoveBundle(Guid bundleId)
    {
        try
        {
            await cart.RemoveBundleAsync(UserId, bundleId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(int itemId)
    {
        try
        {
            await cart.RemoveItemAsync(UserId, itemId);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        await cart.ClearCartAsync(UserId);
        return NoContent();
    }
}
