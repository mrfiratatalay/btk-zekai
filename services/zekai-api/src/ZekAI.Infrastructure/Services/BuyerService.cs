using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;
using ZekAI.Infrastructure.Http;

namespace ZekAI.Infrastructure.Services;

public class BuyerService(ZekaiDbContext db, CommerceApiClient commerce)
{
    public async Task<ProductPreviewResponse?> GetProductPreviewAsync(string productUrl)
        => await commerce.GetProductByUrlAsync(productUrl);

    public async Task<List<AnalysisDto>> GetAnalysesAsync(Guid userId)
    {
        return await db.Analyses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.SavedAt)
            .Select(a => Map(a))
            .ToListAsync();
    }

    public async Task<AnalysisDto> SaveAnalysisAsync(Guid userId, SaveAnalysisRequest req)
    {
        var existing = await db.Analyses
            .FirstOrDefaultAsync(a => a.UserId == userId && a.ExternalId == req.ExternalId);

        if (existing is not null)
        {
            existing.ProductTitle = req.ProductTitle;
            existing.ProductImage = req.ProductImage;
            existing.ProductPrice = req.ProductPrice;
            existing.SellerName = req.SellerName;
            existing.UserNeedText = req.UserNeedText;
            existing.OverallRiskPercent = req.OverallRiskPercent;
            existing.RecommendationLevel = req.RecommendationLevel;
            existing.ScoresJson = req.ScoresJson;
            await db.SaveChangesAsync();
            return Map(existing);
        }

        var analysis = new BuyerAnalysis
        {
            UserId = userId,
            ExternalId = req.ExternalId,
            ProductId = req.ProductId,
            ProductTitle = req.ProductTitle,
            ProductImage = req.ProductImage,
            ProductPrice = req.ProductPrice,
            SellerName = req.SellerName,
            UserNeedText = req.UserNeedText,
            OverallRiskPercent = req.OverallRiskPercent,
            RecommendationLevel = req.RecommendationLevel,
            ScoresJson = req.ScoresJson,
        };

        db.Analyses.Add(analysis);
        await db.SaveChangesAsync();
        return Map(analysis);
    }

    public async Task<AnalysisDto> UpdateAnalysisAsync(Guid userId, Guid analysisId, UpdateAnalysisRequest req)
    {
        var analysis = await db.Analyses
            .FirstOrDefaultAsync(a => a.Id == analysisId && a.UserId == userId)
            ?? throw new KeyNotFoundException("Analiz bulunamadı.");

        if (req.Status is not null) analysis.Status = req.Status;
        if (req.UserNote is not null) analysis.UserNote = req.UserNote;
        await db.SaveChangesAsync();
        return Map(analysis);
    }

    public async Task DeleteAnalysisAsync(Guid userId, Guid analysisId)
    {
        var analysis = await db.Analyses
            .FirstOrDefaultAsync(a => a.Id == analysisId && a.UserId == userId)
            ?? throw new KeyNotFoundException("Analiz bulunamadı.");
        db.Analyses.Remove(analysis);
        await db.SaveChangesAsync();
    }

    public async Task<List<ProjectDto>> GetProjectsAsync(Guid userId)
    {
        var projects = await db.ShoppingProjects
            .Include(p => p.ProjectAnalyses).ThenInclude(pa => pa.Analysis)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return projects.Select(MapProject).ToList();
    }

    public async Task<ProjectDto> CreateProjectAsync(Guid userId, CreateProjectRequest req)
    {
        var externalId = string.IsNullOrWhiteSpace(req.ExternalId)
            ? $"project-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid().ToString("N")[..7]}"
            : req.ExternalId;

        var project = new ShoppingProject
        {
            UserId = userId,
            ExternalId = externalId,
            Title = req.Title,
            Goal = req.Goal,
            Budget = req.Budget,
        };

        db.ShoppingProjects.Add(project);
        await db.SaveChangesAsync();
        return MapProject(project);
    }

    public async Task<ProjectDto> UpdateProjectAsync(Guid userId, string externalId, UpdateProjectRequest req)
    {
        var project = await db.ShoppingProjects
            .Include(p => p.ProjectAnalyses)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Proje bulunamadı.");

        if (req.Title is not null) project.Title = req.Title;
        if (req.Goal is not null) project.Goal = req.Goal;
        if (req.Budget is not null) project.Budget = req.Budget;
        project.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapProject(project);
    }

    public async Task DeleteProjectAsync(Guid userId, string externalId)
    {
        var project = await db.ShoppingProjects
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Proje bulunamadı.");
        db.ShoppingProjects.Remove(project);
        await db.SaveChangesAsync();
    }

    public async Task<ProjectDto> AddAnalysisToProjectAsync(Guid userId, string projectExternalId, string analysisExternalId)
    {
        var project = await db.ShoppingProjects
            .Include(p => p.ProjectAnalyses).ThenInclude(pa => pa.Analysis)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ExternalId == projectExternalId)
            ?? throw new KeyNotFoundException("Proje bulunamadı.");

        var analysis = await db.Analyses
            .FirstOrDefaultAsync(a => a.UserId == userId && a.ExternalId == analysisExternalId)
            ?? throw new KeyNotFoundException("Analiz bulunamadı.");

        if (!project.ProjectAnalyses.Any(pa => pa.AnalysisId == analysis.Id))
        {
            try
            {
                db.ShoppingProjectAnalyses.Add(new ShoppingProjectAnalysis { ProjectId = project.Id, AnalysisId = analysis.Id });
                await db.SaveChangesAsync();
                project.ProjectAnalyses.Add(new ShoppingProjectAnalysis { ProjectId = project.Id, AnalysisId = analysis.Id, Analysis = analysis });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // Composite key unique constraint ihlali — eşzamanlı çift ekleme girişimi, veri tutarlı
                await db.Entry(project).ReloadAsync();
                await db.Entry(project).Collection(p => p.ProjectAnalyses).LoadAsync();
            }
        }

        return MapProject(project);
    }

    public async Task<ProjectDto> RemoveAnalysisFromProjectAsync(Guid userId, string projectExternalId, string analysisExternalId)
    {
        var project = await db.ShoppingProjects
            .Include(p => p.ProjectAnalyses).ThenInclude(pa => pa.Analysis)
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ExternalId == projectExternalId)
            ?? throw new KeyNotFoundException("Proje bulunamadı.");

        var analysis = await db.Analyses
            .FirstOrDefaultAsync(a => a.UserId == userId && a.ExternalId == analysisExternalId);

        if (analysis is not null)
        {
            var link = project.ProjectAnalyses.FirstOrDefault(pa => pa.AnalysisId == analysis.Id);
            if (link is not null) db.ShoppingProjectAnalyses.Remove(link);
            await db.SaveChangesAsync();
        }

        return MapProject(project);
    }

    public async Task<BuyerProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        return new BuyerProfileDto(user.ProfileName, user.Onboarded);
    }

    public async Task<BuyerProfileDto> UpdateProfileAsync(Guid userId, UpdateBuyerProfileRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        if (req.ProfileName is not null) user.ProfileName = req.ProfileName;
        if (req.Onboarded.HasValue) user.Onboarded = req.Onboarded.Value;
        await db.SaveChangesAsync();
        return new BuyerProfileDto(user.ProfileName, user.Onboarded);
    }

    public async Task<List<SavedKombinDto>> GetKombinsAsync(Guid userId)
    {
        return await db.SavedKombins
            .Where(k => k.UserId == userId)
            .OrderByDescending(k => k.CreatedAt)
            .Select(k => MapKombin(k))
            .ToListAsync();
    }

    public async Task<SavedKombinDto> SaveKombinAsync(Guid userId, SaveKombinRequest req)
    {
        var externalId = string.IsNullOrWhiteSpace(req.ExternalId)
            ? $"kombin-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid().ToString("N")[..7]}"
            : req.ExternalId;

        var existing = await db.SavedKombins
            .FirstOrDefaultAsync(k => k.UserId == userId && k.ExternalId == externalId);

        if (existing is not null)
        {
            existing.Title = req.Title;
            existing.GoalText = req.GoalText;
            existing.Budget = req.Budget;
            existing.ProductsJson = req.ProductsJson;
            existing.ResultJson = req.ResultJson;
            await db.SaveChangesAsync();
            return MapKombin(existing);
        }

        var saved = new SavedKombin
        {
            UserId = userId,
            ExternalId = externalId,
            Title = req.Title,
            GoalText = req.GoalText,
            Budget = req.Budget,
            ProductsJson = req.ProductsJson,
            ResultJson = req.ResultJson,
        };

        db.SavedKombins.Add(saved);
        await db.SaveChangesAsync();
        return MapKombin(saved);
    }

    public async Task DeleteKombinAsync(Guid userId, string externalId)
    {
        var saved = await db.SavedKombins
            .FirstOrDefaultAsync(k => k.UserId == userId && k.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Kombin bulunamadı.");
        db.SavedKombins.Remove(saved);
        await db.SaveChangesAsync();
    }

    private static AnalysisDto Map(BuyerAnalysis a) => new(
        a.Id, a.ExternalId, a.ProductId, a.ProductTitle, a.ProductImage,
        a.ProductPrice, a.SellerName, a.UserNeedText,
        a.OverallRiskPercent, a.RecommendationLevel, a.ScoresJson,
        a.Status, a.UserNote, a.SavedAt
    );

    private static ProjectDto MapProject(ShoppingProject p) => new(
        p.Id, p.ExternalId, p.Title, p.Goal, p.Budget, p.CreatedAt,
        p.ProjectAnalyses.Select(pa => pa.Analysis?.ExternalId ?? "").Where(id => id != "").ToList()
    );

    private static SavedKombinDto MapKombin(SavedKombin k) => new(
        k.Id, k.ExternalId, k.Title, k.GoalText, k.Budget, k.ProductsJson, k.ResultJson, k.CreatedAt
    );
}
