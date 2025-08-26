using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services
{
    public class UserService : IUserService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        //public UserService(SoundCloudDbContext db) => _db = db;
        public UserService(SoundCloudDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        // допоміжний метод 
        private (int ActorId, UserRole ActorRole) GetActor()
        {
            var principal = _httpContextAccessor.HttpContext?.User
                ?? throw new UnauthorizedAccessException("No user in context");

            var idStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("No NameIdentifier claim");

            var roleStr = principal.FindFirst(ClaimTypes.Role)?.Value ?? nameof(UserRole.User);
            if (!Enum.TryParse<UserRole>(roleStr, out var role)) role = UserRole.User;

            return (int.Parse(idStr), role);
        }

        public async Task<IEnumerable<UserProfileDto>> GetAllAsync()
        {
            return await _db.Users
                .Select(u => new UserProfileDto
                {
                    Id = u.Id.ToString(),
                    Username = u.Username,
                    Email = u.Email,
                    CreatedAt = u.CreatedAt,
                    Role = u.Role
                })
                .ToListAsync();
        }

        public async Task<UserProfileDto> GetByIdAsync(int id)
        {
            return await _db.Users
                .Where(u => u.Id == id)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id.ToString(),
                    Username = u.Username,
                    Email = u.Email,
                    CreatedAt = u.CreatedAt,
                    Role = u.Role
                })
                .FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException($"User with id={id} not found");
        }

        public async Task<UserProfileDto> UpdateAsync(int id, UpdateUserRequestDto dto)
        {
            var (actorId, actorRole) = GetActor();

            // дозволяємо: або сам користувач, або Admin
            if (actorRole != UserRole.Admin && actorId != id)
                throw new UnauthorizedAccessException("You cannot update another user.");

            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id={id} not found");

            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username;
            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            await _db.SaveChangesAsync();

            return new UserProfileDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id={id} not found");
            //_db.Users.Remove(user); // - фізичне видалення
            user.IsBlocked = true; // - лише бллокування
            await _db.SaveChangesAsync();
        }   
        public async Task BlockAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id= {id} not found.");
            user.IsBlocked = true;
            await _db.SaveChangesAsync();
        }
        public async Task UnblockAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id= {id} not found.");
            user.IsBlocked = false;
            await _db.SaveChangesAsync();
        }
        public async Task ChangeRoleAsync(int userId, UserRole newRole)
        {
            var user = await _db.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException($"User with id={userId} not found");

            //  перевірити, чи роль  змінилася:
            if (user.Role == newRole)
                throw new InvalidOperationException($"User already has role {newRole}");

            user.Role = newRole;
            await _db.SaveChangesAsync();
        }


    }
}