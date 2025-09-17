import React, {useEffect, useRef, useState} from 'react';
import {ITrack} from "../../types/track";
import {trackService} from "../../services/trackApi.ts";
import {TokenService} from "../../utilities/tokenService.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import "../../styles/main_pages/feed_page/layout.css"
import {IUser} from "../../types/user.ts";
import {getTopUsers} from "../../services/User/user_info.ts";


const FeedPage: React.FC = ()=> {
    const playTrack = usePlayerStore(state => state.playTrack);
    const pauseTrack = usePlayerStore((state) => state.pauseTrack);

    const history = usePlayerStore(state => state.history);

    const [loop, setLoop] = useState<boolean>(false);

    const [tracks, setTracks] = useState<ITrack[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const tracksPerPage = 6;
    const indexOfLastTrack = currentPage * tracksPerPage;
    const indexOfFirstTrack = indexOfLastTrack - tracksPerPage;
    const currentTracks = tracks.slice(indexOfFirstTrack, indexOfLastTrack);

    const totalPages = Math.ceil(tracks.length / tracksPerPage);

    const { track: currentTrack, isPlaying } = usePlayerStore();
    console.log(tracks);
    useEffect(() => {
        trackService.getAll()
            .then((data) => setTracks(data))
            .catch((err) => console.error(err));
    }, []);
    console.log("Token Service "+TokenService.getAccessToken());
    const getUserAvatarUrl = (user: IUser) => {
        if (!user.avatar) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${user.avatar}`;
    };
    const [users, setUsers] = useState<IUser[]>([]);
    const topCount = 5;
    useEffect(() => {
        const fetchUsers = async () => {
            const data = await getTopUsers(topCount);
            setUsers(data);
        };

        fetchUsers();
    }, []);

    const getTrackImageUrl = (track: ITrack) => {
        if (!track.imageUrl) return "/default-cover.png"; // запасна картинка
        return `http://localhost:5122${track.imageUrl}`;
    };
    return (
        <main className="layout_container mb-[1200px]">
            <div className="container baloo2">
                {currentTracks.map((track) => (
                    <li key={track.id}>
                        {track.imageUrl && (
                            <div className="track_container">

                                <img
                                    src={getTrackImageUrl(track)}
                                    alt={track.title}
                                    className="track_image"
                                    onClick={() => playTrack(track, tracks)}
                                />
                                <div className="track_controls_container">
                                    <div className="play_info_track_container">
                                        <div className="play_pause_track_container">
                                            {currentTrack?.id === track.id && isPlaying ? (
                                                <img src="src/images/player/pause_icon.png"
                                                     alt={"playIcon"}
                                                     onClick={() => pauseTrack(track)}
                                                />
                                            ) : (
                                                <img src="src/images/player/play_icon.png"
                                                     alt={"playIcon"}
                                                     onClick={() => playTrack(track, tracks)}
                                                />
                                            )}

                                        </div>
                                        <div className="track_title_author_container">
                                            <div className="track_title_container">
                                                {track.title.length > 80 ? track.title.slice(0, 50) + "…" : track.title}
                                            </div>
                                        </div>
                                        <div className="track_duration_range_container">
                                            <div className="track_author_container">
                                                {track.author.length > 80 ? track.author.slice(0, 50) + "…" : track.author}
                                            </div>
                                        </div>
                                        <div className="track_genre_container">
                                            {track.genre}
                                        </div>
                                        <div className="track_more_controls_container">
                                            <div className="track_more_controls_style">
                                                <img src="src/images/icons/unlike.png" alt="unlike"/>
                                            </div>
                                            <div className="track_more_controls_style">
                                                {!loop ? (
                                                    <img
                                                        src="/src/images/player/repeat_icon.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                        onClick={() => setLoop(true)}   // 🔹 увімкнути
                                                    />
                                                ) : (
                                                    <img
                                                        src="/src/images/player/repeat_cyan.png"
                                                        alt="repeatIcon"
                                                        id="hover_cursor_player"
                                                        onClick={() => setLoop(false)}  // 🔹 вимкнути
                                                    />
                                                )}
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
                                                <img src="src/images/icons/add_playlist.png" id="add_playlist_icon"
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
            <div className="top_creators_container">
                <div className="top_creators_top_text_container baloo2 text-lightpurple  text-[24px] font-bold">
                    TOP CREATORS
                </div>
                <div className="top_creators_creators_container">
                    {users.slice(0, 4).map((user, index) => (
                        <li className="top_creator_container baloo2
                     text-white text-[20px] font-bold"
                            key={user.id}>
                            <div className="top_creators_numeration baloo2">
                                {index + 1}.
                            </div>

                            <img className="top_creators_avatar_container" src={getUserAvatarUrl(user)}
                                 alt={"userAvatar"}/>
                            <div className="top_creators_author_container">
                                {user.username}
                            </div>
                            <button className="top_creators_follow_button_container">
                                Follow
                            </button>
                        </li>
                    ))}
                </div>
            </div>
            <div className="recommended_for_you_container">
                <div className="top_creators_top_text_container baloo2 text-lightpurple  text-[24px] font-bold">
                    RECOMMENDED TO YOU
                </div>
                <div className="top_creators_creators_container">
                    {users.slice(0, 4).map((user) => (
                        <li className="top_creator_container baloo2
                     text-white text-[20px] font-bold"
                            key={user.id}>
                            <img className="top_creators_avatar_container" src={getUserAvatarUrl(user)}
                                 alt={"userAvatar"}/>
                            <div className="recommended_for_you_author_container">
                                {user.username}
                            </div>
                            <button className="recommended_for_you_follow_button_container">
                                Follow
                            </button>
                        </li>
                    ))}
                </div>
            </div>
            <div className="pagination_container_feed_page baloo2">
                {currentPage!==1? (
                    <img
                        src="src/images/icons/arrow_left_side_bar.png"
                        className="pagination_prev_container"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    />

                ):(
                    <img
                        className="pagination_prev_container"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    />
                )}


                {Array.from({length: totalPages}, (_, i) => (
                    <button
                        key={i}
                        className={currentPage === i + 1 ? "text-[32px]" : ""}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                {currentPage!==totalPages? (
                    <img
                        src="src/images/icons/arrow_right_side_bar.png"
                        className="pagination_prev_container"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    />

                ):(
                    <img
                        className="pagination_prev_container"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    />
                )}
            </div>
            <div className="history_container">
                <div className="top_creators_top_text_container baloo2 text-lightpurple  text-[24px] font-bold">
                    HISTORY
                </div>
                <div className="top_creators_creators_container">
                    {history.length === 0 ? (
                        <p className="baloo2 text-lightpurple text-[24px] font-bold">You haven't listened to the music
                            yet, but you can start right now!</p>
                    ) : (
                        history.slice(0, 4).map((track) => (
                            <li className="top_creator_container baloo2
                     text-white text-[20px] font-bold"
                                key={track.id}>
                                <img className="history_track_image_container" src={getTrackImageUrl(track)}
                                     alt={"userAvatar"}
                                     onClick={() => playTrack(track)}
                                />
                                <div className="history_track_information_container">
                                    <div className="history_track_author baloo2">
                                        {track.author}
                                    </div>
                                    <div className="history_track_title baloo2">
                                        {track.title.length > 20 ?
                                            track.title.slice(0, 15) + "…" : track.title}
                                    </div>
                                </div>
                                <div className="history_buttons_container">
                                    <div className="history_like">
                                        <img src="src/images/icons/unlike.png"
                                             alt={"like"}/>
                                    </div>
                                    <div className="history_add_info">
                                        <img src="src/images/icons/more_info.png"
                                             alt={"like"}/>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </div>

            </div>

            <audio ref={audioRef}/>
        </main>
    );
}

export default FeedPage;