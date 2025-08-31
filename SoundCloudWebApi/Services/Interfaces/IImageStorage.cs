namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IImageStorage
    {
        Task<string> SaveAsync(IFormFile file, string subfolder);
    }

}
