using Microsoft.EntityFrameworkCore;
using MovieVault.Api.Data;
using MovieVault.Api.Models;

namespace MovieVault.Api.Endpoints;

public static class ShelfSectionEndpoints
{
    public static void MapShelfSectionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/shelfsections");

        group.MapGet("/", async (MovieDbContext db) =>
            await db.ShelfSections.OrderBy(s => s.Name).ToListAsync());

        group.MapPost("/", async (ShelfSection section, MovieDbContext db) =>
        {
            db.ShelfSections.Add(section);
            await db.SaveChangesAsync();
            return Results.Created($"/api/shelfsections/{section.Id}", section);
        });

        group.MapDelete("/{id}", async (int id, MovieDbContext db) =>
        {
            var section = await db.ShelfSections.FindAsync(id);
            if (section is null) return Results.NotFound();

            db.ShelfSections.Remove(section);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
