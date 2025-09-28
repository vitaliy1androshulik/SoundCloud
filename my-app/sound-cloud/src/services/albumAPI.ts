import api from "../utilities/axiosInstance";
import { IAlbum } from "../types/album";

interface CreateAlbumDto {
    title: string;
    description: string;
    ownerId: number;
    cover?: File;
    isPublic: boolean;
}

export const albumService = {
    getMyAlbums: async (): Promise<IAlbum[]> => {
        const res = await api.get("/Album");
        return res.data;
    },
    getAllAlbums: async (): Promise<IAlbum[]> => {
        const res = await api.get("/Album/public");
        return res.data;
    },
    getAlbumById: async (id: string | number): Promise<IAlbum> => {
        const res = await api.get(`/Album/${id}`);
        return res.data;
    },
    create: async (dto: CreateAlbumDto): Promise<IAlbum> => {
        const formData = new FormData();
        formData.append("Title", dto.title);
        if (dto.description) formData.append("Description", dto.description);
        formData.append("OwnerId", dto.ownerId.toString());
        formData.append("IsPublic", dto.isPublic ? "true" : "false");
        if (dto.cover) {
            formData.append("CoverUrl", dto.cover);
        }
        const res = await api.post("/Album", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    },

    getTracks: async (albumId: number) => {
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
