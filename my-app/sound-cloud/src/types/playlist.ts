import { ITrack } from "./track";

export interface IPlaylist {
    id: number;
    name: string;
    ownerId: number;
    ownerName?: string;
    coverUrl?: string;
    Tracks: ITrack[]; // з великої літери
}
