import React, {useEffect, useRef, useState} from 'react';
import {ITrack} from "../../types/track";
import {trackService} from "../../services/trackApi.ts";
import {TokenService} from "../../utilities/tokenService.ts";
import {usePlayerStore} from "../../store/player_store.tsx";



const FeedPage: React.FC = ()=> {
    const playTrack = usePlayerStore((state) => state.playTrack);
    const [tracks, setTracks] = useState<ITrack[]>([]);
    //const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    console.log(tracks);
    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));
    }, []);
    console.log("Token Service "+TokenService.getAccessToken());
    // const handlePlayPause = (track: ITrack) => {
    //     if (currentTrackId === track.id) {
    //         audioRef.current?.pause();
    //         setCurrentTrackId(null);
    //     } else {
    //         if (audioRef.current) {
    //             audioRef.current.src = `http://localhost:5122${track.url}`;
    //             audioRef.current.play();
    //         }
    //         setCurrentTrackId(track.id);
    //     }
    //
    // };
    const getTrackImageUrl = (track: ITrack) => {
        if (!track.imageUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${track.imageUrl}`;
    };
    return (
        <div className="hidden lg:block mx-auto max-w-screen-center-xl">
            <h2 className="text-xl font-bold mb-4">Tracks</h2>
            <ul className="space-y-4 text-white">
                {tracks.map((track) => (

                    <li key={track.id} className="flex items-center gap-4">
                        {track.imageUrl && (
                            <img
                                src={getTrackImageUrl(track)}
                                alt={track.title}
                                className="w-30 h-30 rounded-lg"
                                onClick={()=>playTrack(track)}
                            />
                        )}
                        <div className="flex-1 baloo2">
                            <p className="font-semibold">{track.title}</p>
                            <p className="font-semibold text-gray-300">{track.author}</p>
                            <p className="font-semibold text-gray-300">{track.playCount}</p>
                            <p className="font-semibold text-gray-300">{track.genre}</p>
                            <span className="text-sm text-gray-400">{track.duration.substring(0, 5)}</span>
                        </div>

                    </li>
                ))}
            </ul>
            <audio ref={audioRef}/>
        </div>
    );
}

export default FeedPage;