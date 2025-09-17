using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundCloudWebApi.Data.Entities
{
    public class AlbumTrackEntity
    {
        [Key]
        public int Id { get; set; }

        // Зв’язок з альбомом
        [Required]
        public int AlbumId { get; set; }
        public AlbumEntity Album { get; set; }

        // Зв’язок з треком
        [Required]
        public int TrackId { get; set; }
        public TrackEntity Track { get; set; }

        // Додаткові поля (опційно)
        public int Order { get; set; } // позиція треку в альбомі
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
