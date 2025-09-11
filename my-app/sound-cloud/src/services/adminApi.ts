// src/services/adminApi.ts
import api from "../utilities/axiosInstance.ts";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

export const adminApi = {
    // Users
    getUsers: () => api.get(`${API_URL}/Admin/users`),
    getUserById: (id: number) => api.get(`${API_URL}/Admin/users/${id}`),
    deleteUser: (id: number) => api.delete(`${API_URL}/Admin/users/${id}`),
    updateUser: (id: number, data: any) =>
        api.put(`${API_URL}/Admin/users/${id}`, data),
    blockUser: (id: number) => api.patch(`${API_URL}/Admin/users/${id}/block`),
    unblockUser: (id: number) => api.patch(`${API_URL}/Admin/users/${id}/unblock`),

    // Tracks
    getTracks: () => api.get(`${API_URL}/Track/krot`),
    getTrackById: (id: number) => api.get(`${API_URL}/Track/${id}`),
    createTrack: (data: any) => api.post(`${API_URL}/Track`, data),
    updateTrack: (id: number, data: any) => api.put(`${API_URL}/Track/${id}`, data),
    deleteTrack: (id: number) => api.delete(`${API_URL}/Track/${id}`),
    hideTrack: (id: number) => api.patch(`${API_URL}/Track/${id}/hide`),
    unhideTrack: (id: number) => api.patch(`${API_URL}/Track/${id}/unhide`),
};
