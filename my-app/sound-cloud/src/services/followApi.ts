import axios from "axios";
import { IUserFollow } from "../types/follow";

const API_URL = "http://localhost:5122/api/Follow";

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const followService = {
    async getFollowStatus(id: number) {
        const res = await axios.get<IUserFollow>(`${API_URL}/${id}/status`, {
            headers: getAuthHeader(),
        });
        return res.data;
    },

    async follow(id: number) {
        const token = localStorage.getItem("token"); // або зі стану Redux
        if (!token) throw new Error("User is not authenticated");

        const res = await axios.post(`${API_URL}/${id}/follow`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return res.data;
    },

    async unfollow(id: number) {
        const res = await axios.delete(`${API_URL}/${id}/unfollow`, {
            headers: getAuthHeader(),
        });
        return res.data;
    },

    async getFollowers(id: number) {
        const res = await axios.get<IUserFollow[]>(`${API_URL}/${id}/followers`);
        return res.data;
    },

    async getFollowing(id: number) {
        const res = await axios.get<IUserFollow[]>(`${API_URL}/${id}/following`);
        return res.data;
    },

    async getFollowersCount(id: number) {
        const res = await axios.get<number>(`${API_URL}/${id}/followers/count`);
        return res.data;
    },

    async getFollowingCount(id: number) {
        const res = await axios.get<number>(`${API_URL}/${id}/following/count`);
        return res.data;
    },
};
