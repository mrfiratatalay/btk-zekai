using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ZekAI.Domain.Entities;

namespace ZekAI.Infrastructure.Services;

public class JwtService(IConfiguration config)
{
    private string Secret => config["Jwt:Secret"]!;
    private string Issuer => config["Jwt:Issuer"]!;
    private string Audience => config["Jwt:Audience"]!;
    private int ExpiryMinutes => int.Parse(config["Jwt:ExpiryMinutes"] ?? "1440");

    public string GenerateToken(ZekaiUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(ExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() => Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
}
