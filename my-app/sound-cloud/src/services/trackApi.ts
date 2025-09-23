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



    // Створити новий трек (усі поля обов'язкові)
    async createTrack(
        title: string,
        duration: string,
        albumId: number,
        file: File,
        cover: File,
        genreId: number
    ) {
        // Перевірка всіх обов'язкових полів
        if (!title || !duration || !albumId || !file || !cover || genreId === undefined) {
            throw new Error("Missing required fields for track creation");
        }

        try {
            const formData = new FormData();
            formData.append("Title", title);
            formData.append("Duration", duration);
            formData.append("AlbumId", albumId.toString());
            formData.append("File", file);
            formData.append("Cover", cover);
            formData.append("GenreId", genreId.toString());

            console.log("Uploading track:", { title, duration, albumId, file, cover, genreId });

            const res = await api.post("/Track/create-file", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return res.data;
        } catch (error) {
            console.error("Failed to create track", error);
            throw error;
        }
    },

    async like(trackId: number) {
        return axiosInstance.post(`/Track/${trackId}/like`);
    },
    async unlike(trackId: number) {
        return axiosInstance.delete(`/Track/${trackId}/like`);
    },
    async getLikedTracks(): Promise<ITrack[]> {
        try {
            const res = await api.get("/Track/liked"); // точно як у Swagger
            return res.data;
        } catch (error) {
            console.error("Failed to fetch liked tracks", error);
            throw error;
        }
    }
};
