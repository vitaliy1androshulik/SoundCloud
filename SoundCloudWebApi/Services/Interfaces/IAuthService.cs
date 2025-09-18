using SoundCloudWebApi.Models.Auth;
using System.Threading.Tasks;
using SoundCloudWebApi.Data.Entities;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
        Task<UserProfileDto> GetUserProfileAsync(string userId);
        string IssueJwtForUser(UserEntity user);
        Task SetLocalPasswordAsync(int userId, string newPassword);
    }
}
