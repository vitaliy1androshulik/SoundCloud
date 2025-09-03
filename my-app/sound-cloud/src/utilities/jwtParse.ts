import {jwtDecode} from "jwt-decode";
import { IUser } from "../types/user";

export const jwtParse = (token: string | null): IUser | null => {
    if (!token) return null;
    try {
        return jwtDecode<IUser>(token);
    } catch {
        return null;
    }
};