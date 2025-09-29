import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {albumService} from "../../services/albumAPI.ts";
import {IAlbum} from "../../types/album.ts";
import "../../styles/play_album/layout.css"
import {ITrack} from "../../types/track.ts";
import {usePlayerStore} from "../../store/player_store.tsx";

import play_icon from "../../images/player/play_big.png";
import pause_icon from "../../images/player/pause_big.png";
import next_icon from "../../images/player/next_big.png";
import previous_icon from "../../images/player/prev_big.png";

import pause from "../../images/player/pause_icon.png";
import play from "../../images/player/play_icon.png";

const AlbumPage: React.FC = () => {
        const {id} = useParams<{ id: string }>();
        const [album, setAlbum] = useState<IAlbum | null>(null);

        const isPlaying = usePlayerStore(state => state.isPlaying);
        const togglePlay = usePlayerStore(state => state.togglePlay);
        const currentTrack = usePlayerStore(state => state.track);
        const playTrack = usePlayerStore(state => state.playTrack);
        const pauseTrack = usePlayerStore(state => state.pauseTrack);
        const {nextTrack, previousTrack} = usePlayerStore();
        const [tracks, setTracks] = useState<ITrack[]>([]);

    useEffect(() => {
        if (!id) return;
        usePlayerStore.getState().clearTrack();

        const fetchAlbumAndTracks = async () => {
            try {
                const albumData = await albumService.getAlbumById(Number(id));
                setAlbum(albumData);

                const albumTracks = await albumService.getTracks(Number(id));
                setTracks(albumTracks);

            } catch (err) {
                console.error("Error fetching album or tracks:", err);
            }
        };

        fetchAlbumAndTracks();
    }, [id]);


        if (!album) return <p>Loading...</p>;

        return (
            <div className="layout_container mb-[500px] baloo2">
                <div className="play_album_track_player_container">
                    <div className="background_gradient">
                        <div className="title_author_container">
                            <div className="title_style">
                                {album.title}
                            </div>
                            <div className="author_style">
                                {album.ownerName}
                            </div>
                        </div>

                        <img src={previous_icon} className="previous_icon_style"
                             onClick={() => previousTrack()}
                        />
                        <div
                            className="play_icon_container"
                            onClick={() => {
                                if (!currentTrack && tracks.length > 0) {
                                    // 🔹 Якщо трек ще не вибрано, запускаємо перший
                                    playTrack(tracks[0], tracks, album.id);
                                } else {
                                    // 🔹 Якщо вже є трек, просто пауза/продовження
                                    togglePlay();
                                }
                            }}
                        >
                            {isPlaying ? (
                                <img
                                    src={pause_icon}
                                    className="pause_icon_style"
                                />
                            ) : (
                                <img
                                    src={play_icon}
                                    className="play_icon_style"
                                />
                            )}
                        </div>
                        <img src={next_icon} className="next_icon_style"
                             onClick={() => nextTrack()}
                        />

                        <div className="genre_style">
                            {currentTrack?.genre ? `${currentTrack.genre}` : ""}
                        </div>
                        <img className="image_style"
                             src={currentTrack?.imageUrl ? `http://localhost:5122/${currentTrack.imageUrl}` : `http://localhost:5122/${album.coverUrl}`}/>
                    </div>
                </div>
                <div className="play_album_track_list_container">
                    <div className="title_container">
                        <span className="txt_style">Next up</span>
                    </div>
                    <div className="tracks_container">
                        {tracks.length === 0 ? (
                            <p>No tracks in this album</p>
                        ) : (
                            tracks.map((track, index) => {
                                const isCurrent = currentTrack?.id === track.id;
                                return (
                                    <div
                                        key={track.id}
                                        className={`track_item ${isCurrent ? "current_track" : ""}`}
                                        style={{
                                            display: "flex",               // 🔹 flex row
                                            alignItems: "center",          // вирівнювання по центру
                                            justifyContent: "space-between", // кнопка праворуч
                                            cursor: "pointer",
                                            background: isCurrent ? "linear-gradient(90deg, rgba(16, 16, 16, 0) 40%, #5241B3 100%)" : "transparent",
                                            gap: "16px",
                                            width:"100%"
                                        }}
                                    >
                                        <div className="track_info_image_container"
                                             style={{display: "flex", alignItems: "center", gap: "16px"}}>
                                            <img
                                                className="img_style"
                                                src={`http://localhost:5122/${track.imageUrl}`}
                                                onClick={() => playTrack(track, tracks, album.id)}
                                            />
                                            <div className="track_info track_text">
                                                <span>{index + 1}</span>
                                                <div>&#160;&#x2022;&#160;</div>
                                                <span>{track.author}</span>
                                                <div>&#160;&#x2022;&#160;</div>
                                                <span>{track.title.length > 80 ? track.title.slice(0, 50) + "…" : track.title}</span>
                                            </div>
                                        </div>

                                        <div className="play_pause_container">
                                            {isCurrent && isPlaying ? (
                                                <img
                                                    src={pause}
                                                    alt="pauseIcon"
                                                    onClick={() => pauseTrack()}
                                                />
                                            ) : (
                                                <img
                                                    src={play}
                                                    alt="playIcon"
                                                    onClick={() => playTrack(track, tracks)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>
            </div>
        );
};

export default AlbumPage;