namespace SoundCloudWebApi.Models.Track
{
    public class TrackStatsDto
    {
        public int TrackId { get; set; }

        // Лічильник прослуховувань треку
        public int PlayCount { get; set; }

        // Лайки треку
        public int LikeCount { get; set; }

        // Опційно: AuthorId та AuthorName, якщо потрібні для статистики
        public int AuthorId { get; set; }
        public string AuthorName { get; set; }
    }
}