using SoundCloudWebApi.Models;

public interface ISearchService
{
    /// <summary>
    /// Виконує пошук по треках, альбомах, плейлистах та користувачах.
    /// </summary>
    /// <param name="q">Пошуковий запит</param>
    /// <param name="trackPage">Сторінка треків</param>
    /// <param name="trackPageSize">Кількість треків на сторінку</param>
    /// <param name="albumPage">Сторінка альбомів</param>
    /// <param name="albumPageSize">Кількість альбомів на сторінку</param>
    /// <param name="playlistPage">Сторінка плейлистів</param>
    /// <param name="playlistPageSize">Кількість плейлистів на сторінку</param>
    /// <param name="userPage">Сторінка користувачів</param>
    /// <param name="userPageSize">Кількість користувачів на сторінку</param>
    /// <param name="types">Які типи об’єктів шукати: tracks, albums, playlists, users</param>
    /// <returns>Результат пошуку</returns>
    Task<SearchResponseDto> SearchAsync(
        string q,
        int trackPage = 1,
        int trackPageSize = 8,
        int albumPage = 1,
        int albumPageSize = 6,
        int playlistPage = 1,
        int playlistPageSize = 6,
        int userPage = 1,
        int userPageSize = 6,
        string[]? types = null
    );
}