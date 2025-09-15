using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Genre
{
    public class GenreCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
    }
}
