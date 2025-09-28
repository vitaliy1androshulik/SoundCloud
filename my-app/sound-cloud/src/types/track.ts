export interface ITrack {
    id: number;
    title: string;
    author: string;
    playCount: number;
    genre: string;
    duration: string;
    isHidden: boolean;
    albumId?: number;
    url: string;
    imageUrl?: string;

    // нове поле
    isLikedByCurrentUser?: boolean;  // опціонально, бо може бути undefined
}
