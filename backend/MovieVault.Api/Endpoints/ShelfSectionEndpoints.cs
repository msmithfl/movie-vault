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

        group.MapPut("/{id}", async (int id, string newName, MovieDbContext db) =>
        {
            var section = await db.ShelfSections.FindAsync(id);
            if (section is null) return Results.NotFound();

            var oldName = section.Name;
            section.Name = newName;

            // Update all movies that have this shelf section
            var moviesWithSection = await db.Movies
                .Where(m => m.ShelfSection == oldName)
                .ToListAsync();

            foreach (var movie in moviesWithSection)
            {
                movie.ShelfSection = newName;
            }

            await db.SaveChangesAsync();
            return Results.Ok(section);
        });

        group.MapDelete("/{id}", async (int id, MovieDbContext db) =>
        {
            var section = await db.ShelfSections.FindAsync(id);
            if (section is null) return Results.NotFound();

            var sectionName = section.Name;

            // Remove this shelf section from all movies that have it
            var moviesWithSection = await db.Movies
                .Where(m => m.ShelfSection == sectionName)
                .ToListAsync();

            foreach (var movie in moviesWithSection)
            {
                movie.ShelfSection = string.Empty;
            }

            db.ShelfSections.Remove(section);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
