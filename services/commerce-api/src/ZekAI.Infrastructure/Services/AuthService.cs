using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Auth;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class AuthService(AppDbContext db, JwtService jwt)
{
    private const int RefreshTokenExpiryDays = 30;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            throw new InvalidOperationException("Bu e-posta zaten kayıtlı.");

        var role = req.Role.Equals("seller", StringComparison.OrdinalIgnoreCase)
            ? UserRole.Seller : UserRole.Buyer;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName,
            Role = role,
        };
        db.Users.Add(user);

        if (role == UserRole.Seller)
        {
            db.Sellers.Add(new Seller
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                StoreName = req.FullName + " Mağazası",
                OwnerName = req.FullName,
                TrustScore = 50,
                StoreRating = 0,
            });
        }

        var accessToken = jwt.GenerateToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        await db.SaveChangesAsync();

        return new AuthResponse(accessToken, refreshToken.Token, new UserDto(user.Id, user.Email, user.FullName, user.Role.ToString()));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email)
            ?? throw new UnauthorizedAccessException("E-posta veya şifre hatalı.");

        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("E-posta veya şifre hatalı.");

        var accessToken = jwt.GenerateToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        await db.SaveChangesAsync();

        return new AuthResponse(accessToken, refreshToken.Token, new UserDto(user.Id, user.Email, user.FullName, user.Role.ToString()));
    }

    public async Task<AuthResponse> RefreshAsync(string token)
    {
        var existing = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
            ?? throw new UnauthorizedAccessException("Geçersiz veya süresi dolmuş refresh token.");

        existing.IsRevoked = true;

        var accessToken = jwt.GenerateToken(existing.User!);
        var newRefresh = await CreateRefreshTokenAsync(existing.UserId);

        await db.SaveChangesAsync();

        var u = existing.User!;
        return new AuthResponse(accessToken, newRefresh.Token, new UserDto(u.Id, u.Email, u.FullName, u.Role.ToString()));
    }

    public async Task LogoutAsync(string token)
    {
        var existing = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
        if (existing is not null)
        {
            existing.IsRevoked = true;
            await db.SaveChangesAsync();
        }
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
        return new UserDto(user.Id, user.Email, user.FullName, user.Role.ToString());
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId)
    {
        // Revoke old active tokens for this user to keep one active session
        var oldTokens = await db.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();
        foreach (var t in oldTokens) t.IsRevoked = true;

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = JwtService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays),
        };
        db.RefreshTokens.Add(refreshToken);
        return refreshToken;
    }
}
