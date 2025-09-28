import React, {useState, useEffect} from "react";
import {IPlaylist} from "../types/playlist";
import {ITrack} from "../types/track";
import {playlistService} from "../services/playlistApi.ts";
import "../styles/playlist_modal.css"
import {IUser} from "../types/user.ts";
import {getCurrentUser} from "../services/User/user_info.ts";


interface PlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    getCurrentTrack: () => ITrack | null;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({isOpen, onClose, getCurrentTrack}) => {
    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
    const [activeTab, setActiveTab] = useState<"add" | "create">("add");
    const [playlistName, setPlaylistName] = useState("");
    const [, setPlaylistCoverFile] = useState<File | undefined>();

    const [, setSelectedPlaylistId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [playlistTracksMap, setPlaylistTracksMap] = useState<{ [id: number]: ITrack[] }>({});

    const [currentAddedTrack, setCurrentAddedTrack] = useState<ITrack | null>(null);

    useEffect(() => {
        if (isOpen) {
            const track = getCurrentTrack();
            if (track) {
                handleSelectTrack(track);
            }
        } else {
            // якщо модалка закрилась — чистимо вибір
            setCurrentAddedTrack(null);
        }
    }, [isOpen]);

    const handleSelectTrack = (track: ITrack) => {
        setCurrentAddedTrack(track);
    };

    const handleClearSelectedTrack = () => {
        setCurrentAddedTrack(null);
    };


// Після завантаження плейлістів підвантажуємо треки
    useEffect(() => {
        if (!isOpen) return;
        playlistService.getAll().then(async (data) => {
            setPlaylists(data);

            const tracksMap: { [id: number]: ITrack[] } = {};
            await Promise.all(
                data.map(async (pl) => {
                    const tracks = await playlistService.getTracks(pl.id);
                    tracksMap[pl.id] = tracks;
                })
            );
            setPlaylistTracksMap(tracksMap);
        }).catch(console.error);
    }, [isOpen]);


    const [, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);
    const filteredPlaylists = playlists.filter(pl =>
        pl.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    useEffect(() => {
        if (!isOpen) return;
        playlistService.getAll()
            .then((data) => {
                console.log("Playlists from API:", data);
                setPlaylists(data);
            })
            .catch(console.error);
    }, [isOpen]);


    const handleCreatePlaylist = async () => {
        const currentTrack = getCurrentTrack();

        if (!playlistName.trim()) return alert("Enter playlist name");
        if (!currentTrack) return alert("No track selected");
        try {
            const formData = new FormData();
            formData.append("name", playlistName);

            if (currentTrack.imageUrl) {
                console.log("Image" + currentTrack.imageUrl);
                formData.append("coverUrl", currentTrack.imageUrl);
            }

            // Створюємо плейліст
            const newPlaylist = await playlistService.create(formData);

            // Додаємо поточний трек у новостворений плейліст
            await playlistService.addTrack(newPlaylist.id, currentTrack.id);

            // Оновлюємо локальні стани
            setPlaylists((prev: any) => [...prev, newPlaylist]);
            setTrackCounts(prev => ({...prev, [newPlaylist.id]: 1}));

            // Очищуємо input-и та закриваємо форму
            setPlaylistName("");
            setPlaylistCoverFile(undefined);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create playlist and add track");
        }
    };

    const getPlaylistImageUrl = (pl: IPlaylist) => {
        if (!pl.coverUrl) return "/default-cover.png";
        return `http://localhost:5122${pl.coverUrl}`;
    };

    const getCurrentTrackImageUrl = (track: ITrack | null): string | null => {
        if (!track) return null;
        return track.imageUrl ? `http://localhost:5122${track.imageUrl}` : null;
    };

    const handleAddToPlaylist = async (playlistId: number) => {
        const track = getCurrentTrack();
        if (!track || !playlistId) return alert("Choose playlist or track");

        try {
            await playlistService.addTrack(playlistId, track.id);
            alert(`Track added to playlist!`);

            // Оновлюємо кількість треків локально
            setTrackCounts(prev => ({
                ...prev,
                [playlistId]: (prev[playlistId] || 0) + 1
            }));

            setSelectedPlaylistId(null);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to add track");
        }
    };

    const fetchTrackCount = async (playlistId: number): Promise<number> => {
        try {
            const tracks = await playlistService.getTracks(playlistId);
            return tracks.length;
        } catch (err) {
            console.error("Failed to fetch tracks for playlist", err);
            return 0;
        }
    };

    const [, setTrackCounts] = useState<{ [id: number]: number }>({});

// Після завантаження плейлістів
    useEffect(() => {
        if (!isOpen) return;

        playlistService.getAll().then(async (data) => {
            setPlaylists(data);

            // Підвантажуємо кількість треків для кожного плейліста
            const counts: { [id: number]: number } = {};
            await Promise.all(data.map(async (pl) => {
                counts[pl.id] = await fetchTrackCount(pl.id);
            }));
            setTrackCounts(counts);
        }).catch(console.error);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="playlist_layout baloo2">
            <div className="main_container">
                {/* Tabs */}
                <div className="modal_title_close_container">
                    <div className="tabs_container">
                        <div className="txt_container">
                            <button
                                className={`txt_style cursor-pointer ${
                                    activeTab === "add" ? "border-b-2 border-white font-semibold" : ""
                                }`}
                                onClick={() => setActiveTab("add")}
                            >
                                Add to playlist
                            </button>
                        </div>
                        <div className="txt_container">
                            <button
                                className={`txt_style cursor-pointer ${
                                    activeTab === "create" ? "border-b-2 border-white font-semibold" : ""
                                }`}
                                onClick={() => setActiveTab("create")}
                            >
                                Create a playlist
                            </button>
                        </div>
                        <div className="close_button_container cursor-pointer"
                             onClick={onClose}
                        >
                            <img src="src/images/icons/close_icon.png" alt="close"/>
                        </div>
                    </div>

                </div>

                {/* Tab Content */}
                {activeTab === "add" && (
                    <div>
                        <input
                            type="text"
                            placeholder="Filter playlist"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="add_playlist_search_playlist"
                        />
                        <ul className="add_playlists_container">
                            {filteredPlaylists.length ? (
                                filteredPlaylists.map((pl) => {
                                    const track = getCurrentTrack();
                                    const tracksInPlaylist = playlistTracksMap[pl.id] ?? []; // реально підвантажені треки
                                    const isInPlaylist = track && tracksInPlaylist.some(t => t.id === track.id);

                                    return (
                                        <li key={pl.id} className="list_playlist_container text-white">
                                            <div className="playlist_title_image_container">
                                                <div className="img_style_container">
                                                    <img src={getPlaylistImageUrl(pl)}/>
                                                </div>
                                                <div className="playlist_txt_container">
                                                    <span className="txt_style_playlist_title">{pl.name}</span>
                                                    <span
                                                        className="txt_style_playlist_count">{tracksInPlaylist.length}</span>
                                                </div>
                                            </div>
                                            {isInPlaylist ? (
                                                <button
                                                    className={`added_playlist_button_container ${
                                                        isInPlaylist ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                                    }`}
                                                    onClick={() => !isInPlaylist && handleAddToPlaylist(pl.id)}
                                                >
                                                <span className="txt_style">
                                                  Added
                                                </span>
                                                </button>
                                            ) : (
                                                <button
                                                    className={`add_playlist_button_container ${
                                                        isInPlaylist ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                                                    }`}
                                                    onClick={() => !isInPlaylist && handleAddToPlaylist(pl.id)}
                                                >
                                                <span className="txt_button_style">
                                                  Add to playlist
                                                </span>
                                                </button>
                                            )}

                                        </li>
                                    );
                                })
                            ) : (
                                <li className="text-gray-500 text-sm">No playlists found.</li>
                            )}
                        </ul>
                    </div>
                )}

                {activeTab === "create" && (
                    <div className="create_playlist_container">



                            {currentAddedTrack ? (
                                <>
                                    <div className="title_style">
                                        Playlist title
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Playlist"
                                            value={playlistName}
                                            onChange={(e) => setPlaylistName(e.target.value)}
                                            className="input_style"
                                        />
                                    </div>
                                    <div className="added_track_info">
                                        <div className="track_title_img_container">
                                            <img src={getCurrentTrackImageUrl(currentAddedTrack) as string}
                                                 alt="userImg"
                                                 className="add_img_style"
                                            />
                                            <div className="add_txt_container">
                                            <span className="add_txt_style">
                                                {currentAddedTrack?.author}&#160;&#x2022;&#160;{currentAddedTrack?.title}
                                            </span>
                                            </div>
                                        </div>
                                        <div className="close_button_container cursor-pointer">
                                            <img src="src/images/icons/close_icon.png" alt="close"
                                                 onClick={handleClearSelectedTrack}/>
                                        </div>

                                    </div>
                                    <div className="add_privacy_save_container">
                                        <button
                                            onClick={handleCreatePlaylist}
                                            className="save_button_container">
                                            <span className="txt_save_style">Save</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <span className="closed_txt_style">You don`t select track :(</span>
                            )}
                    </div>
                )}

            </div>
        </div>
    );
};
