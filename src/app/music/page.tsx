"use client";

import { useState } from "react";
import FaceLayout from "@/components/FaceLayout";
import AudioPlayer from "@/components/AudioPlayer";

interface Album {
  id: string;
  title: string;
  cover: string;
  tracks: { title: string; src: string }[];
}

const ALBUMS: Album[] = [
  {
    id: "suffocating",
    title: "Suffocating",
    cover: "/albums/suffocating.jpg",
    tracks: [{ title: "Suffocating (Demo)", src: "/audio/suffocating.mp3" }],
  },
  {
    id: "already-warned",
    title: "Already Warned",
    cover: "/albums/already-warned.jpg",
    tracks: [{ title: "Already Warned (Demo)", src: "/audio/already-warned.mp3" }],
  },
  {
    id: "supermagnetic",
    title: "Supermagnetic",
    cover: "/albums/supermagnetic.jpg",
    tracks: [{ title: "Supermagnetic (Demo)", src: "/audio/supermagnetic.mp3" }],
  },
  {
    id: "lab-rat",
    title: "Lab Rat",
    cover: "/albums/lab-rat.jpg",
    tracks: [{ title: "Lab Rat (Demo)", src: "/audio/lab-rat.mp3" }],
  },
  {
    id: "falling-down",
    title: "Falling Down",
    cover: "/albums/falling-down.jpg",
    tracks: [{ title: "Falling Down (Demo)", src: "/audio/falling-down.mp3" }],
  },
  {
    id: "friendship-cemetery",
    title: "Friendship Cemetery",
    cover: "/albums/friendship-cemetery.jpg",
    tracks: [{ title: "Friendship Cemetery (Demo)", src: "/audio/friendship-cemetery.mp3" }],
  },
];

export default function MusicPage() {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);

  return (
    <FaceLayout faceId="music" className="bg-[#1a1a2e] text-white">
      {/* Hero */}
      <div className="relative w-full h-[50vh] min-h-[400px] bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
        {/* Hero background placeholder — replace with performance photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-[#1a1a2e]" />
        <div className="absolute inset-0 bg-[url('/photos/hero-music.jpg')] bg-cover bg-center opacity-60" />

        <div className="relative text-center z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70 mb-2">
            New Demo
          </p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-wider">
            Supermagnetic
          </h1>
          <button
            onClick={() => setActiveAlbum(ALBUMS.find((a) => a.id === "supermagnetic") || null)}
            className="mt-6 px-8 py-3 border border-white/60 rounded-full text-sm uppercase tracking-wider hover:bg-white/10 transition-colors"
          >
            Listen Now
          </button>
        </div>
      </div>

      {/* Album section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider">Music</h2>
          <hr className="mt-2 border-white/20" />
        </div>

        {/* Album grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {ALBUMS.map((album) => (
            <button
              key={album.id}
              onClick={() => setActiveAlbum(album)}
              className={`text-left group transition-opacity ${
                activeAlbum && activeAlbum.id !== album.id ? "opacity-50" : ""
              }`}
            >
              <div className="aspect-square bg-[#2a2a4e] rounded-lg overflow-hidden">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-sm uppercase tracking-wider text-center text-white/70 group-hover:text-white transition-colors">
                {album.title}
              </p>
            </button>
          ))}
        </div>

        {/* Audio player */}
        {activeAlbum && (
          <AudioPlayer
            albumTitle={activeAlbum.title}
            tracks={activeAlbum.tracks}
            onClose={() => setActiveAlbum(null)}
          />
        )}

        {/* Footer note */}
        <p className="mt-12 text-center text-sm text-white/40 leading-relaxed">
          Raw demos of songs I&apos;ve written and recorded + album artwork and
          photography + code.
          <br />
          Click or press on an album cover to listen.
        </p>
      </div>
    </FaceLayout>
  );
}
