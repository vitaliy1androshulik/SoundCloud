
export interface ITrack {
    id: number;
    title: string;
    author: string;
    playCount: number;
    genre: string;
    duration: string;   // бо з бекенду йде TimeSpan, зручніше приймати як string (наприклад "00:03:45")
    isHidden: boolean;
    albumId: number;
    url: string;        // шлях до mp3 чи іншого аудіо
    imageUrl?: string;  // може бути null
}