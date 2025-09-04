

export interface IUser {
    id: number;
    username: string;
    email: string;
    createdAt?: string; // Date на фронті зручно передавати як ISO string
    isBlocked?: boolean;
    password?:string;
    role?:string;
}

export interface IUserState {
    user: IUser | null;
    token: string | null;
}

export const initialState: IUserState = {
    user: null,
    token: localStorage.getItem("token"),
};
