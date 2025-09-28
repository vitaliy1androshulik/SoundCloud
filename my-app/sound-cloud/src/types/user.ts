export interface IUser {
    id: number;
    username: string;
    email: string;
    avatar?:string;
    banner?:string;
    createdAt?: string; // Date на фронті зручно передавати як ISO string
    isBlocked?: boolean;
    password?:string;
    role?:string;
    bio?:string;
    totalPlays:number;
    isLocalPasswordSet: boolean;//new

    isFollowing?: boolean;

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
    user: null, //user: null as IUser | null,
    token: null, //token: null as string | null,
};