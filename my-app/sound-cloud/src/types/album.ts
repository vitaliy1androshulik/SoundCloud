import { ITrack } from "./track";

export interface IAlbum {
    id: number;
    title: string;
    description?: string;
    createdAt?: string; // або Date, якщо будеш парсити
    updatedAt: string;
    ownerId?: number;
    ownerName?: string;
    coverUrl?: string;
    isPublic?: boolean;
    tracks?: ITrack[]; // масив треків, якщо завантажуємо разом з альбомом
}
