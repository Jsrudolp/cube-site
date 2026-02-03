"use client";

import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import { INITIAL_ROTATION, CANONICAL_QUATERNIONS } from "@/lib/cube-config";
import { useCubeRotation } from "./hooks/useCubeRotation";
import { useFaceNavigation } from "./hooks/useFaceNavigation";
import {
  createAllPlaceholderTextures,
  loadTexturesWithFallback,
  createMaterials,
} from "./cubeTextures";

interface InteractiveCubeProps {
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  disabled?: boolean;
  animationDuration?: number;
  initialFace?: FaceId;
}

// Helper to dispose materials and their textures
function disposeMaterials(materials: THREE.MeshStandardMaterial[]) {
  materials.forEach((m) => {
    m.map?.dispose();
    m.dispose();
  });
}

export function InteractiveCube({
  onZoomStart,
  onZoomComplete,
  disabled = false,
  animationDuration = 1800,
  initialFace,
}: InteractiveCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [materials, setMaterials] = useState<THREE.MeshStandardMaterial[]>([]);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Keep ref in sync for cleanup
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  // Load textures with proper cleanup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const placeholders = createAllPlaceholderTextures();
    const placeholderMaterials = createMaterials(placeholders);
    setMaterials(placeholderMaterials);

    // Load real textures
    loadTexturesWithFallback(placeholders).then((textures) => {
      setMaterials((prevMaterials) => {
        // Dispose previous materials before replacing
        disposeMaterials(prevMaterials);
        return createMaterials(textures);
      });
    });

    // Cleanup on unmount
    return () => {
      disposeMaterials(materialsRef.current);
    };
  }, []);

  // Rotation hook
  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    update,
    setEnabled: setRotationEnabled,
  } = useCubeRotation({ meshRef, enabled: !disabled });

  // Navigation hook (now with meshRef)
  const { onClick, isAnimating, cleanup } = useFaceNavigation({
    meshRef,
    onZoomStart: (faceId) => {
      setRotationEnabled(false);
      onZoomStart?.(faceId);
    },
    onZoomComplete,
    enabled: !disabled,
    animationDuration,
  });

  // Update rotation each frame
  useFrame(() => {
    if (!isAnimating.current) {
      update();
    }
  });

  // Set initial rotation/orientation
  useEffect(() => {
    if (meshRef.current) {
      if (initialFace) {
        // Use canonical orientation for this face (matches zoom-out end state)
        const quaternion = CANONICAL_QUATERNIONS[initialFace].clone();
        meshRef.current.quaternion.copy(quaternion);
      } else {
        // Use default tilted rotation showing 3 faces
        meshRef.current.rotation.set(...INITIAL_ROTATION);
      }
    }
  }, [initialFace]);

  // Cleanup animation frames on unmount (stable effect, no deps)
  useEffect(() => {
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (materials.length === 0) {
    return (
      <mesh ref={meshRef} rotation={INITIAL_ROTATION}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#888" wireframe />
      </mesh>
    );
  }

  return (
    <mesh
      ref={meshRef}
      material={materials}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
    >
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  );
}
