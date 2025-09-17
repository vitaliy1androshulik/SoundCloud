import React, { useState, useEffect } from "react";
import { trackService } from "../../services/trackApi";
import { playlistService} from "../../services/playlistApi";
import { ITrack } from "../../types/track";
import { IPlaylist } from "../../types/playlist";
import {IAlbum} from "../../types/album";
import { albumService} from "../../services/albumAPI.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";


const tabs = ["Tracks", "Playlists", "Albums", "Reposts"];

const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("Tracks");
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const user = useSelector((state: RootState) => state.user.user); // поточний юзер

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



    // Albums
    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [albumModalOpen, setAlbumModalOpen] = useState(false);
    const [albumTitle, setAlbumTitle] = useState("");
    const [albumCoverFile, setAlbumCoverFile] = useState<File | undefined>();

    const [albumDescription, setAlbumDescription] = useState("");
    const [albumIsPublic, setAlbumIsPublic] = useState(true);


    const [albumTracks, setAlbumTracks] = useState<{ [albumId: number]: ITrack[] }>({});

    const [addToAlbumModalOpen, setAddToAlbumModalOpen] = useState(false);
    const [selectedTrackToAddToAlbum, setSelectedTrackToAddToAlbum] = useState<number | null>(null);
    const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);



    // Add to playlist modal
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    const [selectedTrackToAdd, setSelectedTrackToAdd] = useState<number | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

    // Fetch tracks and playlists on mount
    useEffect(() => {
        trackService.getMyTracks().then(setTracks).catch(console.error);
        playlistService.getAll().then(setPlaylists).catch(console.error);
        albumService.getMyAlbums().then(setAlbums).catch(console.error);
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



    //Для альбомів

    const handleViewAlbumTracks = async (albumId: number) => {
        try {
            const tracks = await albumService.getTracks(albumId);
            setAlbumTracks((prev) => ({ ...prev, [albumId]: tracks }));
        } catch (err) {
            console.error(err);
            alert("Failed to load tracks");
        }
    };

    const handleAddToAlbumClick = (trackId: number) => {
        if (!albums.length) {
            alert("You have no albums yet!");
            return;
        }
        setSelectedTrackToAddToAlbum(trackId);
        setSelectedAlbumId(albums[0].id); // вибір першого альбому по-замовчуванню
        setAddToAlbumModalOpen(true);
    };


    const handleConfirmAddToAlbum = async () => {
        if (!selectedAlbumId || !selectedTrackToAddToAlbum) {
            alert("Choose an album");
            return;
        }

        try {
            await albumService.addTrack(selectedAlbumId, selectedTrackToAddToAlbum);
            alert("Track added to album!");
            setAddToAlbumModalOpen(false);
            setSelectedTrackToAddToAlbum(null);
            setSelectedAlbumId(null);
            handleViewAlbumTracks(selectedAlbumId); // оновлюємо треки альбому
        } catch (err) {
            console.error(err);
            alert("Failed to add track to album.");
        }
    };

    //творення альбому

    const handleAlbumCreate = async () => {
        if (!albumTitle) {
            alert("Enter album title");
            return;
        }

        if (!user) {
            alert("You must be logged in to create an album");
            return;
        }

        try {
            // Викликаємо метод сервісу напряму, він сам формує FormData
            const newAlbum = await albumService.create({
                title: albumTitle,
                description: albumDescription, // необов’язково
                isPublic: albumIsPublic,
                cover: albumCoverFile,         // файл обкладинки
                ownerId: user.id               // автоматично підтягуємо
            });

            // Додаємо новий альбом у локальний стан
            setAlbums([...albums, newAlbum]);

            // Очистка полів та закриття модалки
            setAlbumTitle("");
            setAlbumDescription("");
            setAlbumCoverFile(undefined);
            setAlbumIsPublic(true);
            setAlbumModalOpen(false);
        } catch (err) {
            console.error("Failed to create album:", err);
            alert("Failed to create album. Check console for details.");
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
                                            {/* кнопка додати до альбома */}
                                            <button
                                                onClick={() => handleAddToAlbumClick(t.id)}
                                                className="px-2 py-1 bg-indigo-500 text-xs rounded hover:bg-indigo-400"
                                            >
                                                Add to Album
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

                {/* Albums Tab */}
                {activeTab === "Albums" && (
                    <>
                        {albums.length ? (
                            <ul className="space-y-2">
                                {albums.map((a) => (
                                    <li key={a.id} className="flex flex-col gap-2 bg-gray-800 p-3 rounded">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                                alt={a.title}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <p className="flex-1">{a.title}</p>
                                            <button
                                                onClick={() => handleViewAlbumTracks(a.id)}
                                                className="px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-sm"
                                            >
                                                View Tracks
                                            </button>
                                        </div>

                                        {/* Tracks у конкретному альбомі */}
                                        <ul className="mt-2 space-y-1">
                                            {(albumTracks[a.id] || []).map((t) => (
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
                            <p className="text-gray-400 py-4">No albums yet</p>
                        )}
                        <button
                            className="mt-4 px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                            onClick={() => setAlbumModalOpen(true)}
                        >
                            Create Album
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
            {/* Add to Album Modal */}
            {addToAlbumModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-sm">
                        <h3 className="text-lg mb-3">Add track to album</h3>
                        <select
                            value={selectedAlbumId ?? ""}
                            onChange={(e) => setSelectedAlbumId(Number(e.target.value))}
                            className="w-full mb-4 p-2 rounded bg-gray-800"
                        >
                            <option value="" disabled>Choose album</option>
                            {albums.map((a) => (
                                <option key={a.id} value={a.id}>{a.title}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setAddToAlbumModalOpen(false);
                                    setSelectedTrackToAddToAlbum(null);
                                    setSelectedAlbumId(null);
                                }}
                                className="px-4 py-2 bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAddToAlbum} // <-- тут викликаємо функцію
                                className="px-4 py-2 bg-indigo-600 rounded"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Модалка для створення альбому */}
            {albumModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-900 p-6 rounded w-full max-w-md">
                        <h2 className="text-xl mb-4 text-white">Create Album</h2>

                        {/* Album Title */}
                        <input
                            type="text"
                            placeholder="Album Title"
                            value={albumTitle}
                            onChange={(e) => setAlbumTitle(e.target.value)}
                            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
                        />

                        {/* Album Description */}
                        <textarea
                            placeholder="Description (optional)"
                            value={albumDescription}
                            onChange={(e) => setAlbumDescription(e.target.value)}
                            className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
                        />

                        {/* Album Public */}
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                checked={albumIsPublic}
                                onChange={(e) => setAlbumIsPublic(e.target.checked)}
                                id="albumPublic"
                                className="mr-2"
                            />
                            <label htmlFor="albumPublic" className="text-gray-200">
                                Public
                            </label>
                        </div>

                        {/* Album Cover */}
                        <input
                            type="file"
                            onChange={(e) => setAlbumCoverFile(e.target.files?.[0])}
                            className="w-full mb-4 text-white"
                        />

                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setAlbumModalOpen(false)}
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAlbumCreate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProfilePage;
