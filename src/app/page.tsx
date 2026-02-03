"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CubeScene, CubeHud, FadeOverlay } from "@/components/cube";
import { FaceId, FACES } from "@/lib/faces";

// Valid face IDs for query param validation
const VALID_FACE_IDS = FACES.map(f => f.id);

// Animation duration in ms
const ANIMATION_DURATION = 1800;

function HomeContent() {
  const [fadeVisible, setFadeVisible] = useState(false);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();

  // Get initial face from query param (for returning from a face page)
  const fromParam = searchParams.get("from");
  const initialFace = fromParam && VALID_FACE_IDS.includes(fromParam as FaceId)
    ? (fromParam as FaceId)
    : undefined;

  const handleZoomStart = (_faceId: FaceId) => {
    // Start fade halfway through the zoom animation
    fadeTimeoutRef.current = setTimeout(() => {
      setFadeVisible(true);
    }, ANIMATION_DURATION * 0.4);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#e5e5e0]">
      {/* 3D Cube Scene */}
      <div className="fixed inset-0">
        <CubeScene
          onZoomStart={handleZoomStart}
          animationDuration={ANIMATION_DURATION}
          initialFace={initialFace}
        />
      </div>

      {/* HUD Overlay */}
      <CubeHud />

      {/* Fade overlay for navigation transition */}
      <FadeOverlay visible={fadeVisible} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e5e5e0]" />}>
      <HomeContent />
    </Suspense>
  );
}
