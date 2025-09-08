namespace SoundCloudWebApi.Data.Entities
{
    public class TrackLikeEntity
    {
        public int Id { get; set; }
        public int TrackId { get; set; }
        public TrackEntity Track { get; set; } = default!;

        public int UserId { get; set; }
        public UserEntity User { get; set; } = default!;

        public DateTime LikedAt { get; set; } = DateTime.UtcNow;
    }
}
