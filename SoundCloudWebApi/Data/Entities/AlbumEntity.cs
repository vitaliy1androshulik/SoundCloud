using System;

namespace SoundCloudWebApi.Data.Entities
{
    public class AlbumEntity
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int OwnerId { get; set; }           
        public UserEntity Owner { get; set; }
        public ICollection<TrackEntity> Tracks { get; set; }
        public string? CoverUrl { get; set; }

        //нові: 
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }

    }
}
