namespace SoundCloudWebApi.Models.Album
{
    public class AlbumDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; }

        // Нові поля для зв’язку з користувачем
        public int OwnerId { get; set; }

        // Опційно: ім'я власника для відображення на фронтенді
        public string OwnerName { get; set; }
    }
}