import React, {useEffect, useState} from 'react';
import {trackService} from '../../services/trackApi';
import {ITrack} from '../../types/track';
import "../../styles/main_pages/library_page/layout.css";
import {usePlayerStore} from "../../store/player_store.tsx";
import "../../styles/General.css"
// const tabs = ["All","History", "Likes", "Following" ,"Albums","Playlists"];
const LibraryPage: React.FC = () => {
    // const [activeTab, setActiveTab] = useState<string>("All");

    const [tracks, setTracks] = useState<ITrack[]>([]);
    const [, setLoading] = useState<boolean>(true);

    const playTrack = usePlayerStore(state => state.playTrack);
    // const pauseTrack = usePlayerStore((state) => state.pauseTrack);

    const history = usePlayerStore(state => state.history);

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
        <div className="layout_container mb-[2000px] baloo2">
            <div className="library_page_all_container">
                {/*--------------------HISTORY------------------------*/}
                <div className="library_page_category_container">
                    <div className="title_container">
                    <span className="txt_style">
                        History
                    </span>
                        <button className="button_see_all">
                            See all
                        </button>
                    </div>
                    <div className="body_info_container">
                        {history.length === 0 ? (
                            <p className="baloo2 text-lightpurple text-[24px]">You haven't listened to the music
                                yet, but you can start right now!</p>
                        ) : (
                            history.slice(0, 7).map((track) => (
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
                        <button className="button_see_all">
                            See all
                        </button>
                    </div>
                    <div className="body_info_container">
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
            </div>
        </div>
    );
};

export default LibraryPage;
