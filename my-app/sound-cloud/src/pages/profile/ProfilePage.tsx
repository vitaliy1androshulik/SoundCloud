import React, {useState, useEffect} from "react";
import { trackService } from "../../services/trackApi";
import { ITrack } from "../../types/track";
import { IPlaylist } from "../../types/playlist";
import {IAlbum} from "../../types/album";
import { albumService} from "../../services/albumAPI.ts";
import "../../styles/profile_page/profile_layout.css"
import {playlistService} from "../../services/playlistApi.ts";
import {getCurrentUser, updateUserProfile, uploadUserBanner} from "../../services/User/user_info.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import {IUser} from "../../types/user.ts";
import { followService } from "../../services/followApi.ts";
import {IUserFollow} from "../../types/follow.ts";
//import {IUserFollow} from "../../types/follow.ts";
//import {useSelector} from "react-redux";
//import {RootState} from "../../store/store.ts";

const tabs = ["All","Tracks", "Albums", "Playlists" ,"Reposts"];

const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("All");
    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("");
    const [albumId, setAlbumId] = useState<number>(0);
    const [genreId, setGenreId] = useState<number>(0);
    const [file, setFile] = useState<File | undefined>();
    const [cover, setCover] = useState<File | undefined>();

    const playTrack = usePlayerStore(state => state.playTrack);
    const pauseTrack = usePlayerStore((state) => state.pauseTrack);


    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistCoverFile, setPlaylistCoverFile] = useState<File | undefined>();
    const [playlistTracks, setPlaylistTracks] = useState<{ [playlistId: number]: ITrack[] }>({});




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

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatarFile] = useState<File | null>(null);


    const [isUserEditOpen, setUserEditOpen] = useState(false);

    const [bannerModalOpen, setBannerModalOpen] = useState(false);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Add to playlist modal
    const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
    const [selectedTrackToAdd, setSelectedTrackToAdd] = useState<number | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

    const { track: currentTrack, isPlaying,currentAlbumId } = usePlayerStore();
    console.log(tracks);
    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (bannerModalOpen||isUserEditOpen) {
            // Забороняємо скрол
            document.body.style.overflow = "hidden";
        } else {
            // Повертаємо як було
            document.body.style.overflow = "";
        }

        // Cleanup на всяк випадок
        return () => {
            document.body.style.overflow = "";
        };
    }, [bannerModalOpen,isUserEditOpen]);

    useEffect(() => {
        if (isUserEditOpen && user) {
            setUsername(user.username || "");
            setEmail(user.email || "");
            setBio(user.bio || "");
        }
    }, [isUserEditOpen, user]);


    // Fetch tracks and playlists on mount
    useEffect(() => {
        trackService.getMyTracks().then(setTracks).catch(console.error);
        playlistService.getAll().then(setPlaylists).catch(console.error);
        albumService.getMyAlbums().then(setAlbums).catch(console.error);
    }, []);

    const handleUserUpdate = async (updateData: {
        username?: string;
        email?: string;
        bio?: string;
        avatar?: File | null;
    }) => {
        if (!user?.id) {
            alert("User not found!");
            return;
        }

        setUploading(true);

        try {
            const updatedUser = await updateUserProfile(user.id, {
                username: updateData.username,
                email: updateData.email,
                bio: updateData.bio,
                avatar: updateData.avatar ?? undefined,
            });

            // Оновлюємо локальний стан користувача
            setUser(updatedUser);

            // Якщо потрібно, можна скинути файли
            // updateData.avatarFile = undefined;
            // updateData.bannerFile = undefined;

        } catch (err) {
            console.error("Profile update failed", err);
            alert("Failed to update profile");
        } finally {
            setUploading(false);
        }
    };



    const handleBannerUpload = async () => {
        if (!bannerFile || !user?.id) {
            alert("Please select a file!");
            return;
        }

        setUploading(true);
        try {
            const data = await uploadUserBanner.updateBanner(user.id, bannerFile);
            // Оновлюємо локальний стейт юзера
            setUser({ ...user, banner: data.bannerUrl });
            setBannerModalOpen(false);
            setBannerFile(null);
        } catch (err) {
            console.error("Banner upload failed", err);
            alert("Failed to upload banner");
        } finally {
            setUploading(false);
        }
    };

    //const getPlaylistImageUrl = (Playlist?: IPlaylist | null) => {
    //    if (!Playlist || !Playlist.coverUrl) return "/default-cover.png";
    //    return `http://localhost:5122/${Playlist.coverUrl}`;
    //};
    const getTrackImageUrl = (track?: ITrack | null) => {
        if (!track || !track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122/${track.imageUrl}`;
    };
    const getUserImageUrl = (user?: IUser | null) => {
        if (!user || !user.avatar) return "/default-cover.png";
        console.log(user)
        return `http://localhost:5122/${user.avatar}`;
    };
    const getUserBannerUrl = (user?: IUser | null) => {
        if (!user || !user.banner) return "src/images/profile/banner.png";
        console.log(user)
        return `http://localhost:5122${user.banner}`;
    };
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

    // const handleAddToPlaylistClick = (trackId: number) => {
    //     if (!playlists.length) {
    //         alert("You have no playlists yet!");
    //         return;
    //     }
    //     setSelectedTrackToAdd(trackId);
    //     setSelectedPlaylistId(playlists[0].id); // вибір по-замовчуванню — перший плейлист
    //     setAddToPlaylistModalOpen(true);
    // };

    const handleConfirmAddToPlaylist = async () => {
        if (!selectedPlaylistId || !selectedTrackToAdd) {
            alert("Choose playlist");
            return;
        }

        try {
            await playlistService.addTrack(selectedPlaylistId, selectedTrackToAdd);

            alert("Track added to playlist!");
            setAddToPlaylistModalOpen(false);
            setSelectedTrackToAdd(null);
            setSelectedPlaylistId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to add track to playlist.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (activeTab === "Tracks") {
                    const userTracks = await trackService.getMyTracks();
                    setTracks(userTracks);
                } else if (activeTab === "Playlists") {
                    const userPlaylists = await playlistService.getAll();
                    setPlaylists(userPlaylists);

                    // Одразу підтягуємо треки для всіх плейлістів
                    const tracksByPlaylist: { [playlistId: number]: ITrack[] } = {};
                    for (const p of userPlaylists) {
                        tracksByPlaylist[p.id] = await playlistService.getTracks(p.id);
                    }
                    setPlaylistTracks(tracksByPlaylist);
                } else if (activeTab === "Albums") {
                    const userAlbums = await albumService.getMyAlbums();
                    setAlbums(userAlbums);

                    // Одразу підтягуємо треки для всіх альбомів
                    const tracksByAlbum: { [albumId: number]: ITrack[] } = {};
                    for (const a of userAlbums) {
                        tracksByAlbum[a.id] = await albumService.getTracks(a.id);
                        console.log(albumService.getTracks(a.id))
                    }

                    setAlbumTracks(tracksByAlbum);
                }
            } catch (err) {
                console.error("Failed to fetch data for tab:", activeTab, err);
            }
        };

        fetchData();
    }, [activeTab]);



    useEffect(() => {
        const loadAllTracks = async () => {
            try {
                const results = await Promise.all(
                    playlists.map(async (pl) => {
                        const tracks = await playlistService.getTracks(pl.id);
                        return { id: pl.id, tracks };
                    })
                );

                const tracksByPlaylist = results.reduce(
                    (acc, { id, tracks }) => ({ ...acc, [id]: tracks }),
                    {}
                );

                setPlaylistTracks(tracksByPlaylist);
            } catch (err) {
                console.error("Failed to load all tracks", err);
                alert("Не вдалося завантажити треки для плейлістів");
            }
        };

        if (playlists.length > 0) {
            loadAllTracks();
        }
    }, [playlists]);


    //Для альбомів
    useEffect(() => {
        const loadAllAlbumTracks = async () => {
            try {
                const results = await Promise.all(
                    albums.map(async (a) => {
                        const tracks = await albumService.getTracks(a.id);
                        return { id: a.id, tracks };
                    })
                );

                const tracksByAlbum = results.reduce(
                    (acc, { id, tracks }) => ({ ...acc, [id]: tracks }),
                    {} as Record<number, ITrack[]>
                );

                setAlbumTracks(tracksByAlbum);
            } catch (err) {
                console.error("Failed to load all album tracks", err);
            }
        };

        if (albums.length > 0) {
            loadAllAlbumTracks();
        }
    }, [albums]);

    const handleViewAlbumTracks = async (albumId: number) => {
        try {
            const tracks = await albumService.getTracks(albumId);
            setAlbumTracks((prev) => ({ ...prev, [albumId]: tracks }));
        } catch (err) {
            console.error(err);
            alert("Failed to load tracks");
        }
    };

    // const handleAddToAlbumClick = (trackId: number) => {
    //     if (!albums.length) {
    //         alert("You have no albums yet!");
    //         return;
    //     }
    //     setSelectedTrackToAddToAlbum(trackId);
    //     setSelectedAlbumId(albums[0].id); // вибір першого альбому по-замовчуванню
    //     setAddToAlbumModalOpen(true);
    // };


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
    useEffect(() => {
        console.log("Current user:", user);
    }, [user]);

    const handleAlbumCreate = async () => {
        try {
            const currentUser = await getCurrentUser();

            if (!currentUser || !currentUser.id) {
                alert("Не вдалося визначити користувача. Будь ласка, увійдіть в систему.");
                return;
            }

            if (!albumTitle) {
                alert("Enter album title");
                return;
            }

            const newAlbum = await albumService.create({
                title: albumTitle,
                description: albumDescription,
                ownerId: currentUser.id,
                cover: albumCoverFile,
                isPublic: albumIsPublic,

            });


            setAlbums([...albums, newAlbum]);

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

    //для follow
    // Кількість підписників і підписок
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);

    const [followingUsers, setFollowingUsers] = useState<IUserFollow[]>([]);


    useEffect(() => {
        if (!user) return;

        const fetchFollowCounts = async () => {
            try {
                const followers = await followService.getFollowersCount(user.id);
                const following = await followService.getFollowingCount(user.id);

                setFollowersCount(followers);
                setFollowingCount(following);

                console.log("Followers:", followers, "Following:", following);
            } catch (error) {
                console.error("Помилка при отриманні кількості підписок:", error);
            }
        };

        fetchFollowCounts();
    }, [user]);



    useEffect(() => {
        if (!user) return;

        const fetchFollowingUsers = async () => {
            try {
                const usersFromApi = await followService.getFollowing(user.id);

                setFollowingUsers(
                    usersFromApi.map(u => ({
                        id: u.id,
                        username: u.username,
                        avatarUrl: u.avatarUrl,
                        isFollowing: true
                    }))
                );
            } catch (error) {
                console.error("Помилка при отриманні списку Following:", error);
            }
        };

        fetchFollowingUsers();
    }, [user]);

// 3️⃣ Функція toggleFollow для кнопки
    const toggleFollow = async (userId: number) => {
        try {
            const userToToggle = followingUsers.find(u => u.id === userId);
            if (!userToToggle) return;

            if (userToToggle.isFollowing) {
                await followService.unfollow(userId);
            } else {
                await followService.follow(userId);
            }

            // оновлюємо локально стан
            setFollowingUsers(prev =>
                prev.map(u =>
                    u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
                )
            );
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };
    const getUserAvatarUrl = (user: IUserFollow) => {
        if (!user.avatarUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${user.avatarUrl}`;
    };


    //лайки
    // окремо зберігаємо саме лайкнуті треки
    const [likedTracks, setLikedTracks] = useState<ITrack[]>([]);

    useEffect(() => {
        const fetchLikedTracks = async () => {
            try {
                const liked = await trackService.getLikedTracks();
                setLikedTracks(liked);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLikedTracks();
    }, []);




    const toggleLike = async (track: ITrack) => {
        try {
            if (track.isLikedByCurrentUser) {
                // unlike
                await trackService.unlike(track.id);
                setLikedTracks(prev => prev.filter(t => t.id !== track.id));
            } else {
                // like
                await trackService.like(track.id);
                setLikedTracks(prev => [...prev, { ...track, isLikedByCurrentUser: true }]);
            }
        } catch (err) {
            console.error("Error liking/unliking track:", err);
        }
    };


    return (
        <div className="layout_container mb-[2900px] baloo2">
            <div className="banner_container">
                <img className="banner_image_style" src={getUserBannerUrl(user)} alt="Banner"/>
            </div>
            <button className="profile_page_banner_upload_container baloo2"
                    onClick={() => setBannerModalOpen(true)}
            >
                <span className="profile_page_banner_upload_button_txt_style">
                    Update image
                </span>
            </button>
            <div className="profile_page_user_avatar_container" >
                <img className="profile_page_user_avatar_style " src={getUserImageUrl(user)} alt="Avatar"/>
            </div>
            <div className="profile_page_user_name_container">
                {user?.username}
            </div>

            <div className="profile_page_following_tracks_info_container">
                <div className="followers_container">
                    <div className="title">
                        Followers
                    </div>
                    <div className="number">
                        <span>{followersCount}</span>
                    </div>
                </div>
                <div className="following_container">
                    <div className="title">
                        Following
                    </div>
                    <div className="number">
                        <span>{followingCount}</span>
                    </div>
                </div>
                <div className="tracks_container">
                    <div className="title">
                        Tracks
                    </div>
                    <div className="number">
                        {tracks.length}
                    </div>
                </div>
            </div>

            <div className="profile_page_right_sidebar">
                <div className="profile_page_bio_container">
                    {user?.bio ? <span>{user.bio}</span> : <span>You don’t have bio :(</span>}
                </div>

                <div className="profile_page_following_users_container">
                    <div className="container_title_container">
                        <span className="header_txt_style">FOLLOWING</span>
                    </div>

                    {followingUsers.length === 0 ? (
                        <div className="user_info_container">
                            <span className="txt_style">You don`t have Followings</span>
                        </div>
                    ) : (
                        <div className="user_info_container">
                            {followingUsers.map(u => (
                                <div key={u.id} className="user_container">
                                    <div className="user_avatar_text_container">
                                        <div className="user_avatar_container">
                                            <img className="img_style" src={getUserAvatarUrl(u)} alt="avatar" />
                                        </div>
                                        <div className="user_text_container">{u.username}</div>
                                    </div>
                                    <button
                                        className="user_button_container"
                                        onClick={() => toggleFollow(u.id)}
                                    >
                                        <span className="user_button_text_style">{u.isFollowing ? "Unfollow" : "Follow"}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="profile_page_likes_users_container">
                    <div className="container_title_container">
                        <span className="header_txt_style">LIKES</span>
                    </div>

                    {likedTracks.length === 0 ? (
                        <div className="user_info_container">
                            <span className="txt_style">You don`t have Likes</span>
                        </div>
                    ) : (
                        likedTracks.map(track => (
                            <div key={track.id} className="user_info_container">
                                <div className="user_container">
                                    <div className="user_avatar_text_container">
                                        <div className="user_avatar_container">
                                            <img className="user_avatar_container"  src={getTrackImageUrl(track)} alt={track.title} />
                                        </div>
                                        <div className="user_text_container">
                                            <p>{track.title}</p>
                                        </div>
                                    </div>

                                    <div className="user_like_moreinfo_container">
                                        <div className="user_like_style">
                                            <img
                                                src={track.isLikedByCurrentUser ? "src/images/icons/like.png" : "src/images/icons/unlike.png"}
                                                alt="like"
                                                onClick={() => toggleLike(track)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </div>
                                        <div className="user_moreinfo_style">
                                            <img src="src/images/icons/more_info.png" alt="more info" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="profile_tabs_container">
                {tabs.map((tab) => (
                    <div className="profile_tab_buttons_container text-white baloo2">
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? "profile_tab_buttons_container_activated"
                                    : "profile_tab_buttons_non_active"
                            }`}
                        >
                            {tab}
                        </button>
                    </div>
                ))}
            </div>
            <div className="profile_page_user_button_controls">
                <button className="share_button cursor-pointer">
                    <img className="img_style" src="src/images/icons/share.png" alt="shareIcon"/>
                    <span className="txt_style">Share</span>
                </button>
                <button className="edit_button cursor-pointer"
                        onClick={() => setUserEditOpen(true)}
                >
                    <img className="img_style" src="src/images/icons/pen_icon.png" alt="penIcon"/>
                    <span className="txt_style">Edit</span>
                </button>
            </div>

            {/* Content */}
            <div className="profile_tracks_container">
                {/* Tracks Tab */}
                {activeTab === "All" && (
                    <>
                        {playlists.length ? (
                            <ul className="text-white baloo2">
                                {playlists.map((p) => (
                                    <li
                                        key={p.id}
                                        className="profile_track_container"
                                    >
                                        <div className="">
                                            <img
                                                src={p.coverUrl ? `http://localhost:5122/${p.coverUrl}` : "/default-cover.png"}
                                                alt={p.name}
                                                className="profile_page_playlist_image"
                                                onClick={() => {
                                                    // Якщо плейліст вже грає, ставимо паузу
                                                    if (
                                                        currentTrack &&
                                                        playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === p.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Інакше граємо перший трек плейліста
                                                        playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Треки конкретного плейлиста */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === p.id &&  // використовуємо currentAlbumId для плейліста
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {p.name}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(playlistTracks[p.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, playlistTracks[p.id], p.id)}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                    ${currentTrack?.id === t.id && currentAlbumId === p.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="profile_page_track_controls_buttons">
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"// 🔹 увімкнути
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/reply.png" alt="reply"/>
                                                </div>
                                            </div>
                                        </ul>
                                    </li>
                                ))}
                                {albums.map((a) => (
                                    <li key={a.id} className="profile_track_container">
                                        <div className="">
                                            <img
                                                src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                                alt={a.title}
                                                className="profile_page_playlist_image"
                                                onClick={() => {
                                                    // Якщо альбом вже грає, ставимо паузу
                                                    if (
                                                        currentTrack &&
                                                        albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === a.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Інакше граємо перший трек альбому
                                                        playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Треки конкретного альбому */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === a.id &&  // <-- додано
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {a.title}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(albumTracks[a.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks color">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, albumTracks[a.id])}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                        ${currentTrack?.id === t.id && currentAlbumId === a.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="profile_page_track_controls_buttons">
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/reply.png" alt="reply"/>
                                                </div>
                                            </div>
                                        </ul>

                                    </li>

                                ))}
                            </ul>

                        ) : (
                            <p className="text-gray-400 py-4">You don't have any playlists or albums</p>
                        )}

                    </>
                )}
                {activeTab === "Tracks" && (
                    <>
                        {tracks.length ? (
                            <div>
                                {tracks.map((t) => (
                                    <li key={t.id}>
                                        {t.imageUrl && (
                                            <div className="track_container">
                                                <img
                                                    src={getTrackImageUrl(t)}
                                                    alt={t.title}
                                                    className="track_image"
                                                    onClick={() => playTrack(t, tracks)}
                                                />
                                                <div className="track_controls_container">
                                                    <div className="play_info_track_container">
                                                        <div className="play_pause_track_container">
                                                            {currentTrack?.id === t.id && isPlaying ? (
                                                                <img src="src/images/player/pause_icon.png"
                                                                     alt={"playIcon"}
                                                                     onClick={() => pauseTrack()}
                                                                />
                                                            ) : (
                                                                <img src="src/images/player/play_icon.png"
                                                                     alt={"playIcon"}
                                                                     onClick={() => playTrack(t, tracks)}
                                                                />
                                                            )}

                                                        </div>
                                                        <div className="track_title_author_container">
                                                            <div className="track_title_container">
                                                                {t.title.length > 80 ? t.title.slice(0, 50) + "…" : t.title}
                                                            </div>
                                                        </div>
                                                        <div className="track_duration_range_container">
                                                            <div className="track_author_container">
                                                                {t.author.length > 80 ? t.author.slice(0, 50) + "…" : t.author}
                                                            </div>
                                                        </div>
                                                        <div className="track_genre_container">
                                                            {t.genre}
                                                        </div>
                                                        <div className="track_more_controls_container">
                                                            <div className="track_more_controls_style">
                                                                <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img
                                                                    src="/src/images/player/repeat_icon.png"
                                                                    alt="repeatIcon"
                                                                    id="hover_cursor_player"
                                                                />
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src="src/images/icons/download.png"
                                                                     alt="download"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src="src/images/icons/share.png" alt="share"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src="src/images/icons/content_copy.png"
                                                                     alt="copy"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src="src/images/icons/add_playlist.png"
                                                                     id="add_playlist_icon"
                                                                     alt="addPlaylist"/>
                                                            </div>
                                                            <div className="track_more_controls_style">
                                                                <img src="src/images/icons/reply.png" alt="reply"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 py-4">No tracks yet</p>
                        )}
                        <button
                            className=""
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
                            <ul className="text-white baloo2">
                                {playlists.map((p) => (
                                    <li
                                        key={p.id}
                                        className="profile_track_container"
                                    >
                                        <div className="">
                                            <img
                                                src={p.coverUrl ? `http://localhost:5122/${p.coverUrl}` : "/default-cover.png"}
                                                alt={p.name}
                                                className="profile_page_playlist_image"
                                                onClick={() => {
                                                    // Якщо плейліст вже грає, ставимо паузу
                                                    if (
                                                        currentTrack &&
                                                        playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === p.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Інакше граємо перший трек плейліста
                                                        playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Треки конкретного плейлиста */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    playlistTracks[p.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === p.id &&  // використовуємо currentAlbumId для плейліста
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(playlistTracks[p.id][0], playlistTracks[p.id], p.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {p.name}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(playlistTracks[p.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, playlistTracks[p.id], p.id)}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                    ${currentTrack?.id === t.id && currentAlbumId === p.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="profile_page_track_controls_buttons">
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"// 🔹 увімкнути
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/reply.png" alt="reply"/>
                                                </div>
                                            </div>
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 py-4">No playlists yet</p>
                        )}
                        <button
                            className=""
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
                            <ul className="text-white baloo2">
                                {albums.map((a) => (
                                    <li key={a.id} className="profile_track_container">
                                        <div className="">
                                            <img
                                                src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                                alt={a.title}
                                                className="profile_page_playlist_image"
                                                onClick={() => {
                                                    // Якщо альбом вже грає, ставимо паузу
                                                    if (
                                                        currentTrack &&
                                                        albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                        currentAlbumId === a.id &&
                                                        isPlaying
                                                    ) {
                                                        pauseTrack();
                                                    } else {
                                                        // Інакше граємо перший трек альбому
                                                        playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id);
                                                    }
                                                }}
                                            />

                                        </div>

                                        {/* Треки конкретного альбому */}
                                        <ul className="profile_page_track_information_container">
                                            <div className="profile_page_track_play_button_container">
                                                <div className="profile_page_play_button_background">
                                                    {currentTrack &&
                                                    albumTracks[a.id]?.some(t => t.id === currentTrack.id) &&
                                                    currentAlbumId === a.id &&  // <-- додано
                                                    isPlaying ? (
                                                        <img
                                                            src="src/images/player/pause_icon.png"
                                                            alt="pauseIcon"
                                                            onClick={() => pauseTrack()}
                                                        />
                                                    ) : (
                                                        <img
                                                            src="src/images/player/play_icon.png"
                                                            alt="playIcon"
                                                            onClick={() => playTrack(albumTracks[a.id][0], albumTracks[a.id], a.id)}
                                                        />
                                                    )}
                                                </div>
                                                <div className="profile_page_track_title_style">
                                                    {a.title}
                                                </div>
                                            </div>

                                            <ul className="profile_page_tracks_in_playlist_container">
                                                {(albumTracks[a.id] || []).map((t, index) => (
                                                    <li key={t.id}>
                                                        <div className="profile_page_tracks color">
                                                            <img
                                                                src={getTrackImageUrl(t)}
                                                                alt={t.title}
                                                                className="profile_page_tracks_image_style"
                                                                onClick={() => playTrack(t, albumTracks[a.id])}
                                                            />
                                                            <div
                                                                className={`profile_page_track_info_title_style txt_style 
                                                                        ${currentTrack?.id === t.id && currentAlbumId === a.id
                                                                    ? "profile_page_track_info_title_style txt_style_is_playing"
                                                                    : ""}`}
                                                            >
                                                                <div>{index + 1}</div>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.author}</span>
                                                                <div>&#160;&#x2022;&#160;</div>
                                                                <span>{t.title}</span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="profile_page_track_controls_buttons">
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/unlike.png" alt="unlike"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                    />
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/download.png" alt="download"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/share.png" alt="share"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/content_copy.png" alt="copy"/>
                                                </div>
                                                <div className="track_more_controls_style">
                                                    <img src="src/images/icons/reply.png" alt="reply"/>
                                                </div>
                                            </div>
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
                            onChange={(e) =>
                                setAlbumCoverFile(e.target.files?.[0])}
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

            {/*User Edit Modal*/}
            {isUserEditOpen && (
                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_modal_user_edit_container">
                        <div className="profile_page_edit_profile_close_container">
                            <span className="txt_style">Edit Profile</span>
                            <div className="img_style cursor-pointer"
                                 onClick={() => setUserEditOpen(false)}
                            >
                                <img src="src/images/icons/close_icon.png" alt="close"/>
                            </div>
                        </div>
                        <div className="user_info_container">
                            <div className="img_container">
                                {avatar ? (
                                    <img className="img_style" src={URL.createObjectURL(avatar)} alt="UserImage"/>
                                ) : (
                                    <img className="img_style" src={getUserImageUrl(user)} alt="UserImage"/>
                                )}

                                <button className="button_container cursor-pointer">
                                    <label className="cursor-pointer txt_style">Edit picture
                                        <input
                                            type="file"
                                            className="cursor-pointer inset-0 opacity-0 absolute txt_style"
                                            accept="image/*"
                                            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </button>
                            </div>
                            <div className="user_info_tables_container">
                                <div className="username_container">
                                    <label className="username_title">Username</label>
                                    <label className="username_input">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            className="ml-[12px]"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="email_container">
                                    <label className="username_title">Email address</label>
                                    <label className="username_input">
                                        <input
                                            type="email"
                                            className="ml-[12px]"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </label>
                                </div>
                                <div className="bio_container">
                                    <label className="username_title">Bio</label>
                                    <label className="bio_input">
                                    <textarea
                                        placeholder="Bio"
                                        className="bio_input_2 "
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                    />
                                    </label>
                                </div>
                                <div className="button_cancel_save_container">
                                    <button
                                        className="cancel_button cursor-pointer"
                                        onClick={() => setUserEditOpen(false)}
                                        disabled={uploading}
                                    >
                                        <span className="txt_style">Cancel</span>
                                    </button>
                                    <button
                                        className="save_button cursor-pointer"
                                        onClick={async () => {
                                            await handleUserUpdate({
                                                username,
                                                email,
                                                bio,
                                                avatar,
                                            });
                                            setUserEditOpen(false);
                                        }}
                                        disabled={uploading}
                                    >
                                        <span className="txt_style">{uploading ? "Saving..." : "Save profile"}</span>
                                    </button>
                                </div>
                            </div>


                        </div>

                    </div>
                </div>
            )}

            {/*Banner Modal*/}
            {bannerModalOpen && (
                <div className="profile_page_modal_container baloo2">
                    <div className="profile_page_banner_modal">
                        <div className="profile_page_title_and_close_button_container text-white">
                            <h1 className="profile_page_title_modal_style">Upload Banner</h1>
                            <div className="profile_page_modal_close_icon"
                                 onClick={() => setBannerModalOpen(false)}>
                                <img src="src/images/icons/close_icon.png" alt="closeIcon"/>
                            </div>
                        </div>
                        <div className="profile_page_modal_banner_preview">
                            {bannerFile ? (
                                <img
                                    className="profile_page_modal_banner_preview"
                                    src={URL.createObjectURL(bannerFile)}
                                    alt="Selected banner preview"
                                />
                            ) : (
                                <img
                                    className="profile_page_modal_banner_preview"
                                    src={getUserBannerUrl(user)}
                                    alt="Selected banner preview"
                                />
                            )}
                            <div className="profile_page_modal_banner_user_avatar">
                                <img className="img_style" src={getUserImageUrl(user)}
                                     alt="UserAvatar"/>
                            </div>
                            <div className="profile_page_modal_banner_avatar_container">
                                <span className="txt_style">{user?.username}</span>
                            </div>
                        </div>

                        <div className="profile_page_modal_banner_buttons_bottom_container">
                            <button className="profile_page_modal_upload_button_container cursor-pointer">
                                <label className="cursor-pointer relative txt_style">Upload
                                    Image
                                    <input
                                        className="cursor-pointer absolute inset-0 opacity-0 txt_style"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setBannerFile(e.target.files ? e.target.files[0] : null)
                                        }
                                    />
                                </label>
                            </button>
                            <div className="profile_page_modal_banner_cancel_save_button_container">
                                <button
                                    className="button_cancel cursor-pointer"
                                    onClick={() => setBannerModalOpen(false)}
                                >
                                    <span className="txt_style">Cancel</span>
                                </button>
                                <button
                                    className="button_save cursor-pointer"
                                    onClick={handleBannerUpload}
                                    disabled={uploading}
                                >
                                    <span className="txt_style">{uploading ? "Saving..." : "Save"}</span>
                                </button>
                            </div>

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
                            <button onClick={() => setPlaylistModalOpen(false)}
                                    className="px-4 py-2 bg-gray-700 rounded">
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
