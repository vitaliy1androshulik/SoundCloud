import React, {useEffect, useRef, useState} from 'react';
import {trackService} from '../../services/trackApi';
import {ITrack} from '../../types/track';
import "../../styles/main_pages/library_page/layout.css";
import {usePlayerStore} from "../../store/player_store.tsx";
import "../../styles/General.css"
import {IUserFollow} from "../../types/follow.ts";
import {followService} from "../../services/followApi.ts";
import {IUser} from "../../types/user.ts";
import {getCurrentUser} from "../../services/User/user_info.ts";
import {IAlbum} from "../../types/album.ts";
import {playlistService} from "../../services/playlistApi.ts";
import {albumService} from "../../services/albumAPI.ts";
import {IPlaylist} from "../../types/playlist.ts";
import {useNavigate} from "react-router-dom";


const tab = ["All", "History", "Likes", "Following", "Albums", "Playlists"];
const LibraryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("All");

    const navigate = useNavigate();

    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [, setLoading] = useState<boolean>(true);

    const playTrack = usePlayerStore(state => state.playTrack);

    const history = usePlayerStore(state => state.history);

    const [albums, setAlbums] = useState<IAlbum[]>([]);
    const [playlists, setPlaylists] = useState<IPlaylist[]>([]);


    const [followingUsers, setFollowingUsers] = useState<IUserFollow[]>([]);

    const scrollMore = useRef<HTMLDivElement>(null);
    const scrollLike = useRef<HTMLDivElement>(null);
    const scrollFollowing = useRef<HTMLDivElement>(null);
    const scrollAlbums = useRef<HTMLDivElement>(null);
    const scrollPlaylists = useRef<HTMLDivElement>(null);

    const [showLeftMore, setShowLeftMore] = useState(false);
    const [showRightMore, setShowRightMore] = useState(false);

    const [showLeftLike, setShowLeftLike] = useState(false);
    const [showRightLike, setShowRightLike] = useState(false);

    const [showLeftFollowing, setShowLeftFollowing] = useState(false);
    const [showRightFollowing, setShowRightFollowing] = useState(false);

    const [showLeftAlbums, setShowLeftAlbums] = useState(false);
    const [showRightAlbums, setShowRightAlbums] = useState(false);

    const [showLeftPlaylists, setShowLeftPlaylists] = useState(false);
    const [showRightPlaylists, setShowRightPlaylists] = useState(false);


    useEffect(() => {
        // функція для оновлення кнопок конкретного контейнера
        const attachScrollListener = (
            ref: React.RefObject<HTMLDivElement | null>,
            setLeft: React.Dispatch<React.SetStateAction<boolean>>,
            setRight: React.Dispatch<React.SetStateAction<boolean>>
        ) => {
            const container = ref.current;
            if (!container) return () => {
            }; // повертаємо пустий cleanup

            const updateButtons = () => {
                setLeft(container.scrollLeft > 0);
                setRight(container.scrollLeft + container.clientWidth < container.scrollWidth);
            };

            requestAnimationFrame(updateButtons);

            container.addEventListener("scroll", updateButtons);
            window.addEventListener("resize", updateButtons);

            return () => {
                container.removeEventListener("scroll", updateButtons);
                window.removeEventListener("resize", updateButtons);
            };
        };

        // підключаємо обидва контейнера
        const cleanupMore = attachScrollListener(scrollMore, setShowLeftMore, setShowRightMore);
        const cleanupLike = attachScrollListener(scrollLike, setShowLeftLike, setShowRightLike);
        const cleanupFollowing = attachScrollListener(scrollFollowing, setShowLeftFollowing, setShowRightFollowing);
        const cleanupAlbums = attachScrollListener(scrollAlbums, setShowLeftAlbums, setShowRightAlbums);
        const cleanupPlaylists = attachScrollListener(scrollPlaylists, setShowLeftPlaylists, setShowRightPlaylists);

        // повертаємо cleanup обох
        return () => {
            cleanupMore?.();
            cleanupLike?.();
            cleanupFollowing?.();
            cleanupAlbums?.();
            cleanupPlaylists?.();

        };
    }, [tracks,history,albums,playlists]);


    const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollBy({left: -200, behavior: "smooth"});
    };

    const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollBy({left: 200, behavior: "smooth"});
    };


    useEffect(() => {
        // коли змінюється activeTab — скролимо вгору
        window.scrollTo({
            top: 0,
            behavior: "smooth" // можна "auto" якщо не хочеш анімації
        });
    }, [activeTab]);

    useEffect(() => {
        albumService.getAllAlbums().then(setAlbums).catch(console.error);
        playlistService.getAll().then(setPlaylists).catch(console.error);
    }, []);

    const [user, setUser] = useState<IUser | null>(null);
    useEffect(() => {
        getCurrentUser()
            .then((data) => setUser(data))
            .catch((err) => console.error(err));
    }, []);
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
    const getUserAvatarUrl = (user: IUserFollow) => {
        if (!user.avatarUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${user.avatarUrl}`;
    };
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

    // метод для переходу на профіль

    const goToUserProfile = (userId: number) => {
        navigate(`/user/${userId}`);
    };

    return (
        <div className="layout_container mb-[900px] baloo2">
            {activeTab === "All" && (
                <div className="library_page_all_container">
                    {/*--------------------HISTORY------------------------*/}
                    <div className="library_page_category_container">
                        <div className="title_container">
                    <span className="txt_style">
                        History
                    </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[1])}
                            >
                                See all
                            </button>
                        </div>
                        {showLeftMore && (
                            <button
                                className="button_side_bar_left_container"
                                onClick={() => scrollLeft(scrollMore)}
                            >
                                <img src="src/images/icons/arrow_left_side_bar.png"
                                     alt="ArrowLeft"/>
                            </button>
                        )}
                        {showRightMore && (
                            <button
                                className="button_side_bar_right_container"
                                onClick={() => scrollRight(scrollMore)}
                            >
                                <img src="src/images/icons/arrow_right_side_bar.png"
                                     alt="ArrowRight"/>
                            </button>
                        )}
                        <div className="body_info_container overflow-x-auto"
                             ref={scrollMore}
                        >

                            {history.length === 0 ? (
                                <p className="baloo2 text-lightpurple text-[24px]">You haven't listened to the music
                                    yet, but you can start right now!</p>
                            ) : (
                                history.map((track) => (
                                    <li className="track_card_container text-white text-[20px] font-bold"
                                        key={track.id}>

                                        <img className="img_style" src={getTrackImageUrl(track)}
                                             alt={"userAvatar"}
                                             onClick={() => playTrack(track)}
                                        />

                                        <div className="info_container">
                                            <div className="title_style">
                                                {track.title.length > 17 ?
                                                    track.title.slice(0, 15) + "…" : track.title}
                                            </div>
                                            <div className="author_style">
                                                {track.author}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </div>
                    </div>

                    {/*--------------------LIKES------------------------*/}
                    <div className="library_page_category_container">
                        <div className="title_container">
                    <span className="txt_style">
                        Likes
                    </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[2])}>
                                See all
                            </button>
                        </div>
                        {showLeftLike && (
                            <button
                                className="button_side_bar_left_container"
                                onClick={() => scrollLeft(scrollLike)}
                            >
                                <img src="src/images/icons/arrow_left_side_bar.png"
                                     alt="ArrowLeft"/>
                            </button>
                        )}
                        {showRightLike && (
                            <button
                                className="button_side_bar_right_container"
                                onClick={() => scrollRight(scrollLike)}
                            >
                                <img src="src/images/icons/arrow_right_side_bar.png"
                                     alt="ArrowRight"/>
                            </button>
                        )}
                        <div className="body_info_container"
                             ref={scrollLike}
                        >

                            {tracks.length === 0 ? (
                                <p className="text-gray-400">Улюблених треків поки немає</p>
                            ) : (

                                tracks.slice(0, 7).map((track) => (
                                    <li
                                        key={track.id}
                                        className="track_card_container"
                                    >
                                        <img
                                            src={getTrackImageUrl(track)}
                                            alt={track?.title || "Track cover"}
                                            className="img_style"
                                            onClick={() => playTrack(track)}
                                        />
                                        <div className="info_container">
                                            <span className="title_style">
                                                    {track.title.length > 17 ?
                                                        track.title.slice(0, 15) + "…" : track.title}
                                            </span>
                                            <span className="author_style">
                                                {track.author}
                                            </span>
                                        </div>
                                    </li>
                                ))
                            )}
                        </div>

                    </div>

                    {/*------------FOLLOWINGS-------------*/}
                    <div className="library_page_category_container">
                        <div className="title_container">
                    <span className="txt_style">
                        Following
                    </span>
                            <button className="button_see_all cursour-pointer" onClick={() => setActiveTab(tab[3])}>
                                See all
                            </button>
                        </div>
                        {showLeftFollowing && (
                            <button
                                className="button_side_bar_left_container"
                                onClick={() => scrollLeft(scrollFollowing)}
                            >
                                <img src="src/images/icons/arrow_left_side_bar.png"
                                     alt="ArrowLeft"/>
                            </button>
                        )}
                        {showRightFollowing && (
                            <button
                                className="button_side_bar_right_container"
                                onClick={() => scrollRight(scrollFollowing)}
                            >
                                <img src="src/images/icons/arrow_right_side_bar.png"
                                     alt="ArrowRight"/>
                            </button>
                        )}
                        <div className="body_info_container"
                             ref={scrollFollowing}
                        >
                            {followingUsers.length === 0 ? (
                                <div className="user_info_container">
                                    <span className="txt_style">You don`t have Followings</span>
                                </div>
                            ) : (
                                followingUsers.map(u => (
                                    <div key={u.id} className="track_card_container">
                                        <img className="following_img_style" src={getUserAvatarUrl(u)} onClick={() => goToUserProfile(u.id)} alt="avatar"/>
                                        <div className="info_container">
                                            <div className="title_style">{u.username}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/*------------ALBUMS-------------*/}
                    <div className="library_page_category_container">
                        <div className="title_container">
                    <span className="txt_style">
                        Albums
                    </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[4])}>
                                See all
                            </button>
                        </div>
                        {showLeftAlbums && (
                            <button
                                className="button_side_bar_left_container"
                                onClick={() => scrollLeft(scrollAlbums)}
                            >
                                <img src="src/images/icons/arrow_left_side_bar.png"
                                     alt="ArrowLeft"/>
                            </button>
                        )}
                        {showRightAlbums && (
                            <button
                                className="button_side_bar_right_container"
                                onClick={() => scrollRight(scrollAlbums)}
                            >
                                <img src="src/images/icons/arrow_right_side_bar.png"
                                     alt="ArrowRight"/>
                            </button>
                        )}
                        <div className="body_info_container"
                             ref={scrollAlbums}
                        >
                            {albums.length ? (
                                albums.map((a) => (
                                    <li key={a.id} className="track_card_container">
                                        <img
                                            src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                            alt={a.title}
                                            className="img_style"
                                            onClick={() => navigate(`/play-album/${a.id}`)}
                                        />
                                        <div className="info_container">
                                            <span className="title_style">
                                                    {a.title.length > 17 ?
                                                        a.title.slice(0, 15) + "…" : a.title}
                                            </span>
                                            <span className="author_style">
                                                    {a.ownerName}
                                            </span>
                                        </div>
                                    </li>

                                ))
                            ) : (
                                <p className="text-gray-400 py-4">No albums yet</p>
                            )}
                        </div>
                    </div>


                    {/*------------PLAYLISTS-------------*/}
                    <div className="library_page_category_container">
                        <div className="title_container">
                    <span className="txt_style">
                        Playlists
                    </span>
                            <button className="button_see_all cursoru-pointer" onClick={() => setActiveTab(tab[5])}>
                                See all
                            </button>
                        </div>
                        {showLeftPlaylists && (
                            <button
                                className="button_side_bar_left_container"
                                onClick={() => scrollLeft(scrollPlaylists)}
                            >
                                <img src="src/images/icons/arrow_left_side_bar.png"
                                     alt="ArrowLeft"/>
                            </button>
                        )}
                        {showRightPlaylists && (
                            <button
                                className="button_side_bar_right_container"
                                onClick={() => scrollRight(scrollPlaylists)}
                            >
                                <img src="src/images/icons/arrow_right_side_bar.png"
                                     alt="ArrowRight"/>
                            </button>
                        )}
                        <div className="body_info_container"
                             ref={scrollPlaylists}
                        >
                            {playlists.length ? (
                                playlists.map((p) => (
                                    <li key={p.id} className="track_card_container">
                                        <img
                                            src={p.coverUrl ? `http://localhost:5122/${p.coverUrl}` : "/default-cover.png"}
                                            alt={p.name}
                                            className="img_style"
                                        />
                                        <div className="info_container">
                                            <span className="title_style">
                                                    {p.name.length > 17 ?
                                                        p.name.slice(0, 15) + "…" : p.name}
                                            </span>
                                        </div>
                                    </li>

                                ))
                            ) : (
                                <p className="text-gray-400 py-4">No albums yet</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === "History" && (
                <div className="library_page_all_container">
                    <div className="library_page_tab_container">
                        <div className="title_container">
                            <span className="txt_style">
                                 History
                            </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[0])}
                            >
                                Return
                            </button>
                        </div>
                        <div className="body_info_container">
                            {history.length === 0 ? (
                                <p className="baloo2 text-lightpurple text-[24px]">You haven't listened to the music
                                    yet, but you can start right now!</p>
                            ) : (
                                history.map((track) => (
                                    <li className="track_card_container text-white text-[20px] font-bold"
                                        key={track.id}>

                                        <img className="img_style" src={getTrackImageUrl(track)}
                                             alt={"userAvatar"}
                                             onClick={() => playTrack(track)}
                                        />

                                        <div className="info_container">
                                            <div className="title_style">
                                                {track.title.length > 17 ?
                                                    track.title.slice(0, 15) + "…" : track.title}
                                            </div>
                                            <div className="author_style">
                                                {track.author}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}
            {activeTab === "Likes" && (
                <div className="library_page_all_container">
                    <div className="library_page_tab_container">
                        <div className="title_container">
                            <span className="txt_style">
                                 Likes
                            </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[0])}
                            >
                                Return
                            </button>
                        </div>
                        <div className="body_info_container">
                            {tracks.length === 0 ? (
                                <p className="baloo2 text-lightpurple text-[24px]">You haven't listened to the music
                                    yet, but you can start right now!</p>
                            ) : (
                                tracks.map((track) => (
                                    <li className="track_card_container text-white text-[20px] font-bold"
                                        key={track.id}>

                                        <img className="img_style" src={getTrackImageUrl(track)}
                                             alt={"userAvatar"}
                                             onClick={() => playTrack(track)}
                                        />

                                        <div className="info_container">
                                            <div className="title_style">
                                                {track.title.length > 17 ?
                                                    track.title.slice(0, 15) + "…" : track.title}
                                            </div>
                                            <div className="author_style">
                                                {track.author}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}
            {activeTab === "Following" && (
                <div className="library_page_all_container">
                    <div className="library_page_tab_container">
                        <div className="title_container">
                            <span className="txt_style">
                                 Following
                            </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[0])}
                            >
                                Return
                            </button>
                        </div>
                        <div className="body_info_container">
                            {followingUsers.length === 0 ? (
                                <div className="user_info_container">
                                    <span className="txt_style">You don`t have Followings</span>
                                </div>
                            ) : (
                                followingUsers.map(u => (
                                    <div key={u.id} className="track_card_container">
                                        <img className="following_img_style" src={getUserAvatarUrl(u)} alt="avatar"/>
                                        <div className="info_container">
                                            <div className="title_style">{u.username}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}
            {activeTab === "Albums" && (
                <div className="library_page_all_container">
                    <div className="library_page_tab_container">
                        <div className="title_container">
                            <span className="txt_style">
                                 Albums
                            </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[0])}
                            >
                                Return
                            </button>
                        </div>
                        <div className="body_info_container">
                            {albums.length ? (
                                albums.map((a) => (
                                    <li key={a.id} className="track_card_container">
                                        <img
                                            src={a.coverUrl ? `http://localhost:5122/${a.coverUrl}` : "/default-cover.png"}
                                            alt={a.title}
                                            className="img_style"
                                        />
                                        <div className="info_container">
                                            <span className="title_style">
                                                    {a.title.length > 17 ?
                                                        a.title.slice(0, 15) + "…" : a.title}
                                            </span>
                                            <span className="author_style">
                                                    {a.ownerName}
                                            </span>
                                        </div>
                                    </li>

                                ))
                            ) : (
                                <p className="text-gray-400 py-4">No albums yet</p>
                            )}
                        </div>

                    </div>
                </div>
            )}
            {activeTab === "Playlists" && (
                <div className="library_page_all_container">
                    <div className="library_page_tab_container">
                        <div className="title_container">
                            <span className="txt_style">
                                 Playlists
                            </span>
                            <button className="button_see_all cursor-pointer"
                                    onClick={() => setActiveTab(tab[0])}
                            >
                                Return
                            </button>
                        </div>
                        <div className="body_info_container">
                            {playlists.length ? (
                                playlists.map((p) => (
                                    <li key={p.id} className="track_card_container">
                                        <img
                                            src={p.coverUrl ? `http://localhost:5122/${p.coverUrl}` : "/default-cover.png"}
                                            alt={p.name}
                                            className="img_style"
                                        />
                                        <div className="info_container">
                                            <span className="title_style">
                                                    {p.name.length > 17 ?
                                                        p.name.slice(0, 15) + "…" : p.name}
                                            </span>
                                        </div>
                                    </li>

                                ))
                            ) : (
                                <p className="text-gray-400 py-4">No playlists yet</p>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryPage;
