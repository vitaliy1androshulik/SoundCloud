using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Apis.Auth;


namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IUserService
    {
        // Отримати всіх користувачів (може включати колекції треків, альбомів, плейлистів)
        Task<IEnumerable<UserProfileDto>> GetAllAsync();

        // Отримати користувача за ID
        Task<UserProfileDto> GetByIdAsync(int id);

        // Оновити дані користувача (ім'я, email, аватар)
        Task<UserProfileDto> UpdateAsync(int id, UpdateUserRequestDto dto);

        // Видалити користувача
        Task DeleteAsync(int id);

        // Блокування/розблокування користувача
        Task BlockAsync(int id);
        Task UnblockAsync(int id);

        // Зміна ролі користувача
        Task ChangeRoleAsync(int userId, UserRole newRole);

        Task SetAvatarAsync(int userId, string url);
        Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload payload);


    }
}
