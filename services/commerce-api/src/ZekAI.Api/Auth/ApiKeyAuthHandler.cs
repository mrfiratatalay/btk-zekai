using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Api.Auth;

public class ApiKeyAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    AppDbContext db)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader is null || !authHeader.StartsWith("Bearer "))
            return AuthenticateResult.NoResult();

        var token = authHeader["Bearer ".Length..].Trim();

        var seller = await db.Sellers
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.ApiKey == token);

        if (seller?.User is null)
            return AuthenticateResult.Fail("Geçersiz API anahtarı.");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, seller.User.Id.ToString()),
            new Claim(ClaimTypes.Email, seller.User.Email),
            new Claim(ClaimTypes.Name, seller.User.FullName),
            new Claim(ClaimTypes.Role, "Seller"),
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}
