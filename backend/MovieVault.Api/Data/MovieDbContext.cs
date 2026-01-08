using Microsoft.EntityFrameworkCore;
using MovieVault.Api.Models;

namespace MovieVault.Api.Data;

public class MovieDbContext : DbContext
{
    public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options)
    {
    }

    public DbSet<Movie> Movies => Set<Movie>();
}
