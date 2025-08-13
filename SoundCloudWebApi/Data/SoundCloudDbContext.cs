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
    public DbSet<UserEntity> Users { get; set; }
    public DbSet<TrackEntity> Tracks { get; set; }
    public DbSet<AlbumEntity> Albums { get; set; }
    public DbSet<PlaylistEntity> Playlists { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // виклик базової конфігурації (залишаємо)

        // Унікальний індекс на Email
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Унікальний індекс на Username
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Username)
            .IsUnique();

    }
}
