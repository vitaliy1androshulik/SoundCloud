import {ITrack} from "./track.ts";

export interface PlayerContextType {
    track: ITrack | null;
    isPlaying: boolean;
    playTrack: (track: ITrack) => void;
    togglePlay: () => void;
}