"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  dynamicTextures?: (THREE.CanvasTexture | null)[];
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
  dynamicTextures,
}: InteractiveCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(2, 2, 2), []);
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

    // Load real textures (PNG fallbacks)
    loadTexturesWithFallback(placeholders).then((textures) => {
      setMaterials((prevMaterials) => {
        disposeMaterials(prevMaterials);
        return createMaterials(textures);
      });
    });

    return () => {
      disposeMaterials(materialsRef.current);
    };
  }, []);

  // Update individual face materials when dynamic textures arrive
  useEffect(() => {
    if (!dynamicTextures || materialsRef.current.length === 0) return;

    let updated = false;
    const currentMats = materialsRef.current;
    const newMaterials = [...currentMats];

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
      setMaterials(newMaterials);
    }
  }, [dynamicTextures]);

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
