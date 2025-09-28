using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

public class CreatePlaylistDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; }

    // Власник
    [Required]
    public int OwnerId { get; set; }

    // Файл обкладинки
    public IFormFile? Cover { get; set; }
    public string? CoverUrl { get; set; }
}
