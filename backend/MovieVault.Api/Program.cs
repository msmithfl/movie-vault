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
        // Production: Use PostgreSQL from Railway
        options.UseNpgsql(databaseUrl);
    }
    else
    {
        // Development: Use SQLite
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=movievault.db");
    }
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "https://localhost:5173",
                "https://movie-vault-six.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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

// Use PORT from Railway if available
var port = Environment.GetEnvironmentVariable("PORT") ?? "5156";
app.Run($"http://0.0.0.0:{port}");
