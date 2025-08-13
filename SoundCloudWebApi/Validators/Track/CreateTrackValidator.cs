using FluentValidation;
using SoundCloudWebApi.Models.Track;

namespace SoundCloudWebApi.Validators.Track
{
    public class CreateTrackValidator : AbstractValidator<CreateTrackDto>
    {
        public CreateTrackValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().MaximumLength(200);

            RuleFor(x => x.Url)
                .NotEmpty()
                .Must(u => Uri.IsWellFormedUriString(u, UriKind.Absolute))
                .WithMessage("URL має бути валідним");

            RuleFor(x => x.Duration)
                .Must(d => d > TimeSpan.Zero)
                .WithMessage("Тривалість має бути більше 0");

            RuleFor(x => x.AlbumId)
                .GreaterThan(0);
        }
    }
}
