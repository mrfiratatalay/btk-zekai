namespace ZekAI.Application.DTOs.Auth;

public record RegisterRequest(string Email, string Password, string FullName, string Role);
public record LoginRequest(string Email, string Password);
public record RefreshRequest(string RefreshToken);
public record LogoutRequest(string RefreshToken);

public record AuthResponse(string Token, string RefreshToken, UserDto User);

public record UserDto(Guid Id, string Email, string FullName, string Role);
