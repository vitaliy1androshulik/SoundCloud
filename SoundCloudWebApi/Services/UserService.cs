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
using SoundCloudWebApi.Models.Track;
using System;


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

        //public async Task<UserProfileDto> GetByIdAsync(int id)
        //{
        //    return await _db.Users
        //        .Where(u => u.Id == id)
        //        .Select(u => new UserProfileDto
        //        {
        //            Id = u.Id.ToString(),
        //            Username = u.Username,
        //            Email = u.Email,
        //            Bio =u.Bio,
        //            CreatedAt = u.CreatedAt,
        //            AvatarUrl = u.AvatarUrl,
        //            Role = u.Role,
        //        })
        //        .FirstOrDefaultAsync()
        //        ?? throw new KeyNotFoundException($"User with id={id} not found");
        //}


        public async Task<UserProfileDto> GetByIdAsync(int id)
        {
            return await _db.Users
                .Where(u => u.Id == id)
                .Select(u => new UserProfileDto
                {
                    Id = u.Id.ToString(),
                    Username = u.Username,
                    Email = u.Email,
                    Bio = u.Bio,
                    CreatedAt = u.CreatedAt,
                    AvatarUrl = u.AvatarUrl,
                    BannerUrl = u.BannerUrl,  // <- додати це!
                    Role = u.Role,
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

            // --- Оновлення Email ---
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var emailTrim = dto.Email.Trim();
                var emailNorm = emailTrim.ToLower();

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

            // --- Оновлення Username ---
            if (!string.IsNullOrWhiteSpace(dto.Username))
            {
                // зберігаємо всі пробіли як є
                var usernameInput = dto.Username;

                // нормалізація тільки для перевірки унікальності: нижній регістр
                var usernameNorm = usernameInput.ToLower();
                var currentNameNorm = (user.Username ?? string.Empty).ToLower();

                if (currentNameNorm != usernameNorm)
                {
                    var nameTaken = await _db.Users
                        .AsNoTracking()
                        .AnyAsync(u => (u.Username ?? string.Empty).ToLower() == usernameNorm && u.Id != id);

                    if (nameTaken)
                        throw new InvalidOperationException("Користувач з таким ім'ям вже існує");

                    user.Username = usernameInput; // зберігаємо всі пробіли і символи
                }
            }

            // --- Оновлення Bio ---
            if (dto.Bio != null)
            {
                user.Bio = dto.Bio;
            }

            // --- Тут можна додати логіку для Avatar (завантаження файлу) ---
            if (dto.Avatar != null)
            {
                // Папка для аватарок
                var uploadsFolder = Path.Combine("wwwroot", "uploads", "avatars");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // Генеруємо унікальне ім'я файлу
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Avatar.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                // Зберігаємо файл
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Avatar.CopyToAsync(stream);
                }

                // Зберігаємо шлях у базі
                user.AvatarUrl = $"/uploads/avatars/{fileName}";

                await _db.SaveChangesAsync();
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return new UserProfileDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                Bio = user.Bio,  
                CreatedAt = user.CreatedAt,
                Role = user.Role,
                UpdatedAt = user.UpdatedAt,
                AvatarUrl = user.AvatarUrl 
            };
        }

        public async Task<string?> UpdateBannerAsync(int userId, IFormFile? bannerFile)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new Exception("User not found");

            if (bannerFile != null)
            {
                var uploadsFolder = Path.Combine("wwwroot", "uploads", "banner");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(bannerFile.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await bannerFile.CopyToAsync(stream);
                }

                user.BannerUrl = $"/uploads/banner/{fileName}";
            }
            else
            {
                user.BannerUrl = null;
            }

            await _db.SaveChangesAsync();
            return user.BannerUrl;
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException($"User with id={id} not found");

            // Перевіряємо залежності, щоб не впасти на FK-обмеженнях
            var hasAlbums = await _db.Albums.AnyAsync(a => a.OwnerId == id);
            var hasPlaylists = await _db.Playlists.AnyAsync(p => p.OwnerId == id);
            var hasTracks = await _db.AlbumTracks
                .Include(at => at.Album)
                .AnyAsync(at => at.Album.OwnerId == id);

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
        public async Task<IEnumerable<AuthorStatsDto>> GetTopUsersAsync(int take)
        {
            var topUsers = await _db.TrackListens
                    .Include(x => x.User) 
                    .GroupBy(x => x.UserId)
                    .Select(g => new AuthorStatsDto
                    {
                        UserId = g.Key,
                        Username = g.First().User.Username,
                        AvatarUrl = g.First().User.AvatarUrl,
                        TotalPlays = g.Sum(x => x.PlayCount)
                    })
                    .OrderByDescending(x => x.TotalPlays)
                    .Take(take)
                    .ToListAsync();

            return topUsers;
        }

        public async Task<UserEntity> FindOrCreateFromGoogleAsync(GoogleJsonWebSignature.Payload p)
        {
            if (p == null) throw new ArgumentNullException(nameof(p));
            //var email = p.Email.Trim().ToLowerInvariant();
            var email = (p.Email ?? "").Trim().ToLower();
            var subject = p.Subject ?? "";          // Google "sub" — стабільний ідентифікатор
            var picture = p.Picture;

            // шукаємо по GoogleSubject 
            var u = await _db.Users.FirstOrDefaultAsync(x => x.GoogleSubject == subject);
            if (u != null)
            {
                if (u.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
                bool dirty = false;
                if (!string.IsNullOrEmpty(picture) && u.AvatarUrl != picture)
                {
                    u.AvatarUrl = picture;
                    dirty = true;
                }

                // FIX для "старих" записів: якщо локального пароля нема — вважаємо google-only
                if (u.IsLocalPasswordSet == false && u.AuthProvider != AuthProvider.Google)
                {
                    u.AuthProvider = AuthProvider.Google;
                    dirty = true;
                }

                if (dirty)
                {
                    u.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                return u;
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            if (user != null)
            {
                if (user.IsBlocked) throw new UnauthorizedAccessException("User is blocked");
                // Лінкуємо Google до існуючого акаунта
                if (string.IsNullOrEmpty(user.GoogleSubject))
                {
                    user.GoogleSubject = p.Subject;
                    if (!string.IsNullOrEmpty(picture) && user.AvatarUrl != picture) 
                        user.AvatarUrl = picture;            

                    // FIX для "старих" записів, створених з Google, але без правильних міток:
                    // якщо локального пароля нема (IsLocalPasswordSet == false), = google-only
                    if (user.IsLocalPasswordSet == false)
                    {
                        user.AuthProvider = AuthProvider.Google;
                    }

                    user.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                return user;
            }

            //// наша модель вимагає PasswordHash/Salt - зробимо рандомний пароль і захешуємо так само, як у AuthService
            //CreatePasswordHash(Guid.NewGuid().ToString("N"), out var hash, out var salt);

            user = new UserEntity
            {
                Username = await MakeUniqueUsernameAsync(email.Split('@')[0]),
                Email = email,
                AuthProvider = AuthProvider.Google, //  ключове
                GoogleSubject = subject,          //  ключове
                IsLocalPasswordSet = false,         //  ключове
                //PasswordHash = hash,
                //PasswordSalt = salt,
                PasswordHash = Array.Empty<byte>(),
                PasswordSalt = Array.Empty<byte>(),
                Role = UserRole.User,
                AvatarUrl = picture,
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