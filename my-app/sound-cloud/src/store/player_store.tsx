// store/player_store.ts
import { create } from "zustand";
import { PlayerContextType } from "../types/player_context";
import { ITrack } from "../types/track";
import api from "../utilities/axiosInstance.ts";

export const usePlayerStore = create<PlayerContextType>((set, get) => ({
    track: null,
    isPlaying: false,
    playlist: [] as ITrack[],
    currentIndex: -1,
    currentAlbumId: null,
    history: [],

    pauseTrack: () => {
        set({ isPlaying: false });
    },

    playTrack: (track, playlist, albumId = null) => {
        const list = playlist || get().playlist;
        const index = list.findIndex((t) => t.id === track.id);

        set({
            track,
            isPlaying: true,
            playlist: list,
            currentIndex: index,
            currentAlbumId: albumId,
        });

        get().addToHistory(track);
    },

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    addToHistory: (track) => {
        // локальне оновлення
        set((state) => {
            const newHistory = [track, ...state.history.filter(t => t.id !== track.id)];
            localStorage.setItem("trackHistory", JSON.stringify(newHistory));
            return { history: newHistory };
        });

    },

    refreshHistory: async () => {
        try {
            const res = await api.get("/Track/all");
            const serverHistory: ITrack[] = res.data;

            set((state) => {
                // об’єднуємо локальні та серверні дані
                const merged = [
                    ...state.history,
                    ...serverHistory.filter(t => !state.history.some(h => h.id === t.id))
                ];
                localStorage.setItem("trackHistory", JSON.stringify(merged));
                return { history: merged };
            });
        } catch (err) {
            console.error("refreshHistory failed:", err);
        }
    },

    initHistory: () => {
        if (typeof window === "undefined") return;

        const raw = localStorage.getItem("trackHistory");
        if (raw) {
            try {
                const parsed: ITrack[] = JSON.parse(raw);
                set({ history: parsed });
            } catch (err) {
                console.warn("initHistory parse error", err);
            }
        }

        // get().refreshHistory(); // ❌ більше не викликаємо автоматично
    },

    nextTrack: () => {
        const { playlist, currentIndex } = (get() as any); // додай playlist у state якщо є
        if (!playlist || playlist.length === 0) return;
        const nextIndex = (currentIndex + 1) % playlist.length;
        const track = playlist[nextIndex];
        set({ track, currentIndex: nextIndex, isPlaying: true });
        get().addToHistory(track);
    },

    previousTrack: () => {
        const { playlist, currentIndex } = (get() as any);
        if (!playlist || playlist.length === 0) return;
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        const track = playlist[prevIndex];
        set({ track, currentIndex: prevIndex, isPlaying: true });
        get().addToHistory(track);
    },
}));
