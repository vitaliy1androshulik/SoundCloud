using SoundCloudWebApi.Data.Entities;

namespace SoundCloudWebApi.Models.Auth;

public class UserProfileDto
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserRole Role { get; set; }
    public DateTime? UpdatedAt { get; set; }
    //new
    public string AuthProvider { get; set; }   // "Local" або "Google"
    public bool IsLocalPasswordSet { get; set; }
}
