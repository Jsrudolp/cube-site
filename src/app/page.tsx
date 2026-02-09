"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CubeScene, CubeHud, CSSCubeZoom } from "@/components/cube";
import type { CubeHandoffState } from "@/components/cube";
import { FaceId, FACES } from "@/lib/faces";

// Valid face IDs for query param validation
const VALID_FACE_IDS = FACES.map(f => f.id);

// Animation duration in ms
const ANIMATION_DURATION = 1800;

function HomeContent() {
  const [handoffState, setHandoffState] = useState<CubeHandoffState | null>(null);
  const [webglVisible, setWebglVisible] = useState(true);
  const searchParams = useSearchParams();

  // Get initial face from query param (for returning from a face page)
  const fromParam = searchParams.get("from");
  const initialFace = fromParam && VALID_FACE_IDS.includes(fromParam as FaceId)
    ? (fromParam as FaceId)
    : undefined;

  const handleHandoff = (state: CubeHandoffState) => {
    // Hide WebGL canvas and show CSS 3D cube
    setWebglVisible(false);
    setHandoffState(state);
  };

  const handleZoomComplete = () => {
    // Reset state after navigation
    setHandoffState(null);
    setWebglVisible(true);
  };

  return (
    <div className="min-h-screen bg-[#e5e5e0]">
      {/* 3D Cube Scene (WebGL) */}
      <div
        className="fixed inset-0"
        style={{
          opacity: webglVisible ? 1 : 0,
          pointerEvents: webglVisible ? "auto" : "none",
        }}
      >
        <CubeScene
          onHandoff={handleHandoff}
          animationDuration={ANIMATION_DURATION}
          initialFace={initialFace}
        />
      </div>

      {/* HUD Overlay */}
      <CubeHud />

      {/* CSS 3D Cube for zoom animation */}
      <CSSCubeZoom
        handoffState={handoffState}
        onComplete={handleZoomComplete}
        animationDuration={ANIMATION_DURATION}
      />
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
