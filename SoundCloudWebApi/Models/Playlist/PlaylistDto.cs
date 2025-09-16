namespace SoundCloudWebApi.Models.Playlist
{
    public class PlaylistDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        // Нове поле: ID користувача-власника
        public int OwnerId { get; set; }

        // Опційно: ім'я користувача-власника для зручності фронтенду
        public string OwnerName { get; set; }
    }
}