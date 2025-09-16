import React, { useState, useEffect } from "react";
import { trackService } from "../../services/trackApi";
import { ITrack } from "../../types/track";

const tabs = ["All", "Tracks", "Playlists", "Albums", "Reposts"]; // або будь-які інші вкладки

const ProfilePage: React.FC = () => {
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [activeTab, setActiveTab] = useState<string>("Tracks");

    // Поля для нового треку
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [albumId, setAlbumId] = useState<number>(0);
    const [genreId, setGenreId] = useState<number>(0);
    const [file, setFile] = useState<File | undefined>();
    const [cover, setCover] = useState<File | undefined>();

    // Стан модалки
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Завантаження треків користувача
    useEffect(() => {
        trackService.getMyTracks()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));
    }, []);
    console.log(tracks.length);

    const handleUpload = async () => {
        if (!title || !duration || !albumId || !file || !cover || genreId === undefined) {
            alert("Please fill all required fields and select files!");
            return;
        }

        try {
            const newTrack = await trackService.createTrack(title, duration, albumId, file, cover, genreId);
            setTracks([...tracks, newTrack]);

            // Очистка полів і закриття модалки
            setTitle("");
            setDuration("");
            setAlbumId(0);
            setGenreId(0);
            setFile(undefined);
            setCover(undefined);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload track. Check console for details.");
        }
    };

    return (
        <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-700 text-gray-400">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 transition-colors ${
                            activeTab === tab ? "text-white border-b-2 border-indigo-500 font-semibold" : "hover:text-white"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content preview */}
            <div className="mt-6 text-white">
                {activeTab === "Tracks" ? (
                    tracks.length > 0 ? (
                        <ul className="space-y-2 text-gray-300">
                            {tracks.map((track) => (

                                <li key={track.id} className="flex items-center gap-4">

                                    <div className="flex-1 baloo2">
                                        <p className="font-semibold">{track.title}</p>
                                        <p className="font-semibold text-gray-300">{track.author}</p>
                                        <p className="font-semibold text-gray-300">{track.playCount}</p>
                                        <p className="font-semibold text-gray-300">{track.genre}</p>
                                        <span className="text-sm text-gray-400">{track.duration.substring(0, 5)}</span>
                                        <p className="text-red-300">-----------NEXT TRACK-----------</p>
                                    </div>


                                </li>

                            ))}
                            <button
                                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
                                onClick={() => setIsModalOpen(true)}
                            >
                                add new
                            </button>
                        </ul>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-400 mb-4">Things are sounding a little quiet in here</p>
                            <button
                                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Upload now
                            </button>
                        </div>
                    )
                ) : (
                    <p className="text-gray-400">Here will be the {activeTab} section...</p>
                )}
            </div>


            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-md">
                        <h2 className="text-white text-xl mb-4">Upload Track</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
                        />
                        <input
                            type="number"
                            placeholder="Album ID"
                            value={albumId}
                            onChange={(e) => setAlbumId(Number(e.target.value))}
                            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
                        />
                        <input
                            type="number"
                            placeholder="Genre ID"
                            value={genreId}
                            onChange={(e) => setGenreId(Number(e.target.value))}
                            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
                        />
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0])}
                            className="w-full mb-2 text-white"
                        />
                        <input
                            type="file"
                            onChange={(e) => setCover(e.target.files?.[0])}
                            className="w-full mb-4 text-white"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                                onClick={handleUpload}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
