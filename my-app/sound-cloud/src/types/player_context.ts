import { ITrack } from "./track";
import {RefObject} from "react";

export interface PlayerContextType {
    track: ITrack | null;
    isPlaying: boolean;
    history: ITrack[];
    playlist: ITrack[];
    currentIndex: number;
    currentAlbumId: number | null; // завжди присутнє, може бути null
    audioRef: RefObject<HTMLAudioElement>;
    volume: number; // нове поле

    playTrack: (track: ITrack, playlist?: ITrack[], albumId?: number | null) => void;
    pauseTrack: () => void; // без аргументів
    togglePlay: () => void;
    addToHistory: (track: ITrack) => void;
    nextTrack: () => void;
    previousTrack: () => void;
    refreshHistory: () => Promise<void>;
    initHistory:()=>void;
    clearTrack: () => void;
    setVolume: (volume: number) => void; // новий метод
    setCurrentTrack: (track: ITrack | null) => void;
}