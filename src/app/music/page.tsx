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
    cover: "/albums/suffocating.png",
    tracks: [{ title: "Suffocating (Demo)", src: "/audio/suffocating.mp3" }],
  },
  {
    id: "supermagnetic",
    title: "Supermagnetic",
    cover: "/albums/supermagnetic.png",
    tracks: [{ title: "Supermagnetic (Demo)", src: "/audio/supermagnetic.mp3" }],
  },
  {
    id: "lab-rat",
    title: "Lab Rat",
    cover: "/albums/lab-rat.png",
    tracks: [{ title: "Lab Rat (Demo)", src: "/audio/lab-rat.mp3" }],
  },
  {
    id: "friendship-cemetery",
    title: "Friendship Cemetery",
    cover: "/albums/friendship-cemetery.png",
    tracks: [{ title: "Friendship Cemetery (Demo)", src: "/audio/friendship-cemetery.mp3" }],
  },
  {
    id: "falling-down",
    title: "Falling Down",
    cover: "/albums/falling-down.png",
    tracks: [{ title: "Falling Down (Demo)", src: "/audio/falling-down.mp3" }],
  },
  {
    id: "step-into-the-fire",
    title: "Step Into The Fire",
    cover: "/albums/step-into-the-fire.png",
    tracks: [{ title: "Step Into The Fire (Demo)", src: "/audio/step-into-the-fire.mp3" }],
  },
];

export default function MusicPage() {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);

  return (
    <FaceLayout faceId="music" className="bg-[#100023] text-white !pt-0">
      {/* Hero - Full viewport */}
      <div className="relative w-screen h-screen flex items-end justify-center overflow-hidden">
        {/* Hero background - no gradient overlay */}
        <div className="absolute inset-0 bg-[url('/music-hero.png')] bg-cover bg-center" />

        {/* Hero content - positioned in lower third */}
        <div className="relative text-center z-10 pb-[15vh]">
          <p className="text-sm uppercase tracking-[0.3em] text-white/90 mb-3">
            New Demo
          </p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider">
            Supermagnetic
          </h1>
          <button
            onClick={() => setActiveAlbum(ALBUMS.find((a) => a.id === "supermagnetic") || null)}
            className="mt-6 px-8 py-3 bg-white text-[#100023] rounded-md text-sm uppercase tracking-wider font-semibold hover:bg-white/90 transition-colors"
          >
            Listen Now
          </button>
        </div>
      </div>

      {/* Album section */}
      <div className="w-[90%] max-w-[1280px] mx-auto pb-32">
        {/* Section header */}
        <div className="mt-12 mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider">Music</h2>
        </div>

        {/* Description box with gradient border */}
        <div className="relative mb-6 md:mb-12">
          <div className="border-t-[6px] border-l-2 border-r-2 border-b-2 border-white/30 bg-gradient-to-r from-white/5 to-white/15 py-3 px-6 text-center">
            <p className="text-base text-white/60 leading-snug">
              Raw demos of songs I&apos;ve written and recorded + album artwork and photography.
              <br />
              Click or press on an album cover to listen.
            </p>
          </div>
        </div>

        {/* Album grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
          {ALBUMS.map((album) => (
            <button
              key={album.id}
              onClick={() => setActiveAlbum(album)}
              className={`text-left group transition-opacity ${
                activeAlbum && activeAlbum.id !== album.id ? "opacity-50" : ""
              }`}
            >
              <div className="aspect-square bg-[#2a2a4e] overflow-hidden">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm uppercase tracking-wider text-center text-white/70 group-hover:text-white transition-colors">
                {album.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky audio player */}
      {activeAlbum && (
        <AudioPlayer
          key={activeAlbum.id}
          albumTitle={activeAlbum.title}
          tracks={activeAlbum.tracks}
          onClose={() => setActiveAlbum(null)}
        />
      )}
    </FaceLayout>
  );
}
