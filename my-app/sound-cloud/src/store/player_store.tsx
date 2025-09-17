import { create } from "zustand";
import {PlayerContextType} from "../types/player_context.ts";
import {ITrack} from "../types/track.ts";


export const usePlayerStore = create<PlayerContextType>((set, get) => ({
    track: null,
    isPlaying: false,
    playlist: [] as ITrack[], // список треків
    currentIndex: -1,
    history: JSON.parse(localStorage.getItem('trackHistory') || '[]'),
    pauseTrack:(track) => {set({track, isPlaying:false})},
    playTrack: (track, playlist) => {
        const list = playlist || get().playlist; // якщо список передали — оновлюємо
        const index = list.findIndex((t) => t.id === track.id);

        set({
            track,
            isPlaying: true,
            playlist: list,
            currentIndex: index,
        });
        get().addToHistory(track);
    },
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    addToHistory: (track) => {
        set((state) => {
            const newHistory = [track, ...state.history.filter(t => t.id !== track.id)];
            localStorage.setItem('trackHistory', JSON.stringify(newHistory));
            return { history: newHistory };
        });
    },
    nextTrack: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;

        const nextIndex = (currentIndex + 1) % playlist.length;
        set({
            track: playlist[nextIndex],
            currentIndex: nextIndex,
            isPlaying: true,
        });
    },

    previousTrack: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;

        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        set({
            track: playlist[prevIndex],
            currentIndex: prevIndex,
            isPlaying: true,
        });
    },

}));