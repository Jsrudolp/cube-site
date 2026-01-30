"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Track {
  title: string;
  src: string;
}

interface AudioPlayerProps {
  albumTitle: string;
  tracks: Track[];
  onClose: () => void;
}

export default function AudioPlayer({ albumTitle, tracks, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = tracks[currentTrackIndex];

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setProgress(time);
  };

  const handleTrackEnd = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) {
      audio.play();
    }
  }, [currentTrackIndex, isPlaying]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mt-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">{albumTitle}</p>
          <p className="text-white font-medium">{currentTrack?.title || "No track"}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white text-xl transition-colors"
          aria-label="Close player"
        >
          &times;
        </button>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      {tracks.length > 1 && (
        <div className="mt-4 space-y-1">
          {tracks.map((track, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentTrackIndex(i);
                setIsPlaying(true);
              }}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                i === currentTrackIndex
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {i + 1}. {track.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
