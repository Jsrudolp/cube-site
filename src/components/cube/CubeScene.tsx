"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { FaceId } from "@/lib/faces";
import { CAMERA_POSITION, CAMERA_FOV } from "@/lib/cube-config";
import { InteractiveCube } from "./InteractiveCube";
import { CubeShadow } from "./CubeShadow";
import type { CubeHandoffState } from "./hooks/useFaceNavigation";

interface CubeSceneProps {
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  onHandoff?: (state: CubeHandoffState) => void;
  animationDuration?: number;
  initialFace?: FaceId;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#e5e5e0" wireframe />
    </mesh>
  );
}

export function CubeScene({
  onZoomStart,
  onZoomComplete,
  onHandoff,
  animationDuration = 1800,
  initialFace,
}: CubeSceneProps) {
  const [isZooming, setIsZooming] = useState(false);

  const handleZoomStart = (faceId: FaceId) => {
    setIsZooming(true);
    onZoomStart?.(faceId);
  };

  const handleZoomComplete = (faceId: FaceId) => {
    onZoomComplete?.(faceId);
  };

  const handleHandoff = (state: CubeHandoffState) => {
    setIsZooming(true);
    onHandoff?.(state);
  };

  return (
    <div
      className="w-full h-full touch-none"
      style={{ cursor: isZooming ? "default" : "grab" }}
    >
      <Canvas
        camera={{
          position: CAMERA_POSITION,
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        {/* Cube */}
        <Suspense fallback={<LoadingFallback />}>
          <InteractiveCube
            onZoomStart={handleZoomStart}
            onZoomComplete={handleZoomComplete}
            onHandoff={handleHandoff}
            disabled={isZooming}
            animationDuration={animationDuration}
            initialFace={initialFace}
          />
        </Suspense>

        {/* Shadow */}
        <CubeShadow />
      </Canvas>
    </div>
  );
}
