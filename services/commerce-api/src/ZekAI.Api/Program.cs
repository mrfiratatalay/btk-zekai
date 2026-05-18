using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using ZekAI.Api.Auth;
using ZekAI.Infrastructure.Data;
using ZekAI.Infrastructure.Seeders;
using ZekAI.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ──
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── PostgreSQL + EF Core ──
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
       .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

// ── Authentication: JWT + API Key ──
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Smart";
    options.DefaultChallengeScheme = "Smart";
})
.AddPolicyScheme("Smart", "JWT or API Key", options =>
{
    options.ForwardDefaultSelector = ctx =>
    {
        var bearer = ctx.Request.Headers.Authorization.FirstOrDefault();
        if (bearer?.StartsWith("Bearer ") == true && bearer["Bearer ".Length..].Contains('.'))
            return JwtBearerDefaults.AuthenticationScheme;
        return "ApiKey";
    };
})
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
})
.AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, ApiKeyAuthHandler>("ApiKey", null);
builder.Services.AddAuthorization();

// ── CORS — Next.js frontend ──
builder.Services.AddCors(opt => opt.AddPolicy("NextJs", policy =>
    policy
        .WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "https://akilli-markett.vercel.app",
            "https://zekai-platformm.vercel.app")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

// ── Services DI ──
builder.Services.AddHttpClient();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<SellerService>();
builder.Services.AddScoped<BuyerService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<FavoriteService>();
builder.Services.AddScoped<DataSeeder>();

var app = builder.Build();

// ── Migrate + Seed on startup ──
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NextJs");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
