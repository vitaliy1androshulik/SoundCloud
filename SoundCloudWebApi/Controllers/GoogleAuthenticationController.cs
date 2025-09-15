using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Abstractions;
using SoundCloudWebApi.Services.Interfaces;
using System;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

//namespace SoundCloudWebApi.Controllers
//{
//    [ApiController]
//    [Route("auth")]
//    public class GoogleAuthenticationController : ControllerBase
//    {
//        private readonly SoundCloudDbContext _db;
//        private const string GoogleClientId = "986105905707-gn40n3fflbopald38eletrf8vf7i58i7.apps.googleusercontent.com";

//        public GoogleAuthenticationController(SoundCloudDbContext db)
//        {
//            _db = db;
//        }

//        // POST: /auth/google
//        [HttpPost("google")]
//        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest request)
//        {
//            if (string.IsNullOrEmpty(request.Token))
//                return BadRequest(new { error = "Token is required" });

//            try
//            {
//                // 1️⃣ Валідація токена Google
//                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, new GoogleJsonWebSignature.ValidationSettings
//                {
//                    Audience = new[] { GoogleClientId }
//                });

//                // 2️⃣ Пошук існуючого користувача
//                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);

//                if (user == null)
//                {
//                    // 3️⃣ Створення нового користувача без пароля
//                    user = new UserEntity
//                    {
//                        Username = payload.Name ?? payload.Email.Split('@')[0],
//                        Email = payload.Email,
//                        AvatarUrl = payload.Picture,
//                        PasswordHash = Array.Empty<byte>(),
//                        PasswordSalt = Array.Empty<byte>(),
//                        Role = UserRole.User,
//                        CreatedAt = DateTime.UtcNow
//                    };

//                    _db.Users.Add(user);
//                    await _db.SaveChangesAsync();
//                }
//                else
//                {
//                    // 4️⃣ Якщо користувач існує, оновлюємо ім’я/аватар
//                    user.Username = payload.Name ?? user.Username;
//                    user.AvatarUrl = payload.Picture ?? user.AvatarUrl;
//                    user.UpdatedAt = DateTime.UtcNow;
//                    await _db.SaveChangesAsync();
//                }

//                // 5️⃣ Повертаємо користувача на фронт
//                return Ok(new
//                {
//                    user.Id,
//                    user.Username,
//                    user.Email,
//                    user.AvatarUrl
//                });
//            }
//            catch (Exception ex)
//            {
//                return Unauthorized(new { error = ex.Message });
//            }
//        }
//    }

//    // Модель для отримання токена з JSON
//    public class TokenRequest
//    {
//        public string Token { get; set; }
//    }
//}

namespace SoundCloudWebApi.Controllers
{
    [ApiController]
    [Route("auth")]
    public class GoogleAuthenticationController : ControllerBase
    {
        private readonly IGoogleTokenValidator _google;
        private readonly IUserService _users;
        private readonly IAuthService _auth;

        public GoogleAuthenticationController(
            IGoogleTokenValidator google,
            IUserService users,
            IAuthService auth)
        {
            _google = google;
            _users = users;
            _auth = auth;
        }

        public class TokenRequest { public string Token { get; set; } }

        [AllowAnonymous]
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Token))
                return BadRequest(new { error = "Token is required" });


            using var httpClient = new HttpClient();

            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", req.Token);

            //configuration
            string userInfo = "https://www.googleapis.com/oauth2/v2/userinfo";
            var response = await httpClient.GetAsync(userInfo);

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            var googleUser = JsonSerializer.Deserialize<GoogleAccountModel>(json);


            var payload = await _google.ValidateAsync(req.Token);
            var user = await _users.FindOrCreateFromGoogleAsync(payload);


            var jwt = _auth.IssueJwtForUser(user);

            return Ok(new AuthResponseDto
            {
                Token = jwt,
                ExpiresAt = System.DateTime.UtcNow.AddHours(1),
                Username = user.Username
            });
        }
    }
}
