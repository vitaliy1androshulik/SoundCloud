using FluentValidation;
using SoundCloudWebApi.Models.Auth;
using SetPasswordDto = SoundCloudWebApi.Models.Auth.SetPasswordRequest;

namespace SoundCloudWebApi.Validators.Auth
{
    public class SetPasswordRequestValidator : AbstractValidator<SetPasswordDto>
    {
        public SetPasswordRequestValidator()
        {
            // ВАРІАНТ A: та саму політика як  у реєстрації (мінімум  6)
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password обов'язковий")
                .MinimumLength(6).WithMessage("Password має містити хоча б 6 символів");

            // ВАРІАНТ B (рекомендований): посилена політика (8+, великі/малі/цифра.....)
            /*
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password обов'язковий")
                .MinimumLength(8).WithMessage("Мінімальна довжина 8 символів")
                .Matches("[A-Z]").WithMessage("Має містити велику літеру")
                .Matches("[a-z]").WithMessage("Має містити малу літеру")
                .Matches("[0-9]").WithMessage("Має містити цифру");
            */

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("ConfirmPassword обов'язковий")
                .Equal(x => x.NewPassword).WithMessage("ConfirmPassword має збігатися з Password");
        }
    }
}
