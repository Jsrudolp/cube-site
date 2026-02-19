"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { FaceId } from "@/lib/faces";
import { INITIAL_ROTATION, FACE_NORMALS, CAMERA_POSITION } from "@/lib/cube-config";
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
function disposeMaterials(materials: THREE.MeshBasicMaterial[]) {
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
  const geometry = useMemo(() => new RoundedBoxGeometry(2, 2, 2, 4, 0.07), []);
  const [materials, setMaterials] = useState<THREE.MeshBasicMaterial[]>([]);
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([]);

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
    hasDragged,
    setEnabled: setRotationEnabled,
  } = useCubeRotation({ meshRef, enabled: !disabled });

  // Navigation hook (now with meshRef)
  const { onClick, isAnimating, cleanup } = useFaceNavigation({
    meshRef,
    hasDragged,
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
        // Orient so the visited face points directly at the camera —
        // matches the cube state at the end of the zoom-out animation.
        const cameraDir = new THREE.Vector3(...CAMERA_POSITION).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          FACE_NORMALS[initialFace].clone(),
          cameraDir
        );
        meshRef.current.quaternion.copy(quaternion);
      } else {
        // Default tilted rotation showing 3 faces
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
      <mesh ref={meshRef} rotation={INITIAL_ROTATION} geometry={geometry}>
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
      geometry={geometry}
    />
  );
}
