import { jwtParse } from "./jwtParse";
import {IUser} from "../types/user.ts"

export const normalizeUser = (token: string): IUser | null => {
    const payload = jwtParse(token);
    if (!payload) return null;

    return {
        id: payload.id,
        username: payload.unique_name || payload.username || "",
        email: payload.email,
        role: payload.role||"User",
        avatar: payload.avatarUrl || '', //new
        banner: payload.bannerUrl || '',//new
        createdAt: payload.createdAt,//new
        bio: payload.bio || '',//new
        totalPlays: payload.totalPlays || 0,//new
        isLocalPasswordSet: payload.isLocalPasswordSet || false//new
    };
};