import { create } from "zustand";
import {PlayerContextType} from "../types/player_context.ts";


export const usePlayerStore = create<PlayerContextType>((set) => ({
    track: null,
    isPlaying: false,
    playTrack: (track) => set({ track, isPlaying: true }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));