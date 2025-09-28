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


        }
    }
}
