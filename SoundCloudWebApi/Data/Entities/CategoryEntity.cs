using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Data.Entities
{
    public class CategoryEntity
    {
        [Key] public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Slug { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }   // шлях до картинки 
    }
}
