import { ITrack } from "../types/track";
import api from "../utilities/axiosInstance";
import axios from "axios";
import { TokenService } from "../utilities/tokenService.ts";

const API_URL = "http://localhost:5122/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${TokenService.getAccessToken()}`,
        "Content-Type": "application/json",
    },
});

export const trackService = {

    async getAll(): Promise<ITrack[]> {
        try {
            const res = await api.get("/Track/all");
            return res.data;
        } catch (error) {
            console.error("Failed to fetch tracks", error);
            throw error;
        }
    },

    // Отримати треки поточного користувача
    async getMyTracks(): Promise<ITrack[]> {
        try {
            const res = await api.get(`/Track/my`)
            return res.data;
        } catch (error) {
            console.error("Failed to fetch user tracks", error);
            throw error;
        }
    },

    // Отримати всі треки конкретного користувача
    getAllByUser: async (userId: number): Promise<ITrack[]> => {
        const res = await api.get<ITrack[]>(`/track/user/${userId}`);
        return res.data;
    },



    // Створити новий трек (усі поля обов'язкові)
    async createTrack(
        title: string,
        albumId?: number | null,
        file: File,
        cover: File,
        genreId: number
    ) {
        // Перевірка всіх обов'язкових полів
        if (!title || !file || !cover || genreId === undefined) {
            throw new Error("Missing required fields for track creation");
        }

        try {
            const formData = new FormData();

            formData.append("Title", title);
            const albumIds = albumId != null ? [albumId] : [];
            albumIds.forEach(id => formData.append("AlbumIds", id.toString()));
            formData.append("File", file);
            formData.append("Cover", cover);
            formData.append("GenreId", genreId.toString());

            console.log("Uploading track:", { title, albumIds, file, cover, genreId });

            const res = await api.post("/Track/create-file", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return res.data;
        } catch (error) {
            console.error("Failed to create track", error);
            throw error;
        }
    },
    updateTrack: async (id: number, formData: FormData): Promise<ITrack> => {
        const { data } = await api.put(`/Track/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },

        });
        console.log(formData)
        return data;
    },

    async like(trackId: number) {
        return axiosInstance.post(`/Track/${trackId}/like`);
    },
    async unlike(trackId: number) {
        return axiosInstance.delete(`/Track/${trackId}/like`);
    },
    deleteTrack: async (id: number): Promise<void> => {
        try {
            await api.delete(`/Track/${id}`);
        } catch (error) {
            console.error(`Failed to delete track with id ${id}`, error);
            throw error;
        }
    },
    async getLikedTracks(): Promise<ITrack[]> {
        try {
            const res = await api.get("/Track/liked"); // точно як у Swagger
            return res.data;
        } catch (error) {
            console.error("Failed to fetch liked tracks", error);
            throw error;
        }
    },

};
