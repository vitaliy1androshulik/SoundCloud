using FluentValidation;
using SoundCloudWebApi.Models.Track;

namespace SoundCloudWebApi.Validators.Track
{
    public class UpdateTrackValidator : AbstractValidator<UpdateTrackDto>
    {
        public UpdateTrackValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().MaximumLength(200)
                .WithMessage("Title має бути валідним");

            RuleFor(x => x.AuthorId)
                .Null()
                .WithMessage("Немає автора");

            RuleFor(x => x.Duration)
                .Must(d => d > TimeSpan.Zero)
                .WithMessage("Тривалість має бути більше 0");
        }
    }
}
