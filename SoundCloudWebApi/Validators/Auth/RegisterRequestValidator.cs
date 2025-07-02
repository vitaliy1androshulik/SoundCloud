using FluentValidation;
using SoundCloudWebApi.Models.Auth;

namespace SoundCloudWebApi.Validators.Auth
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username обов'язковий")
                .MinimumLength(3).WithMessage("Username має містити хоча б 3 символи");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обов'язковий")
                .EmailAddress().WithMessage("Некоректний формат Email");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password обов'язковий")
                .MinimumLength(6).WithMessage("Password має містити хоча б 6 символів");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword обов'язковий")
                .Equal(x => x.Password).WithMessage("ConfirmPassword має збігатися з Password");
        }
    }
}

