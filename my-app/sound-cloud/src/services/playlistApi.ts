import { IPlaylist } from "../types/playlist";
import api from "../utilities/axiosInstance.ts";
import { ITrack } from "../types/track"; // шлях підкоригуй під свій проект

// Новий інтерфейс для створення плейліста
export interface ICreatePlaylist {
    name: string;
    ownerId: number;
    coverUrl?: string; // додали опційне поле
}

export const playlistService = {
    getAll: async (): Promise<IPlaylist[]> => {
        const { data } = await api.get("/Playlist");
        return data;
    },

    create: async (dto: ICreatePlaylist): Promise<IPlaylist> => {
        const { data } = await api.post("/Playlist", dto);
        return data;
    },

    getById: async (id: number): Promise<IPlaylist> => {
        const { data } = await api.get(`/Playlist/${id}`);
        return data;
    },

    update: async (id: number, dto: { name: string; coverUrl?: string }): Promise<void> => {
        await api.put(`/Playlist/${id}`, dto);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Playlist/${id}`);
    },

    // --- нові методи для треків у плейліст ---
    addTrack: async (playlistId: number, trackId: number): Promise<void> => {
        await api.post(`/Playlist/${playlistId}/tracks/${trackId}`);
    },

    removeTrack: async (playlistId: number, trackId: number): Promise<void> => {
        await api.delete(`/Playlist/${playlistId}/tracks/${trackId}`);
    },

    // playlistApi.ts
    getTracks: async (playlistId: number): Promise<ITrack[]> => {
        const { data } = await api.get(`/Playlist/${playlistId}/tracks`);
        return data;
    }

};
