export interface TrackSummary {
    id: number;
    title: string;
    author: string;
    imageUrl?: string | null;
    url: string;
    playCount: number;
}
export interface AlbumSummary {
    id: number;
    title: string;
    artist: string;
    imageUrl?: string | null;
    trackCount: number;
}
export interface PlaylistSummary {
    id: number;
    name: string;
    owner: string;
    imageUrl?: string | null;
    trackCount: number;
}
export interface UserSummary {
    id: number;
    username: string;
    avatarUrl?: string | null;
    tracksCount: number;
    playlistsCount: number;
}

export interface Paged<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
}
export interface SearchResponse {
    tracks: Paged<TrackSummary>;
    albums: Paged<AlbumSummary>;
    playlists: Paged<PlaylistSummary>;
    users: Paged<UserSummary>;
}