"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import { CAMERA_POSITION, CAMERA_FOV } from "@/lib/cube-config";
import { InteractiveCube } from "./InteractiveCube";
import { CubeShadow } from "./CubeShadow";

interface CubeSceneProps {
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  animationDuration?: number;
  initialFace?: FaceId;
  dynamicTextures?: (THREE.CanvasTexture | null)[];
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#EDEDED" wireframe />
    </mesh>
  );
}

export function CubeScene({
  onZoomStart,
  onZoomComplete,
  animationDuration = 1800,
  initialFace,
  dynamicTextures,
}: CubeSceneProps) {
  const [isZooming, setIsZooming] = useState(false);

  const handleZoomStart = (faceId: FaceId) => {
    setIsZooming(true);
    onZoomStart?.(faceId);
  };

  const handleZoomComplete = (faceId: FaceId) => {
    onZoomComplete?.(faceId);
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
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
        style={{ background: "transparent" }}
      >
        {/* Cube */}
        <Suspense fallback={<LoadingFallback />}>
          <InteractiveCube
            onZoomStart={handleZoomStart}
            onZoomComplete={handleZoomComplete}
            disabled={isZooming}
            animationDuration={animationDuration}
            initialFace={initialFace}
            dynamicTextures={dynamicTextures}
          />
        </Suspense>

        {/* Shadow */}
        <CubeShadow />
      </Canvas>
    </div>
  );
}
