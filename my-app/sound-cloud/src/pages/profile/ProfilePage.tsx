import React, { useState, useEffect } from "react";
import { trackService } from "../../services/trackApi";
import { playlistService} from "../../services/playlistApi";
import { ITrack } from "../../types/track";
import { IPlaylist } from "../../types/playlist";


const tabs = ["Tracks", "Playlists", "Albums", "Reposts"];

const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("Tracks");
    const [tracks, setTracks] = useState<ITrack[]>([]);

    // Tracks

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [albumId, setAlbumId] = useState<number>(0);
    const [genreId, setGenreId] = useState<number>(0);
    const [file, setFile] = useState<File | undefined>();
    const [cover, setCover] = useState<File | undefined>();






    // Playlists
    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistCoverFile, setPlaylistCoverFile] = useState<File | undefined>();
    //const [playlistTracks, setPlaylistTracks] = useState<ITrack[]>([]);
    const [playlistTracks, setPlaylistTracks] = useState<{ [playlistId: number]: ITrack[] }>({});

    // Add to playlist modal
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    const [selectedTrackToAdd, setSelectedTrackToAdd] = useState<number | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

    // Fetch tracks and playlists on mount
    useEffect(() => {
        trackService.getMyTracks().then(setTracks).catch(console.error);
        playlistService.getAll().then(setPlaylists).catch(console.error);
    }, []);

    const getPlaylistImageUrl = (Playlist?: IPlaylist | null) => {
        if (!Playlist || !Playlist.coverUrl) return "/default-cover.png";
        return `http://localhost:5122/${Playlist.coverUrl}`;
    };
    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122/${track.imageUrl}`;
    };

    // Track upload
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
    // Playlist creation
    const handlePlaylistCreate = async () => {
        if (!playlistName) {
            alert("Enter playlist name");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", playlistName);
            if (playlistCoverFile) {
                formData.append("cover", playlistCoverFile);
            }

            const newPlaylist = await playlistService.create(formData); // метод сервісу приймає FormData
            setPlaylists([...playlists, newPlaylist]);

            // Очистка полів і закриття модалки
            setPlaylistName("");
            setPlaylistCoverFile(undefined);
            setPlaylistModalOpen(false);
        } catch (err) {
            console.error("Playlist creation failed", err);
            alert("Failed to create playlist. Check console for details.");
        }
    };

    // Add to playlist handlers
    const handleAddToPlaylistClick = (trackId: number) => {
        if (!playlists.length) {
            alert("You have no playlists yet!");
            return;
        }
        setSelectedTrackToAdd(trackId);
        setSelectedPlaylistId(playlists[0].id); // вибір по-замовчуванню — перший плейлист
        setAddToPlaylistModalOpen(true);
    };

    const handleConfirmAddToPlaylist = async () => {
        if (!selectedPlaylistId || !selectedTrackToAdd) {
            alert("Choose playlist");
            return;
        }

        try {
            // Виклик API — метод може відрізнятись, підстав під свій сервіс
            await playlistService.addTrack(selectedPlaylistId, selectedTrackToAdd);

            // Можна опціонально оновити локальний стан плейлистів (якщо бекенд повертає оновлений об'єкт — краще використовувати його)
            // Нижче — простий оповіститель:
            alert("Track added to playlist!");
            setAddToPlaylistModalOpen(false);
            setSelectedTrackToAdd(null);
            setSelectedPlaylistId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to add track to playlist.");
        }
    };


    const handleViewTracks = async (playlistId: number) => {
        try {
            const tracks = await playlistService.getTracks(playlistId); // твій API метод
            setPlaylistTracks((prev) => ({
                ...prev,
                [playlistId]: tracks,
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to load tracks");
        }
    };

    return (
        <div className="p-6 text-white">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-700 text-gray-400">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 transition-colors ${
                            activeTab === tab
                                ? "text-white border-b-2 border-indigo-500 font-semibold"
                                : "hover:text-white"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="mt-6">
                {/* Tracks Tab */}
                {activeTab === "Tracks" && (
                    <>
                        {tracks.length ? (
                            <ul className="space-y-2">
                                {tracks.map((t) => (
                                    <li key={t.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded">
                                        <img
                                            src={getTrackImageUrl(t)}
                                            alt={t.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">{t.title}</p>
                                            <p className="text-gray-300">{t.author}</p>
                                            <p className="text-gray-300">{t.genre}</p>
                                            <span className="text-gray-400 text-sm">{t.duration?.substring(0, 5)}</span>
                                        </div>

                                        {/* кнопка додати у плейлист */}
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => handleAddToPlaylistClick(t.id)}
                                                className="px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-sm"
                                            >
                                                Add to Playlist
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 py-4">No tracks yet</p>
                        )}
                        <button
                            className="mt-4 px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Upload Track
                        </button>
                    </>
                )}

                {/* Playlists Tab */}
                {activeTab === "Playlists" && (
                    <>
                        {playlists.length ? (
                            <ul className="space-y-2">
                                {playlists.map((p) => (
                                    <li key={p.id} className="flex flex-col gap-2 bg-gray-800 p-3 rounded">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={getPlaylistImageUrl(p)}
                                                alt={p.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <p className="flex-1">{p.name}</p>
                                            <button
                                                onClick={() => handleViewTracks(p.id)}
                                                className="px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-sm"
                                            >
                                                View Tracks
                                            </button>
                                        </div>

                                        {/* Треки конкретного плейлиста */}
                                        <ul className="mt-2 space-y-1">
                                            {(playlistTracks[p.id] || []).map((t) => (
                                                <li key={t.id} className="flex items-center gap-2">
                                                    <img src={getTrackImageUrl(t)} alt={t.title} className="w-10 h-10 object-cover rounded" />
                                                    <span>{t.title}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 py-4">No playlists yet</p>
                        )}
                        <button
                            className="mt-4 px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                            onClick={() => setPlaylistModalOpen(true)}
                        >
                            Create Playlist
                        </button>
                    </>
                )}

                {/* Other tabs */}
                {activeTab !== "Tracks" && activeTab !== "Playlists" && (
                    <p className="text-gray-400 py-4">{activeTab} section coming soon...</p>
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

            {/* Playlist Modal */}
            {playlistModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-md">
                        <h2 className="text-xl mb-4">Create Playlist</h2>
                        <input
                            type="text"
                            placeholder="Playlist Name"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            className="w-full mb-2 p-2 rounded bg-gray-800"
                        />
                        <input
                            type="file"
                            onChange={(e) => setPlaylistCoverFile(e.target.files?.[0])}
                            className="w-full mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setPlaylistModalOpen(false)} className="px-4 py-2 bg-gray-700 rounded">
                                Cancel
                            </button>
                            <button onClick={handlePlaylistCreate} className="px-4 py-2 bg-indigo-600 rounded">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Playlist Modal */}
            {addToPlaylistModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-sm">
                        <h3 className="text-lg mb-3">Add track to playlist</h3>
                        <select
                            value={selectedPlaylistId ?? ""}
                            onChange={(e) => setSelectedPlaylistId(Number(e.target.value))}
                            className="w-full mb-4 p-2 rounded bg-gray-800"
                        >
                            <option value="" disabled>
                                Choose playlist
                            </option>
                            {playlists.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setAddToPlaylistModalOpen(false);
                                    setSelectedTrackToAdd(null);
                                    setSelectedPlaylistId(null);
                                }}
                                className="px-4 py-2 bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button onClick={handleConfirmAddToPlaylist} className="px-4 py-2 bg-indigo-600 rounded">
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
