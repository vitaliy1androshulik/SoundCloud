using Microsoft.Extensions.Configuration;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
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
            // ...................: реалізація реєстрації
            throw new NotImplementedException();     // ← ось це повертає виняток
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            // ..............: реалізація логіну
            throw new NotImplementedException();     // ← і тут
        }
    }
}
