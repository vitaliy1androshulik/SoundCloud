namespace SoundCloudWebApi.Models.Auth
{
    public class UserFollowDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public bool IsFollowing { get; set; }

    }

}
