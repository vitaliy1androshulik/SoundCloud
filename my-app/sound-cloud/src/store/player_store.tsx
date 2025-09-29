// store/player_store.ts
import { create } from "zustand";
import { PlayerContextType } from "../types/player_context";
import { ITrack } from "../types/track";
import api from "../utilities/axiosInstance.ts";
import { createRef } from "react";

export const usePlayerStore = create<PlayerContextType>((set, get) => ({
    track: null,
    isPlaying: false,
    playlist: [] as ITrack[],
    currentIndex: -1,
    currentAlbumId: null,
    history: [],
    audioRef: createRef<HTMLAudioElement>(), // 🔹 додаємо глобальний ref
    volume: 1, // дефолтна гучність

    setVolume: (volume: number) => {
        set({ volume });
        const audio = get().audioRef.current;
        if (audio) audio.volume = volume;
    },

    setCurrentTrack: (track: ITrack | null, autoplay = false) => {
        set({ track, isPlaying: false });
        if (autoplay && get().audioRef.current && track) {
            const audio = get().audioRef.current;
            audio.src = `http://localhost:5122${track.url}`;
            audio.play().catch(console.error);
        }
    },
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

        // 🔹 Автовідтворення через глобальний audioRef
        const audio = get().audioRef.current;
        if (audio) {
            audio.src = `http://localhost:5122${track.url}`;
            audio.play().catch(console.error);
        }

        // Можна тут додати POST на /play, якщо треба
        api.post(`http://localhost:5122/api/Track/${track.id}/play`).catch(console.error);
    },

    togglePlay: () => {
        set((state) => {
            const audio = state.audioRef.current;
            if (audio) {
                if (state.isPlaying) audio.pause();
                else audio.play().catch(console.error);
            }
            return { isPlaying: !state.isPlaying };
        });
    },

    addToHistory: (track) => {
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
                const merged = [
                    ...(state.history ?? []).filter(Boolean),
                    ...serverHistory.filter(
                        t => t && !(state.history ?? []).some(h => h && h.id === t.id)
                    )
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
    },

    clearTrack: () => {
        set({
            track: null,
            playlist: [],
            currentIndex: -1,
            currentAlbumId: null,
            isPlaying: false
        });

        const audio = get().audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = "";
        }
    },
    nextTrack: () => {
        const { playlist, currentIndex } = get();
        if (!playlist || playlist.length === 0) return;
        const nextIndex = (currentIndex + 1) % playlist.length;
        const track = playlist[nextIndex];
        set({ track, currentIndex: nextIndex, isPlaying: true });
        get().addToHistory(track);

        const audio = get().audioRef.current;
        if (audio) {
            audio.src = `http://localhost:5122${track.url}`;
            audio.play().catch(console.error);
        }
    },

    previousTrack: () => {
        const { playlist, currentIndex } = get();
        if (!playlist || playlist.length === 0) return;
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        const track = playlist[prevIndex];
        set({ track, currentIndex: prevIndex, isPlaying: true });
        get().addToHistory(track);

        const audio = get().audioRef.current;
        if (audio) {
            audio.src = `http://localhost:5122${track.url}`;
            audio.play().catch(console.error);
        }
    },
}));
