import {ITrack} from "./track.ts";

export interface PlayerContextType {
    track: ITrack | null;
    isPlaying: boolean;
    history: ITrack[];
    playlist: ITrack[];

    playTrack: (track: ITrack, playlist?: ITrack[]) => void;
    pauseTrack: (track: ITrack) => void;
    togglePlay: () => void;
    addToHistory: (track: ITrack) => void;
    nextTrack: () => void;

    previousTrack: () => void;

    currentIndex: number; // поточний плейлист

}