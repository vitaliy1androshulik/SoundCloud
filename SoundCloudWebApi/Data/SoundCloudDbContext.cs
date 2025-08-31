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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // виклик базової конфігурації (залишаємо)

        // Зберігаємо enum Role як РЯДОК у БД (щоб у колонці бачити 'User'/'Moderator'/'Admin')
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Role)
            .HasConversion<string>()
            .HasMaxLength(16);

        // (опціонально) Check-constraint — гарантія валідних значень у БД
        //  -- синтаксис під PostgreSQL. Якщо інша СУБД, або прибираємо, або пишемо відповідний SQL.
        modelBuilder.Entity<UserEntity>()
            .ToTable(t => t.HasCheckConstraint(
                "CK_Users_Role_Enum",
                "\"Role\" IN ('User','Moderator','Admin')"
            ));

        // Унікальний індекс на Email
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Унікальний індекс на Username
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Username)
            .IsUnique();

        //  Забороняємо каскадне видалення власника,
        //    щоб не знести випадково всі альбоми/плейлисти при Delete(User)
        modelBuilder.Entity<AlbumEntity>()
            //.HasOne(a => a.Owner)
            .HasOne(a => a.Owner).WithMany(u => u.Albums)
            //.WithMany()
            .HasForeignKey(a => a.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PlaylistEntity>()
            .HasOne(p => p.Owner).WithMany(u => u.Playlists)
            //.HasOne(p => p.Owner)
            //.WithMany()
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}
