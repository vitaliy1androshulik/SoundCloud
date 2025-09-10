// src/services/adminApi.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

export const adminApi = {
    // Users
    getUsers: () => axios.get(`${API_URL}/Admin/users`),
    getUserById: (id: number) => axios.get(`${API_URL}/Admin/users/${id}`),
    deleteUser: (id: number) => axios.delete(`${API_URL}/Admin/users/${id}`),
    updateUser: (id: number, data: any) =>
        axios.put(`${API_URL}/Admin/users/${id}`, data),
    blockUser: (id: number) => axios.patch(`${API_URL}/Admin/users/${id}/block`),
    unblockUser: (id: number) => axios.patch(`${API_URL}/Admin/users/${id}/unblock`),

    // Tracks
    getTracks: () => axios.get(`${API_URL}/Track`),
    getTrackById: (id: number) => axios.get(`${API_URL}/Track/${id}`),
    createTrack: (data: any) => axios.post(`${API_URL}/Track`, data),
    updateTrack: (id: number, data: any) => axios.put(`${API_URL}/Track/${id}`, data),
    deleteTrack: (id: number) => axios.delete(`${API_URL}/Track/${id}`),
    hideTrack: (id: number) => axios.patch(`${API_URL}/Track/${id}/hide`),
    unhideTrack: (id: number) => axios.patch(`${API_URL}/Track/${id}/unhide`),
};
