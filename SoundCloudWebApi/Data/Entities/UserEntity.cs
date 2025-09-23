using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Data.Entities
{
    public enum UserRole
    {
        User,
        Moderator,
        Admin
    }

    public class UserEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] PasswordSalt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public UserRole Role { get; set; } = UserRole.User;
        public bool IsBlocked { get; set; } = false;
        public string? AvatarUrl { get; set; }
           
        // нові
        public DateTime? UpdatedAt { get; set; }

        // зв’язок: один юзер має багато треків
        public ICollection<TrackEntity>? Tracks { get; set; }
        public ICollection<TrackListenEntity>? TrackPlays { get; set; }

        public ICollection<AlbumEntity>? Albums { get; set; }
        public ICollection<PlaylistEntity>? Playlists { get; set; }
        public AuthProvider AuthProvider { get; set; } = AuthProvider.Local; // як створ акаунт
        public string? GoogleSubject { get; set; }  // стабільний Google sub (payload.Subject)
        public bool IsLocalPasswordSet { get; set; } = true; // чи є локальний пароль для входу


    }
}