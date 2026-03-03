"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import { INITIAL_ROTATION } from "@/lib/cube-config";
import { useCubeRotation } from "./hooks/useCubeRotation";
import { useFaceNavigation } from "./hooks/useFaceNavigation";
import {
  createAllPlaceholderTextures,
  createMaterials,
} from "./cubeTextures";
import { createEdgeGeometry } from "./createEdgeGeometry";
import type { CubeRestoreState } from "./CubeScene";

interface InteractiveCubeProps {
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  onZoomOutComplete?: (state?: CubeRestoreState) => void;
  onSwitchComplete?: (faceId: FaceId) => void;
  onFirstInteraction?: () => void;
  disabled?: boolean;
  animationDuration?: number;
  initialFace?: FaceId;
  initialZoomedFace?: FaceId;
  zoomOutFromFace?: FaceId;
  zoomInToFace?: FaceId;
  switchToFace?: FaceId;
  restoreState?: CubeRestoreState;
  dynamicTextures?: (THREE.CanvasTexture | null)[];
}

export function InteractiveCube({
  onZoomStart,
  onZoomComplete,
  onZoomOutComplete,
  onSwitchComplete,
  onFirstInteraction,
  disabled = false,
  animationDuration = 1800,
  initialFace,
  initialZoomedFace,
  zoomOutFromFace,
  zoomInToFace,
  switchToFace,
  restoreState,
  dynamicTextures,
}: InteractiveCubeProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const hasInteracted = useRef(false);
  const geometry = useMemo(() => new THREE.BoxGeometry(2, 2, 2), []);
  const edgeGeometry = useMemo(() => createEdgeGeometry(), []);
  const edgeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#EDEDED" }), []);

  // Create materials synchronously via useMemo — single render path, no fallback branch.
  // This avoids R3F reconciliation issues where removing/adding the `rotation` prop
  // between two different JSX trees would reset the mesh quaternion.
  const initialMaterials = useMemo(() => {
    if (typeof window === "undefined") return [];
    const placeholders = createAllPlaceholderTextures();
    return createMaterials(placeholders);
  }, []);
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>(initialMaterials);

  // Update individual face materials when dynamic textures arrive
  useEffect(() => {
    if (!dynamicTextures || materialsRef.current.length === 0) return;

    let updated = false;
    const newMaterials = [...materialsRef.current];

    for (let i = 0; i < dynamicTextures.length; i++) {
      const dynTex = dynamicTextures[i];
      if (dynTex && newMaterials[i]?.map !== dynTex) {
        newMaterials[i].map?.dispose();
        newMaterials[i].dispose();
        newMaterials[i] = new THREE.MeshBasicMaterial({ map: dynTex });
        updated = true;
      }
    }

    if (updated) {
      materialsRef.current = newMaterials;
      // Force R3F to pick up new materials by updating the mesh directly
      if (meshRef.current) {
        meshRef.current.material = newMaterials;
      }
    }
  }, [dynamicTextures]);

  // Cleanup materials on unmount
  useEffect(() => {
    return () => {
      materialsRef.current.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    };
  }, []);

  // Rotation hook
  const {
    onPointerDown: rotationPointerDown,
    onPointerMove,
    onPointerUp,
    update,
    hasDragged,
    setEnabled: setRotationEnabled,
  } = useCubeRotation({ meshRef, enabled: !disabled });

  // Trigger lazy capture of remaining faces on first interaction
  const onPointerDown = useCallback(
    (e: Parameters<typeof rotationPointerDown>[0]) => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        onFirstInteraction?.();
      }
      rotationPointerDown(e);
    },
    [rotationPointerDown, onFirstInteraction]
  );

  // Navigation hook
  const { onClick, isAnimating } = useFaceNavigation({
    meshRef,
    hasDragged,
    onZoomStart: (faceId) => {
      setRotationEnabled(false);
      onZoomStart?.(faceId);
    },
    onZoomComplete,
    onZoomOutComplete,
    onSwitchComplete,
    enabled: !disabled,
    animationDuration,
    initialZoomedFace,
    zoomOutFromFace,
    zoomInToFace,
    switchToFace,
  });

  // Update rotation each frame (skipped while zoom animation is running)
  useFrame(() => {
    if (!isAnimating.current) {
      update();
    }
  });

  // Set initial cube orientation on mount.
  // If restoreState exists (saved from a previous zoom-out), apply that quaternion
  // and camera position so the cube appears exactly where the animation left it.
  // Otherwise, use INITIAL_ROTATION for a fresh home-page load.
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!meshRef.current || hasInitialized.current || initialZoomedFace) return;
    hasInitialized.current = true;

    if (restoreState) {
      const [qx, qy, qz, qw] = restoreState.quaternion;
      meshRef.current.quaternion.set(qx, qy, qz, qw);
      camera.position.set(...restoreState.cameraPosition);
      camera.lookAt(0, 0, 0);
    } else {
      meshRef.current.rotation.set(...INITIAL_ROTATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <mesh
      ref={meshRef}
      material={initialMaterials.length > 0 ? materialsRef.current : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
      geometry={geometry}
    >
      {initialMaterials.length === 0 && (
        <meshBasicMaterial color="#888" />
      )}
      <mesh geometry={edgeGeometry} material={edgeMaterial} />
    </mesh>
  );
}
