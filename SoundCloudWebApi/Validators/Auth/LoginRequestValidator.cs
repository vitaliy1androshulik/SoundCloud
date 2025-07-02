using FluentValidation;
using SoundCloudWebApi.Models.Auth;

namespace SoundCloudWebApi.Validators.Auth
{
    public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обов'язковий")
                .EmailAddress().WithMessage("Некоректний формат Email");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password обов'язковий");
        }
    }
}

