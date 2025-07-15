using SoundCloudWebApi.Models.Auth;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
        Task<UserProfileDto> GetUserProfileAsync(string userId);
    }
}
