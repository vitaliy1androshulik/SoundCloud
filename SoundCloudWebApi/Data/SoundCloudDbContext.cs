using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data.Entities;

namespace SoundCloudWebApi.Data;

public class SoundCloudDbContext : DbContext
{
    public SoundCloudDbContext(DbContextOptions<SoundCloudDbContext> options)
        : base(options)
    {
    }
    public DbSet<GenreEntity> Genres { get; set; }

}
