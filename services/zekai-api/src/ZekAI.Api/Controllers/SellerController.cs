using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize]
public class SellerController(SellerService seller) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── Store ──────────────────────────────────────────────────────────────

    [HttpGet("store")]
    public async Task<IActionResult> GetStore()
    {
        var conn = await seller.GetStoreAsync(UserId);
        return conn is null ? NotFound(new { message = "Bağlı mağaza yok." }) : Ok(conn);
    }

    [HttpPost("store/connect")]
    public async Task<IActionResult> ConnectStore([FromBody] StoreConnectRequest req)
    {
        try { return Ok(await seller.ConnectStoreAsync(UserId, req)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("store/sync")]
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

    // ── Social Media Content (proxied from commerce-api) ─────────────────

    [HttpPost("products/{productId}/social-content")]
    public async Task<IActionResult> GenerateSocialContent(string productId, [FromBody] object body)
    {
        try
        {
            var result = await seller.GenerateSocialContentAsync(UserId, productId, body);
            return result is null ? BadRequest(new { message = "İçerik üretilemedi." }) : Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ── Analytics (proxied from commerce-api) ─────────────────────────────

    [HttpGet("analytics/kpis")]
    public async Task<IActionResult> GetKpis()
    {
        try { return Ok(await seller.ProxyGetAsync(UserId, "/api/seller/analytics/kpis")); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

}
