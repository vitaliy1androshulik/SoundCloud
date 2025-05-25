using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Principal;

namespace SoundCloudWebApi.Data.Entities;

public class GenreEntity 
{
    [Key]
    public int Id { get; set; } // Відповідає genre_id в базі даних

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } // Назва жанру


}