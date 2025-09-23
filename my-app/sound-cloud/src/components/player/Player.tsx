import {useRef, useEffect, useState} from "react";

import "../../styles/player/player.css";
import "../../styles/footer.css";
import {ITrack} from "../../types/track.ts";
import {usePlayerStore} from "../../store/player_store.tsx";
import api from "../../utilities/axiosInstance.ts";

interface PlayerProps {
    footerSelector: string;
}
export default function Player({ footerSelector }: PlayerProps) {
    const { track, isPlaying, togglePlay,nextTrack,previousTrack } = usePlayerStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [bottomOffset, setBottomOffset] = useState(0);

    const[loop, setLoop] = useState<boolean>(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const max = 1;
    const minBottom = 50;   // коли футер не видно
    const maxBottom = 100;  // коли футер повністю видно

    const progressPercent = (currentTime / duration) * 99;

// Випередження: чим ближче до кінця, тим менше
    const offset = Math.max(0, 1 - (currentTime / duration) * 1); // в процентах або пікселях
    const valWithOffset = Math.min(progressPercent + offset, 100);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };
    useEffect(() => {
        const footer = document.querySelector(footerSelector);
        if (!footer) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const ratio = entry.intersectionRatio; // від 0 до 1
                const offset = minBottom + (maxBottom - minBottom) * ratio;
                setBottomOffset(offset);
            },
            { threshold: Array.from({ length: 101 }, (_, i) => i / 100) } // спрацьовує на кожному 1% видимості
        );

        observer.observe(footer);
        return () => observer.disconnect();
    }, [footerSelector]);
    useEffect(() => {
        if (!audioRef.current || !track) return;
        api.post(`http://localhost:5122/api/Track/${track.id}/play`)

        audioRef.current.src = `http://localhost:5122${track.url}`;
        audioRef.current.play().catch((err) => console.log(err));
    }, [track]);

    // Керування паузою/відтворенням
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch((err) => console.log(err));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setAudioDuration = () => setDuration(audio.duration);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setAudioDuration);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
        };
    }, [track]);

    // функція для перемотування
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Number(e.target.value);
        setCurrentTime(Number(e.target.value));
    };

    const getTrackImageUrl = (track: ITrack) => {
        if (!track.imageUrl) return "/default-cover.png";
        return `http://localhost:5122${track.imageUrl}`;
    };

    if (!track) return null; // якщо трек не обрано, не рендеримо

    return (
        <div
            className="player_player_container baloo2"
            style={{
                position: "fixed",
                transform: "translateX(-50%)",
                left: "50%",
                bottom: `${bottomOffset}px`,
                zIndex: 100,
                transition: "bottom 0.1 linear",
            }}
        >
            <div className="player_track_container">
                <div className="player_track_image">
                    <img className="player_track_image" src={getTrackImageUrl(track)} alt={track.title}/>
                </div>
                <div className="player_track_title_container">
                    <div className="player_track_title">
                        {track.title.length > 20 ? track.title.slice(0, 17) + "…" : track.title}

                    </div>
                    <div className="player_track_author">
                        {track.author.length > 20 ? track.author.slice(0, 20) + "…" : track.author}
                    </div>
                </div>
                <div className="track_control_container">
                    <div className="track_control_repeat_container">

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
                    <div className="track_control_track_container">
                        <img src="/src/images/player/skip_previous_icon.png"
                             alt={"skipPreviousIcon"}
                             id="hover_cursor_player"
                             onClick={() => previousTrack()}
                        />
                        <button onClick={togglePlay}>{isPlaying ?
                            <img src="/src/images/player/pause_icon.png" id="hover_cursor_player" alt={"PauseIcon"}/>
                            :
                            <img src="/src/images/player/play_icon.png" id="hover_cursor_player" alt={"PlayIcon"}/>}
                        </button>
                        <img src="/src/images/player/skip_next_icon.png" id="hover_cursor_player" alt={"skipNextIcon"}
                             onClick={() => nextTrack()}
                        />
                    </div>
                    <div className="track_control_queue_container">
                        <img src="/src/images/player/queue_icon.png" id="hover_cursor_player" alt={"queueIcon"}/>
                    </div>
                </div>
                <div className="track_time_skip_container">
                    <div className="track_duration_first_time_container">
                        {Math.floor(currentTime / 60)}:{("0" + Math.floor(currentTime % 60)).slice(-2)}
                    </div>
                    <div>
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            value={currentTime}
                            className="track_duration_input"
                            onChange={handleSeek}
                            style={{"--val": `${valWithOffset}%`} as React.CSSProperties}
                        />
                    </div>


                    <div className="track_duration_second_time_container">
                        {Math.floor(duration / 60)}:{("0" + Math.floor(duration % 60)).slice(-2)}
                    </div>
                </div>
                <div className="track_loudness_container">
                    <div className="track_loudness_image_container">
                        <img src="/src/images/player/volume_up_icon.png" alt="Volume"/>
                    </div>
                    <div>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            className="volume_input"
                            step={0.001}
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{"--val": `${(volume / max) * 100}%`} as React.CSSProperties}
                        />
                    </div>


                </div>
            </div>
            {!loop? (
                <audio
                    ref={audioRef}
                    src={track.url}
                    onEnded={nextTrack}
                />
            ): (
                <audio
                    ref={audioRef}
                    src={track.url}
                    loop
                />
            )}

        </div>
    );
}