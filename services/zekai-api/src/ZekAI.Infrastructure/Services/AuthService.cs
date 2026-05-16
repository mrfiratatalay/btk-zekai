using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class AuthService(ZekaiDbContext db, JwtService jwt)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            throw new InvalidOperationException("Bu e-posta adresi zaten kullanımda.");

        var user = new ZekaiUser
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName,
            Role = req.Role.ToLowerInvariant() switch
            {
                "seller" => "seller",
                _ => "buyer"
            },
        };

        db.Users.Add(user);

        var refreshToken = new ZekaiRefreshToken
        {
            UserId = user.Id,
            Token = jwt.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
        };
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        return new AuthResponse(jwt.GenerateToken(user), refreshToken.Token, user.Id, user.Email, user.FullName, user.Role);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email)
            ?? throw new UnauthorizedAccessException("E-posta veya şifre hatalı.");

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("E-posta veya şifre hatalı.");

        var refreshToken = new ZekaiRefreshToken
        {
            UserId = user.Id,
            Token = jwt.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
        };
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        return new AuthResponse(jwt.GenerateToken(user), refreshToken.Token, user.Id, user.Email, user.FullName, user.Role);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken)
    {
        var token = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
            ?? throw new UnauthorizedAccessException("Geçersiz refresh token.");

        token.IsRevoked = true;
        var newRefreshToken = new ZekaiRefreshToken
        {
            UserId = token.UserId,
            Token = jwt.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30),
        };
        db.RefreshTokens.Add(newRefreshToken);
        await db.SaveChangesAsync();

        return new AuthResponse(jwt.GenerateToken(token.User!), newRefreshToken.Token, token.User!.Id, token.User.Email, token.User.FullName, token.User.Role);
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        return new UserDto(user.Id, user.Email, user.FullName, user.Role);
    }
}
