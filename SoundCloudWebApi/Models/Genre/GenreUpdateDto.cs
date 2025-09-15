using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Genre
{
    public class GenreUpdateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
    }
}
