import api from "../utilities/axiosInstance.ts";
import { IUser } from "../types/user.ts";

export const userService = {
    getById: async (userId: number): Promise<IUser> => {
        const res = await api.get(`/User/${userId}`);
        const data = res.data;

        const user: IUser = {
            id: data.id,
            username: data.username,
            email: data.email,
            avatar: data.avatarUrl || "",
            banner: data.bannerUrl || "", // <- важливо
            createdAt: data.createdAt,
            role: data.role,
            bio: data.bio || "",
            totalPlays: data.totalPlays || 0,
        };

        return user;
    },




};