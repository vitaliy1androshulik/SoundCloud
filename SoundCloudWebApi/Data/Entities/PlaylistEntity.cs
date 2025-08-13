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
    }
}
