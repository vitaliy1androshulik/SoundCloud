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
    };
    return user;
};