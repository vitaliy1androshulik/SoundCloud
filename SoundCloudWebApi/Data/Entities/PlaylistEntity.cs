using System;

namespace SoundCloudWebApi.Data.Entities
{
    public class PlaylistEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int OwnerId { get; set; }
        public UserEntity Owner { get; set; }
        public ICollection<TrackEntity> Tracks { get; set; }
        public string? CoverUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }


    }
}
