import api from "../utilities/axiosInstance.ts";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

export const adminApi = {
    // ================= USERS =================
    getUsers: () => api.get(`${API_URL}/Admin/users`),
    getUserById: (id: number) => api.get(`${API_URL}/Admin/users/${id}`),
    createUser: (data: any) => api.post(`${API_URL}/User/register`, data),
    updateUser: (id: number, data: any) => api.put(`${API_URL}/Admin/users/${id}`, data),
    deleteUser: (id: number) => api.delete(`${API_URL}/Admin/users/${id}`),
    changeUserRole: (id: number, role: string) => api.put(`${API_URL}/Admin/users/${id}/role`, { role }),
    blockUser: (id: number) => api.patch(`${API_URL}/Admin/users/${id}/block`),
    unblockUser: (id: number) => api.patch(`${API_URL}/Admin/users/${id}/unblock`),
    // ================= TRACK =================
    getTracks: () => api.get(`${API_URL}/Track/all`),
    getTrackById: (id: number) => api.get(`${API_URL}/Track/${id}`),
    createTrack: (title: string, duration: string, albumId: number, file: File,cover: File, genreId: number) => {
        const formData = new FormData();
        formData.append("Title", title);
        formData.append("Duration", duration);
        formData.append("AlbumId", albumId.toString());
        formData.append("File", file);
        formData.append("Cover", cover);
        formData.append("GenreId", genreId.toString());

        return api.post(`${API_URL}/Track/create-file`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    updateTrack: (id: number, data: any) => {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        return api.put(`${API_URL}/Track/update/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    deleteTrack: (id: number) => api.delete(`${API_URL}/Track/${id}`),
    hideTrack: (id: number) => api.patch(`${API_URL}/Track/${id}/hide`),
    unhideTrack: (id: number) => api.patch(`${API_URL}/Track/${id}/unhide`),
    uploadTrackCover: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`${API_URL}/Track/${id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // ================= ALBUMS =================
    getAlbumsForAdmin: () => api.get(`${API_URL}/Admin/albums`),
    getAlbumById: (id: number) => api.get(`${API_URL}/Album/${id}`),
    createAlbum: (data: any) => api.post(`${API_URL}/Album`, data),
    updateAlbum: (id: number, data: any) => api.put(`${API_URL}/Album/${id}`, data),
    deleteAlbum: (id: number) => api.delete(`${API_URL}/Album/${id}`),
    uploadAlbumCover: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`${API_URL}/Album/${id}/cover`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // ================= PLAYLISTS =================
    getPlaylists: () => api.get(`${API_URL}/Playlist`),
    getPlaylistById: (id: number) => api.get(`${API_URL}/Playlist/${id}`),
    createPlaylist: (data: any) => api.post(`${API_URL}/Playlist`, data),
    updatePlaylist: (id: number, data: any) => api.put(`${API_URL}/Playlist/${id}`, data),
    deletePlaylist: (id: number) => api.delete(`${API_URL}/Playlist/${id}`),
    uploadPlaylistCover: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`${API_URL}/Playlist/${id}/cover`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // ================= CATEGORIES =================
    getCategories: () => api.get(`${API_URL}/Categories`),
    getCategoryById: (id: number) => api.get(`${API_URL}/Categories/${id}`),
    createCategory: (data: { name: string; slug: string; imageFile?: File }) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("slug", data.slug);
        if (data.imageFile) formData.append("imageFile", data.imageFile);
        return api.post(`${API_URL}/Categories`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    updateCategory: (id: number, data: { name: string; slug: string; imageFile?: File }) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("slug", data.slug);
        if (data.imageFile) formData.append("imageFile", data.imageFile);
        return api.put(`${API_URL}/Categories/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    deleteCategory: (id: number) => api.delete(`${API_URL}/Categories/${id}`),
};
