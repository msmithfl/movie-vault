using Microsoft.EntityFrameworkCore;
using MovieVault.Api.Data;
using MovieVault.Api.Models;

namespace MovieVault.Api.Endpoints;

public static class CollectionListItemEndpoints
{
    public static void MapCollectionListItemEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/collections/{collectionId}/items");

        // GET: Get all items for a collection
        group.MapGet("/", async (int collectionId, MovieDbContext db) =>
        {
            var items = await db.CollectionListItems
                .Where(i => i.CollectionId == collectionId)
                .OrderBy(i => i.Year)
                .ThenBy(i => i.Title)
                .ToListAsync();
            
            return Results.Ok(items);
        });

        // POST: Add a new item to collection list
        group.MapPost("/", async (int collectionId, CollectionListItem item, MovieDbContext db) =>
        {
            // Verify collection exists
            var collection = await db.Collections.FindAsync(collectionId);
            if (collection == null)
                return Results.NotFound("Collection not found");

            // Set the collection ID from the route
            item.CollectionId = collectionId;
            item.CreatedAt = DateTime.UtcNow;

            db.CollectionListItems.Add(item);
            await db.SaveChangesAsync();

            return Results.Created($"/api/collections/{collectionId}/items/{item.Id}", item);
        });

        // DELETE: Remove an item from collection list
        group.MapDelete("/{itemId}", async (int collectionId, int itemId, MovieDbContext db) =>
        {
            var item = await db.CollectionListItems
                .FirstOrDefaultAsync(i => i.Id == itemId && i.CollectionId == collectionId);

            if (item == null)
                return Results.NotFound();

            db.CollectionListItems.Remove(item);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}
