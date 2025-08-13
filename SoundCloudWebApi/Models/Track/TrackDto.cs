using System;

namespace SoundCloudWebApi.Models.Track
{
    public class TrackDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public TimeSpan Duration { get; set; }
        public bool IsHidden { get; set; }
    }

}
