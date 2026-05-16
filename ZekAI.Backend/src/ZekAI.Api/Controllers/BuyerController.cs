using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/buyer")]
[Authorize(Roles = "Buyer")]
public class BuyerController(BuyerService buyer) : ControllerBase
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

    // ── Returns ────────────────────────────────────────────────────────────

    [HttpGet("returns")]
    public async Task<IActionResult> GetReturns()
        => Ok(await buyer.GetReturnsAsync(UserId));

    [HttpPost("orders/{id:guid}/return")]
    public async Task<IActionResult> CreateReturn(Guid id, [FromBody] CreateReturnRequest req)
    {
        try { return Ok(await buyer.CreateReturnAsync(UserId, id, req)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("returns/{id:guid}")]
    public async Task<IActionResult> GetReturn(Guid id)
    {
        try { return Ok(await buyer.GetReturnAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ── Saved Analyses ─────────────────────────────────────────────────────

    [HttpGet("analyses")]
    public async Task<IActionResult> GetAnalyses()
        => Ok(await buyer.GetSavedAnalysesAsync(UserId));

    [HttpPost("analyses")]
    public async Task<IActionResult> SaveAnalysis([FromBody] SaveAnalysisRequest req)
    {
        var result = await buyer.SaveAnalysisAsync(UserId, req);
        return Ok(result);
    }

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

    // Shopping Projects

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects()
        => Ok(await buyer.GetProjectsAsync(UserId));

    [HttpPost("projects")]
    public async Task<IActionResult> CreateProject([FromBody] CreateShoppingProjectRequest req)
        => Ok(await buyer.CreateProjectAsync(UserId, req));

    [HttpPut("projects/{id}")]
    public async Task<IActionResult> UpdateProject(string id, [FromBody] UpdateShoppingProjectRequest req)
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

    [HttpPost("projects/{id}/analyses/{analysisId}")]
    public async Task<IActionResult> AddAnalysisToProject(string id, string analysisId)
    {
        try { return Ok(await buyer.AddAnalysisToProjectAsync(UserId, id, analysisId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("projects/{id}/analyses/{analysisId}")]
    public async Task<IActionResult> RemoveAnalysisFromProject(string id, string analysisId)
    {
        try { return Ok(await buyer.RemoveAnalysisFromProjectAsync(UserId, id, analysisId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
