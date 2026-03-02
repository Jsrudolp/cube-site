"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import { CAMERA_POSITION, CAMERA_FOV } from "@/lib/cube-config";
import { InteractiveCube } from "./InteractiveCube";
import { CubeShadow } from "./CubeShadow";

export interface CubeRestoreState {
  quaternion: [number, number, number, number];
  cameraPosition: [number, number, number];
}

interface CubeSceneProps {
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  onZoomOutComplete?: (state?: CubeRestoreState) => void;
  onSwitchComplete?: (faceId: FaceId) => void;
  onFirstInteraction?: () => void;
  animationDuration?: number;
  initialFace?: FaceId;
  initialZoomedFace?: FaceId;
  zoomOutFromFace?: FaceId;
  zoomInToFace?: FaceId;
  switchToFace?: FaceId;
  restoreState?: CubeRestoreState;
  disabled?: boolean;
  dynamicTextures?: (THREE.CanvasTexture | null)[];
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#EDEDED" />
    </mesh>
  );
}

export function CubeScene({
  onZoomStart,
  onZoomComplete,
  onZoomOutComplete,
  onSwitchComplete,
  onFirstInteraction,
  animationDuration = 1800,
  initialFace,
  initialZoomedFace,
  zoomOutFromFace,
  zoomInToFace,
  switchToFace,
  restoreState,
  disabled = false,
  dynamicTextures,
}: CubeSceneProps) {
  return (
    <div
      className="w-full h-full touch-none"
      style={{ cursor: disabled ? "default" : "grab" }}
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
        <Suspense fallback={<LoadingFallback />}>
          <InteractiveCube
            onZoomStart={onZoomStart}
            onZoomComplete={onZoomComplete}
            onZoomOutComplete={onZoomOutComplete}
            onSwitchComplete={onSwitchComplete}
            onFirstInteraction={onFirstInteraction}
            disabled={disabled}
            animationDuration={animationDuration}
            initialFace={initialFace}
            initialZoomedFace={initialZoomedFace}
            zoomOutFromFace={zoomOutFromFace}
            zoomInToFace={zoomInToFace}
            switchToFace={switchToFace}
            restoreState={restoreState}
            dynamicTextures={dynamicTextures}
          />
        </Suspense>

        <CubeShadow />
      </Canvas>
    </div>
  );
}
