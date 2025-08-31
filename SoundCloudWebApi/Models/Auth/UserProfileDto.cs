using SoundCloudWebApi.Data.Entities;

namespace SoundCloudWebApi.Models.Auth;

public class UserProfileDto
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserRole Role { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
