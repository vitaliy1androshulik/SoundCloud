import {IUser} from "../../types/user.ts";
import api from "../../utilities/axiosInstance.ts";

export const getCurrentUser = async (): Promise<IUser> => {
    const response = await api.get("/User/profile");
    const data = response.data;
    const user: IUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatarUrl, // мапимо AvatarUrl → avatar
        createdAt: data.createdAt,
        role: data.role,
        totalPlays: data.totalPlays,
    };
    return user;
};
export const getTopUsers = async (take: number): Promise<IUser[]> => {
    try {
        const response = await api.get(`/User/top?take=${take}`);
        const usersData = response.data;

        // Мапимо дані API на наш тип IUser
        const users: IUser[] = usersData.map((data: any) => ({
            id: data.userId,
            username: data.username,
            email: data.email || "",       // якщо email відсутній
            avatar: data.avatarUrl || "",  // запасний avatarUrl
            createdAt: data.createdAt || "",
            role: data.role || "",
            totalPlays: data.totalPlays   // додаємо totalPlays для топу
        }));

        return users;
    } catch (error) {
        console.error("Failed to fetch top users:", error);
        return [];
    }
};