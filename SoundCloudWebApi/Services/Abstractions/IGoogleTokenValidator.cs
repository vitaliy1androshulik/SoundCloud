using Google.Apis.Auth;

namespace SoundCloudWebApi.Services.Abstractions;

public interface IGoogleTokenValidator
{
    Task<GoogleJsonWebSignature.Payload> ValidateAsync(string idToken);
}
