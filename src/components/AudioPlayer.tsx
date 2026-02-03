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
  const [isPlaying, setIsPlaying] = useState(true); // Autoplay when selected
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

  // Play when track changes or component mounts
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) {
      audio.play().catch((err) => {
        console.error("Audio play error:", err);
      });
    }
  }, [currentTrackIndex, isPlaying, tracks]);

  // Autoplay on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch((err) => {
      console.error("Audio autoplay error:", err);
    });
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Get MIME type based on file extension
  const getMimeType = (src: string) => {
    if (src.endsWith(".m4a")) return "audio/mp4";
    if (src.endsWith(".mp3")) return "audio/mpeg";
    if (src.endsWith(".wav")) return "audio/wav";
    if (src.endsWith(".ogg")) return "audio/ogg";
    return "audio/mpeg";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t border-white/10 bg-white/15">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" />
                <rect x="9" y="2" width="4" height="12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2 L14 8 L4 14 Z" />
              </svg>
            )}
          </button>

          {/* Track info and progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="truncate">
                <span className="text-xs text-white/50 uppercase tracking-wider">{albumTitle}</span>
                <span className="text-white/30 mx-2">·</span>
                <span className="text-white font-medium">{currentTrack?.title || "No track"}</span>
              </div>
              <div className="text-xs text-white/40 ml-4 flex-shrink-0">
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-2xl transition-colors flex-shrink-0 ml-2"
            aria-label="Close player"
          >
            ×
          </button>
        </div>

        {/* Tracklist (only if multiple tracks) */}
        {tracks.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {tracks.map((track, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentTrackIndex(i);
                  setIsPlaying(true);
                }}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  i === currentTrackIndex
                    ? "bg-white/20 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {track.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      >
        {currentTrack && (
          <source src={currentTrack.src} type={getMimeType(currentTrack.src)} />
        )}
      </audio>
    </div>
  );
}
