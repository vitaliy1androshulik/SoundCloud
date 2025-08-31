namespace SoundCloudWebApi.Models.Category
{
    public class CategoryUpdateModel
    {
        public string Name { get; set; } = "";
        public string Slug { get; set; } = "";
        public IFormFile? ImageFile { get; set; }
    }
}
