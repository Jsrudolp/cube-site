import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId, FACE_MAP } from "@/lib/faces";
import {
  FACE_INDEX_TO_ID,
  FACE_CENTERS,
  FACE_NORMALS,
  CAMERA_POSITION,
} from "@/lib/cube-config";
import { easeInOutQuint } from "@/lib/animation-modes";

interface UseFaceNavigationOptions {
  meshRef: React.RefObject<THREE.Mesh | null>;
  hasDragged?: React.RefObject<boolean>;
  onZoomStart?: (faceId: FaceId) => void;
  onRotateComplete?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  enabled?: boolean;
  animationDuration?: number;
}

// Direction from origin toward the default camera — computed once, never changes
const CAMERA_VEC = new THREE.Vector3(...CAMERA_POSITION);
const CAMERA_DIR = CAMERA_VEC.clone().normalize();

// Animation phases: rotate face toward camera, then zoom straight in
type AnimationPhase = "rotate" | "zoom";

export function useFaceNavigation({
  meshRef,
  hasDragged,
  onZoomStart,
  onRotateComplete,
  onZoomComplete,
  enabled = true,
  animationDuration = 1800,
}: UseFaceNavigationOptions) {
  const router = useRouter();
  const { camera, size } = useThree();
  const isAnimating = useRef(false);
  const animationRef = useRef<number | null>(null);

  const animDurationRef = useRef(animationDuration);
  animDurationRef.current = animationDuration;

  // Distance at which the face exactly fills the viewport
  const calculateFillDistance = useCallback(() => {
    const faceSize = 2;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    const verticalFit = faceSize / (2 * Math.tan(fov / 2));
    const horizontalFit = faceSize / (2 * Math.tan(fov / 2) * aspect);
    return Math.min(verticalFit, horizontalFit) * 0.9;
  }, [camera, size]);

  const getFaceFromClick = useCallback((e: ThreeEvent<MouseEvent>): FaceId | null => {
    if (!meshRef.current) return null;

    // Transform world-space hit point to mesh local space.
    // More reliable than e.face.normal for RoundedBoxGeometry (rounded edges
    // produce non-axis-aligned normals that can mis-identify faces).
    const localPoint = e.point.clone();
    meshRef.current.worldToLocal(localPoint);

    const { x, y, z } = localPoint;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);

    let faceIndex: number;
    if (absX >= absY && absX >= absZ) {
      faceIndex = x > 0 ? 0 : 1; // +X (community) or -X (music)
    } else if (absY >= absX && absY >= absZ) {
      faceIndex = y > 0 ? 2 : 3; // +Y (thinking) or -Y (building)
    } else {
      faceIndex = z > 0 ? 4 : 5; // +Z (front) or -Z (back)
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

      // Rotate the clicked face's local normal to point directly at the camera.
      // Camera stays fixed at CAMERA_POSITION throughout the rotate phase.
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(
        FACE_NORMALS[faceId].clone(),
        CAMERA_DIR
      );

      // After rotation, the face center sits along CAMERA_DIR at distance 1 from origin
      const worldFaceCenter = FACE_CENTERS[faceId].clone().applyQuaternion(targetQuat);

      // Zoom target: fillDistance past the face center along CAMERA_DIR
      const fillDistance = calculateFillDistance();
      const zoomTarget = worldFaceCenter.clone().add(CAMERA_DIR.clone().multiplyScalar(fillDistance));

      const startQuat = mesh.quaternion.clone();

      // Phase timing
      const rotateDuration = 0.4; // 40% — cube spins face toward camera
      const zoomDuration = 0.6;   // 60% — camera zooms straight in

      let phase: AnimationPhase = "rotate";
      let phaseStartTime = performance.now();

      const animate = () => {
        const now = performance.now();
        const totalDuration = animDurationRef.current;

        if (phase === "rotate") {
          const phaseDuration = totalDuration * rotateDuration;
          const elapsed = now - phaseStartTime;
          const progress = Math.min(elapsed / phaseDuration, 1);
          const eased = easeInOutQuint(progress);

          mesh.quaternion.slerpQuaternions(startQuat, targetQuat, eased);

          // Camera fixed, looking at cube center
          camera.position.copy(CAMERA_VEC);
          camera.up.copy(cameraUp);
          camera.lookAt(0, 0, 0);

          if (progress >= 1) {
            onRotateComplete?.(faceId);
            phase = "zoom";
            phaseStartTime = now;
          }
        } else if (phase === "zoom") {
          const phaseDuration = totalDuration * zoomDuration;
          const elapsed = now - phaseStartTime;
          const progress = Math.min(elapsed / phaseDuration, 1);
          const eased = easeInOutQuint(progress);

          // Camera moves straight in along CAMERA_DIR toward the face
          camera.position.lerpVectors(CAMERA_VEC, zoomTarget, eased);
          camera.up.copy(cameraUp);
          camera.lookAt(worldFaceCenter);

          if (progress >= 1) {
            isAnimating.current = false;
            onZoomComplete?.(faceId);

            const face = FACE_MAP[faceId];
            if (face) {
              if (typeof document !== "undefined" && "startViewTransition" in document) {
                (document as Document & { startViewTransition: (cb: () => void) => void })
                  .startViewTransition(() => router.push(face.route));
              } else {
                router.push(face.route);
              }
            }
            return;
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [camera, enabled, meshRef, onZoomStart, onRotateComplete, onZoomComplete, router, calculateFillDistance]
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
