using FluentValidation;
using SoundCloudWebApi.Models.Playlist;

namespace SoundCloudWebApi.Validators.Playlist
{
    public class CreatePlaylistValidator : AbstractValidator<CreatePlaylistDto>
    {
        public CreatePlaylistValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Назва плейлиста обов'язкова")
                .MaximumLength(200);
        }
    }
}
