import React, { useEffect, useState } from 'react';
import { trackService } from '../../services/trackApi';
import { ITrack } from '../../types/track';

const LibraryPage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLikedTracks = async () => {
            try {
                const likedTracks = await trackService.getLikedTracks();
                setTracks(likedTracks);

            } catch (error) {
                console.error("Помилка при завантаженні улюблених треків:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedTracks();
    }, []);

    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122/${track.imageUrl}`;
    };

    return (
        <div className=" text-white layout-container mb-[2000px]">



            <div>
                <h2 className="text-xl font-semibold mb-4 mt-[200px]">Liked</h2>
                {loading ? (
                    <p className="text-gray-400">Завантаження...</p>
                ) : tracks.length === 0 ? (
                    <p className="text-gray-400">Улюблених треків поки немає</p>
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {tracks.map((track) => (
                            <li
                                key={track.id}
                                className="flex flex-col items-center text-center bg-gray-900 rounded-xl p-3 hover:bg-gray-800 transition"
                            >
                                <img
                                    src={getTrackImageUrl(track)}
                                    alt={track?.title || "Track cover"}
                                    className="track-cover"
                                />
                                <span className="font-semibold text-white truncate w-full">
                                    {track.title}
                                </span>
                                <span className="text-sm text-gray-400">
                                    {track.author}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>







        </div>
    );
};

export default LibraryPage;
