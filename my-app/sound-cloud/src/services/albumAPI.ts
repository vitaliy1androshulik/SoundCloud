import api from "../utilities/axiosInstance";
import { IAlbum } from "../types/album";
import { ITrack } from "../types/track";

export const albumService = {
    getMyAlbums: async (): Promise<IAlbum[]> => {
        const res = await api.get("/Album");
        return res.data;
    },

    create: async (dto: {
        title: string;
        description?: string;
        isPublic: boolean;
        cover?: File;
        ownerId: number;
    }): Promise<IAlbum> => {
        const formData = new FormData();
        formData.append("title", dto.title);
        if (dto.description) formData.append("description", dto.description);
        formData.append("isPublic", String(dto.isPublic));
        formData.append("ownerId", String(dto.ownerId)); // додаємо власника
        if (dto.cover) formData.append("cover", dto.cover); // додаємо файл обкладинки

        const res = await api.post("/Album", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    },

    getTracks: async (albumId: number): Promise<ITrack[]> => {
        const res = await api.get(`/Album/${albumId}/tracks`);
        return res.data;
    },

    addTrack: async (albumId: number, trackId: number) => {
        await api.post(`/Album/${albumId}/tracks/${trackId}`);
    },

    removeTrack: async (albumId: number, trackId: number) => {
        await api.delete(`/Album/${albumId}/tracks/${trackId}`);
    },
};
