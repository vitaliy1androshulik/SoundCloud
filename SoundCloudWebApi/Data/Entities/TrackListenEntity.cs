namespace SoundCloudWebApi.Data.Entities
{
    public class TrackListenEntity
    {
        public int Id { get; set; }
        public int TrackId { get; set; }
        public TrackEntity Track { get; set; } = default!;

        public int UserId { get; set; }   // хто слухав
        public UserEntity User { get; set; } = default!;

        public DateTime ListenedAt { get; set; } = DateTime.UtcNow;
    }
}
