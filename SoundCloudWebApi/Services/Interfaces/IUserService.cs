using SoundCloudWebApi.Models.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserProfileDto>> GetAllAsync();
        Task<UserProfileDto> GetByIdAsync(int id);
        Task<UserProfileDto> UpdateAsync(int id, UpdateUserRequestDto dto);
        Task DeleteAsync(int id);
    }
}
