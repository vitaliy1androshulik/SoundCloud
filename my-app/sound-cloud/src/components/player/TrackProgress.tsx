import React, { useEffect, useState } from "react";
import { ITrack } from "../../types/track";

interface TrackProgressProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    track: ITrack;
}

export const TrackProgress: React.FC<TrackProgressProps> = ({ audioRef, track }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // обчислення прогресу
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const setAudioDuration = () => setDuration(audio.duration || 0);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", setAudioDuration);

        // Якщо трек вже завантажений, одразу встановлюємо duration
        if (audio.readyState >= 1) setAudioDuration();

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
        };
    }, [track, audioRef]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newTime = Number(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <>
            <div className="track_duration_first_time_container">
                {formatTime(currentTime)}
            </div>
            <div>
                <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    className="track_duration_input"
                    onChange={handleSeek}
                    style={{ "--val": `${progressPercent}%` } as React.CSSProperties}
                />
            </div>
            <div className="track_duration_second_time_container">
                {formatTime(duration)}
            </div>
        </>
    );
};