using Microsoft.EntityFrameworkCore;
using MovieVault.Api.Data;
using MovieVault.Api.Models;

namespace MovieVault.Api.Endpoints;

public static class CollectionEndpoints
{
    public static void MapCollectionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/collections");

        group.MapGet("/", async (MovieDbContext db) =>
            await db.Collections.OrderBy(c => c.Name).ToListAsync());

        group.MapPost("/", async (Collection collection, MovieDbContext db) =>
        {
            db.Collections.Add(collection);
            await db.SaveChangesAsync();
            return Results.Created($"/api/collections/{collection.Id}", collection);
        });

        group.MapDelete("/{id}", async (int id, MovieDbContext db) =>
        {
            var collection = await db.Collections.FindAsync(id);
            if (collection is null) return Results.NotFound();

            db.Collections.Remove(collection);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
