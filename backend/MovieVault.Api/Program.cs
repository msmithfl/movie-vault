using Microsoft.EntityFrameworkCore;
using MovieVault.Api.Data;
using MovieVault.Api.Endpoints;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure JSON serialization to use camelCase
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Add DbContext with SQLite (dev) or PostgreSQL (production)
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
builder.Services.AddDbContext<MovieDbContext>(options =>
{
    if (!string.IsNullOrEmpty(databaseUrl))
    {
        // Production: Parse Railway's PostgreSQL URL format
        // postgresql://user:password@host:port/database
        var uri = new Uri(databaseUrl);
        var connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={uri.UserInfo.Split(':')[0]};Password={uri.UserInfo.Split(':')[1]};SSL Mode=Require;Trust Server Certificate=true";
        options.UseNpgsql(connectionString);
    }
    else
    {
        // Development: Use SQLite
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=movievault.db");
    }
});

// Add CORS
var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? new[] { "http://localhost:5173", "https://localhost:5173", "https://movie-vault-six.vercel.app" };

Console.WriteLine($"CORS Origins: {string.Join(", ", corsOrigins)}");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Run migrations automatically on startup
await app.MigrateDbAsync();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// CORS must come before UseHttpsRedirection
app.UseCors("AllowFrontend");

// Only redirect to HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Map movie endpoints
app.MapMovieEndpoints();
app.MapCollectionEndpoints();
app.MapShelfSectionEndpoints();

// Use PORT from Railway if available, bind to all interfaces
var port = Environment.GetEnvironmentVariable("PORT") ?? "5156";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();
