using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services
{
    public class UserService : IUserService
    {
        private readonly SoundCloudDbContext _db;
        public UserService(SoundCloudDbContext db) => _db = db;

        public async Task<IEnumerable<UserProfileDto>> GetAllAsync()
        {
            return await _db.Users
                .Select(u => new UserProfileDto
                {
                    Id = u.Id.ToString(),
                    Username = u.Username,
                    Email = u.Email,
                    CreatedAt = u.CreatedAt
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
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException($"User with id={id} not found");
        }

        public async Task<UserProfileDto> UpdateAsync(int id, UpdateUserRequestDto dto)
        {
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
                CreatedAt = user.CreatedAt
            };
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id={id} not found");
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
        }
    }
}
