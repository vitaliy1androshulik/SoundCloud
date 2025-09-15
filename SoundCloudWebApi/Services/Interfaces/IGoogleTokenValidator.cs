namespace SoundCloudWebApi.Interfaces
{
    using System.Threading.Tasks;
    using Google.Apis.Auth;

    public interface IGoogleTokenValidator
    {
        Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken);
    }
}
