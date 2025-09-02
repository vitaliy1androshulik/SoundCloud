namespace SoundCloudWebApi.Models.Category
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Slug { get; set; } = "";
        public string? ImageUrl { get; set; }
    }
}
