using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// ── JWT Authentication ──
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

// ── CORS — Next.js frontend ──
builder.Services.AddCors(opt => opt.AddPolicy("NextJs", policy =>
    policy
        .WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

// ── Services DI ──
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<SellerService>();
builder.Services.AddScoped<BuyerService>();
builder.Services.AddScoped<DataSeeder>();

var app = builder.Build();

// ── Seed database on startup ──
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NextJs");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
