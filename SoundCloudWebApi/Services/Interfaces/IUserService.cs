using SoundCloudWebApi.Models.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Data.Entities;  

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserProfileDto>> GetAllAsync();
        Task<UserProfileDto> GetByIdAsync(int id);
        Task<UserProfileDto> UpdateAsync(int id, UpdateUserRequestDto dto);
        Task DeleteAsync(int id);
        Task BlockAsync(int id);
        Task UnblockAsync(int id);
        Task ChangeRoleAsync(int userId, UserRole newRole);
        Task SetAvatarAsync(int userId, string url);

    }
}
