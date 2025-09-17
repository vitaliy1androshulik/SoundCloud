

export interface IUser {
    id: number;
    username: string;
    email: string;
    avatar?:string;
    createdAt?: string; // Date на фронті зручно передавати як ISO string
    isBlocked?: boolean;
    password?:string;
    role?:string;
    totalPlays:number;
}

export interface IAuthResponse {
    user: IUser;
    token: string;
}
export interface IUserState {
    token: string | null;
    user: IUser | null;
}

export const initialState: IUserState = {
    user: null,
    token: null,
};
