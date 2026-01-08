namespace MovieVault.Api.Models;

public class Movie
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string UpcNumber { get; set; }
    public required string Format { get; set; } // DVD, Blu-ray, 4K
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
