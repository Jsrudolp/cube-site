"use client";

import { useState, useEffect } from "react";
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

  // On mount, check URL hash for a song to auto-play
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const album = ALBUMS.find((a) => a.id === hash);
      if (album) setActiveAlbum(album);
    }
  }, []);

  // Update URL hash when active album changes
  useEffect(() => {
    if (activeAlbum) {
      window.history.replaceState(null, "", `#${activeAlbum.id}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [activeAlbum]);

  return (
    <FaceLayout faceId="music" className="bg-[#100023] text-white !pt-0 font-[family-name:var(--font-work-sans)]">
      {/* Hero - Full viewport */}
      <div className="relative w-screen h-screen flex items-end justify-center overflow-hidden">
        {/* Hero background - no gradient overlay */}
        <div className="absolute inset-0 bg-[url('/music-hero.png')] bg-cover bg-center" />

        {/* Hero content - positioned in lower third */}
        <div className="relative text-center z-10 pb-[calc(8vh+64px)]">
          <p className="text-xs sm:text-sm uppercase tracking-[0.1em] font-semibold text-white/90 mb-2 sm:mb-3">
            New Demo
          </p>
          <h1 className="text-[6vw] sm:text-5xl md:text-7xl font-bold uppercase tracking-wider font-[family-name:var(--font-druk-wide-bold)]">
            Supermagnetic
          </h1>
          <button
            onClick={() => setActiveAlbum(ALBUMS.find((a) => a.id === "supermagnetic") || null)}
            className="mt-4 sm:mt-6 px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#100023] rounded-md text-xs sm:text-sm uppercase tracking-wider font-semibold hover:bg-white/90 transition-colors"
          >
            Listen Now
          </button>
        </div>
      </div>

      {/* Album section */}
      <div className="w-[92%] sm:w-[90%] lg:w-[82%] max-w-[1280px] mx-auto pb-32">
        {/* Section header */}
        <div className="mt-12 sm:mt-[80px] mb-4 sm:mb-6">
          <h2 className="text-base sm:text-xl font-bold uppercase tracking-wider font-[family-name:var(--font-druk-wide-bold)]">Music</h2>
        </div>

        {/* Description box with gradient border */}
        <div className="relative mb-6 md:mb-12">
          <div className="border-t-[6px] border-l-2 border-r-2 border-b-2 border-[#584D65] bg-gradient-to-r from-[#1D0D30] to-[#332647] py-3 px-4 sm:px-6 text-center">
            <p className="text-sm sm:text-base text-white/40 leading-snug">
              Raw demos of songs I&apos;ve written and recorded + album artwork and photography.
              <br className="hidden sm:inline" />
              <span className="sm:hidden"> </span>
              <span className="hidden sm:inline">Click</span>
              <span className="sm:hidden">Tap</span>
              {" "}on an album cover to listen.
            </p>
          </div>
        </div>

        {/* Album grids — subgrid ensures images in the same row always align */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 md:gap-x-12">
          {ALBUMS.map((album) => (
            <button
              key={album.id}
              onClick={() => setActiveAlbum(album)}
              className={`row-span-2 grid [grid-template-rows:subgrid] text-left group transition-opacity ${
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
              <p className="mt-2 sm:mt-3 pb-4 sm:pb-6 md:pb-12 text-[10px] sm:text-sm uppercase tracking-wider text-center text-white/70 group-hover:text-white transition-colors font-[family-name:var(--font-druk-wide-bold)]">
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
