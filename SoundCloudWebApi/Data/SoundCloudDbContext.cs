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
    public DbSet<CategoryEntity> Categories { get; set; }
    public DbSet<TrackListenEntity> TrackListens { get; set; }
    public DbSet<TrackLikeEntity> TrackLikes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // виклик базової конфігурації (залишаємо)

        // Зберігаємо enum Role як РЯДОК у БД (щоб у колонці бачити 'User'/'Moderator'/'Admin')
        modelBuilder.Entity<UserEntity>()
        .Property(u => u.Role)
        .HasConversion<string>()
        .HasMaxLength(16);

        modelBuilder.Entity<UserEntity>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Users_Role_Enum",
                "\"Role\" IN ('User','Moderator','Admin')"
            ));

        // Унікальні індекси
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Album → User (Owner)
        modelBuilder.Entity<AlbumEntity>()
            .HasOne(a => a.Owner)
            .WithMany(u => u.Albums)
            .HasForeignKey(a => a.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Playlist → User (Owner)
        modelBuilder.Entity<PlaylistEntity>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Playlists)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Track → User (Author)
        modelBuilder.Entity<TrackEntity>()
            .HasOne(t => t.Author)          // нова властивість навігації у TrackEntity
            .WithMany(u => u.Tracks)            // у UserEntity: ICollection<TrackEntity> Tracks
            .HasForeignKey(t => t.AuthorId)     // обов'язковий
            .OnDelete(DeleteBehavior.Restrict);

        // Track → Album
        modelBuilder.Entity<TrackEntity>()
            .HasOne(t => t.Album)
            .WithMany(a => a.Tracks)
            .HasForeignKey(t => t.AlbumId)
            .OnDelete(DeleteBehavior.Cascade);

        // TrackLike: унікальність лайка від користувача
        modelBuilder.Entity<TrackLikeEntity>()
            .HasIndex(x => new { x.TrackId, x.UserId })
            .IsUnique();


        modelBuilder.Entity<TrackLikeEntity>()
            .HasOne(l => l.Track).WithMany()
            .HasForeignKey(l => l.TrackId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TrackLikeEntity>()
            .HasOne(l => l.User).WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

}

