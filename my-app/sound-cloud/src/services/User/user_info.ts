import {IUser} from "../../types/user.ts";
import api from "../../utilities/axiosInstance.ts";

export const getCurrentUser = async (): Promise<IUser> => {
    const response = await api.get("/User/profile");
    const data = response.data;
    const user: IUser = {
        isLocalPasswordSet: false,
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatarUrl, // мапимо AvatarUrl → avatar
        banner: data.bannerUrl, // мапимо AvatarUrl → avatar
        createdAt: data.createdAt,
        role: data.role,
        bio: data.bio,
        totalPlays: data.totalPlays
    };
    return user;
};
export const getTopUsers = async (take: number): Promise<IUser[]> => {
    try {
        const response = await api.get(`/User/top?take=${take}`);
        const usersData = response.data;

        //         // Мапимо дані API на наш тип IUser
//         const users: IUser[] = usersData.map((data: any) => ({
//             id: data.userId,
//             username: data.username,
//             email: data.email || "",       // якщо email відсутній
//             avatar: data.avatarUrl || "",  // запасний avatarUrl
//             createdAt: data.createdAt || "",
//             role: data.role || "",
//             totalPlays: data.totalPlays   // додаємо totalPlays для топу
//         }));
//
//         return users;
//     } catch (error) {
//         console.error("Failed to fetch top users:", error);
//         return [];
//     }
// };

        // прибираємо зайву змінну "users" і глушимо лише цю перевірку "any"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (Array.isArray(usersData) ? usersData : []).map((data: any) => ({
            id: data.userId,
            username: data.username,
            email: data.email || "",
            avatar: data.avatarUrl || "",
            createdAt: data.createdAt || "",
            role: data.role || "",
            totalPlays: data.totalPlays,
        })) as IUser[];
    } catch (e) {
        console.error("Failed to fetch top users", e);
        return [];
    }
};

export const uploadUserBanner = {
    async updateBanner(userId: number, bannerFile: File) {
        const formData = new FormData();
        formData.append("Banner", bannerFile);

        const response = await fetch(`http://localhost:5122/api/User/${userId}/banner`, {
            method: "PUT",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to update banner");
        }

        return await response.json(); // повертає { bannerUrl: "..."}
    },
};

export const updateUserProfile = async (
    userId: number,
    data: {
        username?: string;
        email?: string;
        bio?: string;
        avatar?: File;
    }
): Promise<IUser> => {
    void userId; //new заглушка
    const formData = new FormData();

    if (data.username) formData.append("Username", data.username);
    if (data.email) formData.append("Email", data.email);
    if (data.bio) formData.append("Bio", data.bio);
    if (data.avatar) formData.append("Avatar", data.avatar);

    const response = await api.put(`/User/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    const resData = response.data;

    const updatedUser: IUser = {
        isLocalPasswordSet: false,
        id: resData.id,
        username: resData.username,
        email: resData.email || "",
        avatar: resData.avatarUrl || "",
        banner: resData.bannerUrl || "",
        createdAt: resData.createdAt,
        role: resData.role,
        bio: resData.bio || "",
        totalPlays: resData.totalPlays || 0,
        isBlocked: resData.isBlocked,
        password: resData.password
    };

    return updatedUser;
};