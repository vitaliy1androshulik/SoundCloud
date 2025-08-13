using FluentValidation;
using SoundCloudWebApi.Models.Auth;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;

namespace SoundCloudWebApi.Validators.Auth
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        private readonly SoundCloudDbContext _db; // поле для доступу до БД
        public RegisterRequestValidator(SoundCloudDbContext db)
        {
            _db = db;

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username обов'язковий")
                //.MinimumLength(3).WithMessage("Username має містити хоча б 3 символи");
                .Length(3, 30).WithMessage("Довжина імені 3–30 символів")
                .Matches(@"^[A-Za-z0-9_.-]+$").WithMessage("Дозволені лише латинські літери, цифри, _, . , -")
                .MustAsync(UniqueUsername).WithMessage("Користувач з таким ім'ям вже існує");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обов'язковий")
                .EmailAddress().WithMessage("Некоректний формат Email")
                .MustAsync(UniqueEmail).WithMessage("Користувач з таким email вже існує");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password обов'язковий")
                .MinimumLength(6).WithMessage("Password має містити хоча б 6 символів");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword обов'язковий")
                .Equal(x => x.Password).WithMessage("ConfirmPassword має збігатися з Password");
        }

        // Перевірки унікальності (кастомні методи)
        private async Task<bool> UniqueUsername(string username, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(username)) return false;
            return !await _db.Users
                .AsNoTracking()
                .AnyAsync(u => u.Username.ToLower() == username.ToLower(), ct);
        }

        private async Task<bool> UniqueEmail(string email, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            return !await _db.Users
                .AsNoTracking()
                .AnyAsync(u => u.Email.ToLower() == email.ToLower(), ct);
        }
    }
}

