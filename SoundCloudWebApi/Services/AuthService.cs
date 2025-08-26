using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(SoundCloudDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            // Перевірка, чи користувач з таким email вже існує
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            {
                throw new InvalidOperationException("Користувач з таким email вже існує.");
            }

            if (await _db.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                throw new InvalidOperationException("Користувач з таким ім'ям вже існує.");

            // Хешування пароля
            CreatePasswordHash(dto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new UserEntity
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Генерація JWT-токена
            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                Username = user.Username
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt))
            {
                throw new UnauthorizedAccessException("Неправильний email або пароль.");
            }

            if (user.IsBlocked)
            {
                throw new UnauthorizedAccessException("Користувач заблокований.");
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                Username = user.Username
            };
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using var hmac = new HMACSHA512(storedSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(storedHash);
        }

        private string GenerateJwtToken(UserEntity user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = creds,
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<UserProfileDto> GetUserProfileAsync(string userId)
        {
            var user = await _db.Users
                .Where(u => u.Id.ToString() == userId)
                .Select(u => new
                {
                   u.Id,
                   u.Username,
                   u.Email,
                   u.CreatedAt,
                   u.Role,
                   u.IsBlocked
                })
                .FirstOrDefaultAsync();

            //if (user == null)
            //{
            //    return null;
            //}
            //// Додаткова перевірка блокування
            //var isBlocked = await _db.Users
            //    .Where(u => u.Id.ToString() == userId)
            //    .Select(u => u.IsBlocked)
            //    .FirstOrDefaultAsync();

            //if (isBlocked)
            //{
            //    throw new UnauthorizedAccessException("Користувач заблокований.");
            //}

            //return user;

            if (user == null)
                throw new KeyNotFoundException("Користувач не знайдений.");

            if (user.IsBlocked)
                throw new UnauthorizedAccessException("Користувач заблокований.");

            return new UserProfileDto
            {
                Id = user.Id.ToString(),
                Username = user.Username,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };
        }
    }
}
