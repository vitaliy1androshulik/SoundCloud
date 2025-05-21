namespace SoundCloudWebApi.Models.Category;

public class CategoryCreateModel
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public IFormFile? ImageFile { get; set; } = null;
}
