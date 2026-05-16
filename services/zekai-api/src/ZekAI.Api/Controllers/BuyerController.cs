using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ZekAI.Application.DTOs;
using ZekAI.Infrastructure.Services;

namespace ZekAI.Api.Controllers;

[ApiController]
[Route("api/buyer")]
[Authorize]
public class BuyerController(BuyerService buyer) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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

    [HttpPost("projects/{id}/analyses/{analysisId:guid}")]
    public async Task<IActionResult> AddAnalysisToProject(string id, Guid analysisId)
    {
        try { return Ok(await buyer.AddAnalysisToProjectAsync(UserId, id, analysisId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("projects/{id}/analyses/{analysisId:guid}")]
    public async Task<IActionResult> RemoveAnalysisFromProject(string id, Guid analysisId)
    {
        try { return Ok(await buyer.RemoveAnalysisFromProjectAsync(UserId, id, analysisId)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
