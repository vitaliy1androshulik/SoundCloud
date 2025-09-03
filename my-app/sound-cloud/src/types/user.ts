

export interface IUser {
    id: number;
    username: string;
    email: string;
    createdAt: string; // Date на фронті зручно передавати як ISO string
    isBlocked: boolean;
    password:string;
}