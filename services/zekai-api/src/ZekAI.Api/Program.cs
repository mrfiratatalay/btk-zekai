using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ZekAI.Infrastructure.Data;
using ZekAI.Infrastructure.Http;
using ZekAI.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ZekaiDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// JWT Auth
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });
builder.Services.AddAuthorization();

// HTTP Clients
builder.Services.AddHttpClient<CommerceApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["CommerceApi:BaseUrl"] ?? "http://localhost:5001");
});
builder.Services.AddHttpClient("AiService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000");
});
builder.Services.AddHttpClient<AiServiceClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000");
    client.Timeout = TimeSpan.FromSeconds(120);
});

// Services
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<BuyerService>();
builder.Services.AddScoped<SellerService>();

// CORS
builder.Services.AddCors(opt => opt.AddDefaultPolicy(policy =>
    policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "https://akilli-markett.vercel.app",
            "https://zekai-platformm.vercel.app")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ZekaiDbContext>();
    db.Database.Migrate();

    // Seed Demo Seller
    if (!db.Users.Any(u => u.Email == "seller@zekai.com"))
    {
        db.Users.Add(new ZekAI.Domain.Entities.ZekaiUser
        {
            Email = "seller@zekai.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Seller123!"),
            FullName = "Demo Seller",
            Role = "Seller"
        });
        db.SaveChanges();
    }

    // Seed Demo Buyer
    if (!db.Users.Any(u => u.Email == "buyer@zekai.com"))
    {
        db.Users.Add(new ZekAI.Domain.Entities.ZekaiUser
        {
            Email = "buyer@zekai.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer123!"),
            FullName = "Demo Buyer",
            Role = "Buyer"
        });
        db.SaveChanges();
    }
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
