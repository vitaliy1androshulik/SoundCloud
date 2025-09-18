using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Options;
using SoundCloudWebApi.Services.Abstractions;
using SoundCloudWebApi.Services.Interfaces;
using System;
using System.Net.Http.Headers;
using System.Security;
using System.Text.Json;
using System.Threading.Tasks;

//namespace SoundCloudWebApi.Controllers  // варіант 2
//{
//    [ApiController]
//    [Route("auth")]
//    public class GoogleAuthenticationController : ControllerBase
//    {
//        private readonly SoundCloudDbContext _db;

//        public GoogleAuthenticationController(SoundCloudDbContext db)
//        {
//            _db = db;
//        }

//        [HttpPost("google")]
//        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest request)
//        {
//            if (string.IsNullOrEmpty(request.Token))
//                return BadRequest(new { error = "Token is required" });

//            try
//            {
//                using var httpClient = new HttpClient();
//                httpClient.DefaultRequestHeaders.Authorization =
//                    new AuthenticationHeaderValue("Bearer", request.Token);

//                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
//                if (!response.IsSuccessStatusCode)
//                    return Unauthorized(new { error = "Invalid Google access token" });

//                var json = await response.Content.ReadAsStringAsync();
//                var googleUser = JsonSerializer.Deserialize<GoogleAccountModel>(json);

//                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == googleUser.Email);

//                if (user == null)
//                {
//                    user = new UserEntity
//                    {
//                        Username = googleUser.FirstName ?? googleUser.Email.Split('@')[0],
//                        Email = googleUser.Email,
//                        AvatarUrl = googleUser.Picture,
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
//                    user.Username = googleUser.FirstName ?? user.Username;
//                    user.AvatarUrl = googleUser.Picture ?? user.AvatarUrl;
//                    user.UpdatedAt = DateTime.UtcNow;
//                    await _db.SaveChangesAsync();
//                }

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
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }
//    }

//    public class TokenRequest
//    {
//        public string Token { get; set; }
//    }
//}


namespace SoundCloudWebApi.Controllers // варіант 3
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

        public class TokenRequest { public string Token { get; set; } = ""; }

        [AllowAnonymous]
        [HttpPost("google")]
        //public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest req)
        public async Task<IActionResult> GoogleLogin(
            [FromBody] TokenRequest req,
            [FromServices] IOptions<GoogleAuthOptions> opts // щоб логувати очікуваний ClientId
            )
        {

            if (string.IsNullOrWhiteSpace(req?.Token))
                return BadRequest(new { error = "Token is required" });

            // 0) Швидка перевірка формату ID-token (має бути JWT з 2 крапками)
            var dots = req.Token.Count(c => c == '.');
            Console.WriteLine($"[AUTH/GOOGLE] token.len={req.Token.Length}, dots={dots}, sample='{req.Token[..Math.Min(20, req.Token.Length)]}...'");
            Console.WriteLine($"[AUTH/GOOGLE] expected ClientId={opts.Value.ClientId}");

            if (dots != 2)
                return BadRequest(new { error = "Provided token is not a Google ID token (must contain two dots)." });

            try
            {
                // 1) Перевіряємо САМЕ Google ID token (JWT: "eyJ...": дві крапки)
                var payload = await _google.ValidateAsync(req.Token);

                Console.WriteLine($"[AUTH/GOOGLE] iss={payload.Issuer}, aud={payload.Audience}, sub={payload.Subject}, email={payload.Email}, verified={payload.EmailVerified}");

                // 2) Знаходимо/створюємо юзера
                var user = await _users.FindOrCreateFromGoogleAsync(payload);

                // 3) Видаємо наш короткий JWT для доступу до API
                var jwt = _auth.IssueJwtForUser(user);

                // 4) Повертаємо токен + базову інфу (зручно фронту)
                return Ok(new
                {
                    token = jwt,
                    expiresAt = System.DateTime.UtcNow.AddHours(1),
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    avatarUrl = user.AvatarUrl
                });
            }
            catch (InvalidJwtException ex)
            {
                Console.WriteLine("[AUTH/GOOGLE] InvalidJwtException: " + ex);
                return BadRequest(new { error = "Invalid Google ID token: " + ex.Message });
                throw;
            }
            catch (SecurityException ex)
            {
                Console.WriteLine("[AUTH/GOOGLE] SecurityException: " + ex);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine("[AUTH/GOOGLE] ERROR: " + ex);
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}