import { useRef, useCallback } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import {
  FACE_INDEX_TO_ID,
  FACE_CENTERS,
  FACE_LOCAL_UP,
  CAMERA_POSITION,
  computeUprightQuat,
} from "@/lib/cube-config";
import { easeInOutQuint } from "@/lib/animation-modes";

interface UseFaceNavigationOptions {
  meshRef: React.RefObject<THREE.Mesh | null>;
  hasDragged?: React.RefObject<boolean>;
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  enabled?: boolean;
  animationDuration?: number;
}

// Direction from origin toward the default camera — computed once, never changes
const CAMERA_VEC = new THREE.Vector3(...CAMERA_POSITION);
const CAMERA_DIR = CAMERA_VEC.clone().normalize();

export function useFaceNavigation({
  meshRef,
  hasDragged,
  onZoomStart,
  onZoomComplete,
  enabled = true,
  animationDuration = 1800,
}: UseFaceNavigationOptions) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const animationRef = useRef<number | null>(null);

  const animDurationRef = useRef(animationDuration);
  animDurationRef.current = animationDuration;

  const getFaceFromClick = useCallback((e: ThreeEvent<MouseEvent>): FaceId | null => {
    if (!meshRef.current) return null;

    const localPoint = e.point.clone();
    meshRef.current.worldToLocal(localPoint);

    const { x, y, z } = localPoint;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);

    let faceIndex: number;
    if (absX >= absY && absX >= absZ) {
      faceIndex = x > 0 ? 0 : 1;
    } else if (absY >= absX && absY >= absZ) {
      faceIndex = y > 0 ? 2 : 3;
    } else {
      faceIndex = z > 0 ? 4 : 5;
    }

    return FACE_INDEX_TO_ID[faceIndex] ?? null;
  }, [meshRef]);

  const animateToFace = useCallback(
    (faceId: FaceId) => {
      if (isAnimating.current || !enabled || !meshRef.current) return;
      isAnimating.current = true;
      onZoomStart?.(faceId);

      const mesh = meshRef.current;
      const cameraUp = new THREE.Vector3(0, 1, 0);

      const uprightQuat = computeUprightQuat(faceId);
      const worldFaceCenter = FACE_CENTERS[faceId].clone().applyQuaternion(uprightQuat);

      const cam = camera as THREE.PerspectiveCamera;
      const vfov = cam.fov * (Math.PI / 180);
      const aspect = cam.aspect; // width / height

      // Distance where face width (2 units) exactly fills viewport width
      const horizontalFit = 1 / (Math.tan(vfov / 2) * aspect);

      // Top-alignment offset: shift view upward in face-up direction so
      // top edge of face aligns with top of viewport.
      // At this distance, visible half-height = horizontalFit * tan(vfov/2) = 1/aspect
      // Face half-height = 1. Offset = 1 - 1/aspect (positive = shift up)
      const faceUpWorld = FACE_LOCAL_UP[faceId].clone().applyQuaternion(uprightQuat);
      const topAlignOffset = Math.max(0, 1 - 1 / aspect); // 0 on tall screens
      const offsetVec = faceUpWorld.multiplyScalar(topAlignOffset);

      const zoomLookAt = worldFaceCenter.clone().add(offsetVec);
      const zoomTarget = zoomLookAt.clone().add(
        CAMERA_DIR.clone().multiplyScalar(horizontalFit)
      );

      const startQuat = mesh.quaternion.clone();
      const startTime = performance.now();

      const animate = () => {
        const now = performance.now();
        const totalDuration = animDurationRef.current;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        const eased = easeInOutQuint(progress);

        // Rotation and zoom happen simultaneously
        mesh.quaternion.slerpQuaternions(startQuat, uprightQuat, eased);
        camera.position.lerpVectors(CAMERA_VEC, zoomTarget, eased);
        camera.up.copy(cameraUp);
        const lookAt = new THREE.Vector3(0, 0, 0).lerp(zoomLookAt, eased);
        camera.lookAt(lookAt);

        if (progress >= 1) {
          isAnimating.current = false;
          onZoomComplete?.(faceId);
          return;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [camera, enabled, meshRef, onZoomStart, onZoomComplete]
  );

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!enabled || isAnimating.current) return;
      if (hasDragged?.current) return;
      e.stopPropagation();

      const faceId = getFaceFromClick(e);
      if (!faceId) return;

      animateToFace(faceId);
    },
    [enabled, hasDragged, getFaceFromClick, animateToFace]
  );

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return {
    onClick,
    animateToFace,
    isAnimating,
    cleanup,
  };
}
