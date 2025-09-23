import { ITrack } from "./track";

export interface PlayerContextType {
    track: ITrack | null;
    isPlaying: boolean;
    history: ITrack[];
    playlist: ITrack[];
    currentIndex: number;
    currentAlbumId: number | null; // завжди присутнє, може бути null

    playTrack: (track: ITrack, playlist?: ITrack[], albumId?: number | null) => void;
    pauseTrack: () => void; // без аргументів
    togglePlay: () => void;
    addToHistory: (track: ITrack) => void;
    nextTrack: () => void;
    previousTrack: () => void;
}