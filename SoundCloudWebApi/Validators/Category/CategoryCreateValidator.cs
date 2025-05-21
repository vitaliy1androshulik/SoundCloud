using FluentValidation;
using SoundCloudWebApi.Models.Category;

namespace SoundCloudWebApi.Validators.Category;

public class CategoryCreateValidator : AbstractValidator<CategoryCreateModel>
{
    public CategoryCreateValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Ім'я є обов'язковим.")
            .MaximumLength(100)
            .WithMessage("Ім'я не повинно перевищувати 100 символів.");
        RuleFor(x => x.Slug)
            .NotEmpty()
            .WithMessage("Слаг є обов'язковим.")
            .MinimumLength(3)
            .WithMessage("Слаг повинен містити не менше 3 символів.")
            .MaximumLength(100)
            .WithMessage("Слаг не повинен перевищувати 100 символів.");
        RuleFor(x => x.ImageFile)
            .NotEmpty()
            .WithMessage("Фото є обов'язковим.")
            .Must(BeAValidImage)
            .WithMessage("Файл зображення має бути коректним зображенням.");
    }
    private bool BeAValidImage(IFormFile? file)
    {
        if (file == null) return true; // Дозволити null файли
        var validImageTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        return validImageTypes.Contains(file.ContentType);
    }
}
