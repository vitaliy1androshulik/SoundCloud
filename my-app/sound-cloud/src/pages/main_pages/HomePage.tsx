import React, {useEffect, useRef, useState} from 'react';
import {ITrack} from "../../types/track";
import {trackService} from "../../services/trackApi.ts";

const HomePage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));
    }, []);

    const handlePlayPause = (track: ITrack) => {
        if (currentTrackId === track.id) {
            audioRef.current?.pause();
            setCurrentTrackId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = track.url;
                audioRef.current.play();
            }
            setCurrentTrackId(track.id);
        }
    };

    return (
        <div className="text-white mx-auto lg:max-w-[904px] xl:max-w-[1382px]">
            <h2 className="text-xl font-bold mb-4">Tracks</h2>
            <ul className="space-y-4">
                {tracks.map((track) => (
                    <li key={track.id} className="flex items-center gap-4">
                        {track.imageUrl && (
                            <img
                                src={track.imageUrl}
                                alt={track.title}
                                className="w-12 h-12 rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <p className="font-semibold">{track.title}</p>
                            <span className="text-sm text-gray-400">{track.duration}</span>
                        </div>
                        <button
                            onClick={() => handlePlayPause(track)}
                            className="px-3 py-1 rounded bg-lightpurple text-white"
                        >
                            {currentTrackId === track.id ? "⏸ Pause" : "▶ Play"}
                        </button>
                    </li>
                ))}
            </ul>
            <audio ref={audioRef} />
        </div>
    );
};

export default HomePage;