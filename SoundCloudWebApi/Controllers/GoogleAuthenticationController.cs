using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using System;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Controllers
{
    [ApiController]
    [Route("auth")]
    public class GoogleAuthenticationController : ControllerBase
    {
        private readonly SoundCloudDbContext _db;
        private const string GoogleClientId = "986105905707-gn40n3fflbopald38eletrf8vf7i58i7.apps.googleusercontent.com";

        public GoogleAuthenticationController(SoundCloudDbContext db)
        {
            _db = db;
        }

        // POST: /auth/google
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request.Token))
                return BadRequest(new { error = "Token is required" });

            try
            {
                // 1️⃣ Валідація токена Google
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { GoogleClientId }
                });

                // 2️⃣ Пошук існуючого користувача
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

                if (user == null)
                {
                    // 3️⃣ Створення нового користувача без пароля
                    user = new UserEntity
                    {
                        Username = payload.Name ?? payload.Email.Split('@')[0],
                        Email = payload.Email,
                        AvatarUrl = payload.Picture,
                        PasswordHash = Array.Empty<byte>(),
                        PasswordSalt = Array.Empty<byte>(),
                        Role = UserRole.User,
                        CreatedAt = DateTime.UtcNow
                    };

                    _db.Users.Add(user);
                    await _db.SaveChangesAsync();
                }
                else
                {
                    // 4️⃣ Якщо користувач існує, оновлюємо ім’я/аватар
                    user.Username = payload.Name ?? user.Username;
                    user.AvatarUrl = payload.Picture ?? user.AvatarUrl;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                // 5️⃣ Повертаємо користувача на фронт
                return Ok(new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.AvatarUrl
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }
    }

    // Модель для отримання токена з JSON
    public class TokenRequest
    {
        public string Token { get; set; }
    }
}
