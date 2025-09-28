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
    const progressPercent = (currentTime / duration) * 99;
    const offset = Math.max(0, 1 - (currentTime / duration) * 1);
    const valWithOffset = Math.min(progressPercent + offset, 100);

    // слухачі часу
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

    // перемотування
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
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
                    style={{ "--val": `${valWithOffset}%` } as React.CSSProperties}
                />
            </div>
            <div className="track_duration_second_time_container">
                {Math.floor(duration / 60)}:{("0" + Math.floor(duration % 60)).slice(-2)}
            </div>
        </div>
    );
};