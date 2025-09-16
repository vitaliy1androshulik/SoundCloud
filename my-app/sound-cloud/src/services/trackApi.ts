import { ITrack } from "../types/track";
import api from "../utilities/axiosInstance";


//const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/auth";

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
};




