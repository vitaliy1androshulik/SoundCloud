using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using Google.Apis.Auth;


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
                    AvatarUrl = u.AvatarUrl,
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

            //if (!string.IsNullOrWhiteSpace(dto.Username))
            //    user.Username = dto.Username;
            //if (!string.IsNullOrWhiteSpace(dto.Email))
            //    user.Email = dto.Email;

            //більш ефективні методи перевірки:
            // - Email 
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailTrim = dto.Email.Trim();
                var emailNorm = emailTrim.ToLower();

                // Якщо змінюється (ігноруємо лише різницю в регістрі)
                var currentEmailNorm = (user.Email ?? string.Empty).ToLower();
                if (currentEmailNorm != emailNorm)
                {
                    var emailTaken = await _db.Users
                        .AsNoTracking()
                        .AnyAsync(u => u.Id != id && u.Email.ToLower() == emailNorm);

                    if (emailTaken)
                        throw new InvalidOperationException("Користувач з таким email вже існує");

                    user.Email = emailTrim; // зберігаємо нормалізовано (без зайвих пробілів)
                }
            }

            // - Username 
            if (!string.IsNullOrWhiteSpace(dto.Username))
            {
                var usernameTrim = dto.Username.Trim();
                var usernameNorm = usernameTrim.ToLower();

                var currentNameNorm = (user.Username ?? string.Empty).ToLower();
                if (currentNameNorm != usernameNorm)
                {
                    var nameTaken = await _db.Users
                        .AsNoTracking()
                        .AnyAsync(u => u.Id != id && u.Username.ToLower() == usernameNorm);

                    if (nameTaken)
                        throw new InvalidOperationException("Користувач з таким ім'ям вже існує");

                    user.Username = usernameTrim;
                }
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new UserProfileDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                Role = user.Role,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id={id} not found");

            // Перевіряємо залежності, щоб не впасти на FK-обмеженнях
            var hasAlbums = await _db.Albums.AnyAsync(a => a.OwnerId == id);
            var hasPlaylists = await _db.Playlists.AnyAsync(p => p.OwnerId == id);
            var hasTracks = await _db.Tracks.AnyAsync(t => t.Album.OwnerId == id);

            if (hasAlbums || hasPlaylists || hasTracks)
                throw new InvalidOperationException(
                    "Cannot hard delete user: there are related albums/playlists/tracks. " +
                    "Transfer or delete related entities first.");

            _db.Users.Remove(user); // - фізичне видалення
            //user.IsBlocked = true; // - лише бллокування
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

        public async Task SetAvatarAsync(int userId, string url)
        {
            var (actorId, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorId != userId)
                throw new UnauthorizedAccessException("You cannot update another user's avatar.");

            var user = await _db.Users.FindAsync(userId)
                       ?? throw new KeyNotFoundException($"User {userId} not found");
            user.AvatarUrl = url;
            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        public async Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload p)
        {
            var email = p.Email.Trim().ToLowerInvariant();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null)
            {
                if (user.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
                return user;
            }

            // наша модель вимагає PasswordHash/Salt - зробимо рандомний пароль і захешуємо так само, як у AuthService
            CreatePasswordHash(Guid.NewGuid().ToString("N"), out var hash, out var salt);

            user = new UserEntity
            {
                Username = await MakeUniqueUsernameAsync(email.Split('@')[0]),
                Email = email,
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = UserRole.User,
                AvatarUrl = p.Picture,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        private async Task<string> MakeUniqueUsernameAsync(string baseName)
        {
            var candidate = baseName;
            var i = 0;
            while (await _db.Users.AnyAsync(u => u.Username == candidate))
                candidate = $"{baseName}{++i}";
            return candidate;
        }

        // аналогічно  AuthService.CreatePasswordHash
        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }



    }
}