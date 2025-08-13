using FluentValidation;
using SoundCloudWebApi.Models.Album;

namespace SoundCloudWebApi.Validators.Album
{
    public class CreateAlbumValidator : AbstractValidator<CreateAlbumDto>
    {
        public CreateAlbumValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Назва альбому обов'язкова")
                .MaximumLength(200);

            // якщо колонка Description у БД NOT NULL — NotEmpty(); інакше лиши тільки MaximumLength
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Опис альбому обов'язковий")
                .MaximumLength(1000);
        }
    }
}
