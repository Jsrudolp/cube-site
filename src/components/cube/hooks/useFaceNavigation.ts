import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId, FACE_MAP } from "@/lib/faces";
import {
  FACE_INDEX_TO_ID,
  FACE_CENTERS,
  DOUBLE_CLICK_THRESHOLD,
  CAMERA_POSITION,
  CANONICAL_QUATERNIONS,
  SQUARED_CAMERA_POSITIONS,
  CAMERA_UP_VECTORS,
} from "@/lib/cube-config";
import { easeInOutQuint } from "@/lib/animation-modes";

interface UseFaceNavigationOptions {
  meshRef: React.RefObject<THREE.Mesh | null>;
  onZoomStart?: (faceId: FaceId) => void;
  onRotateComplete?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  enabled?: boolean;
  animationDuration?: number;
}

// Animation phases
type AnimationPhase = "rotate" | "square" | "zoom";

export function useFaceNavigation({
  meshRef,
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
  const lastClickTime = useRef(0);
  const lastClickFace = useRef<FaceId | null>(null);

  const animDurationRef = useRef(animationDuration);
  animDurationRef.current = animationDuration;

  // Calculate zoom distance needed to fill screen with face
  const calculateFillDistance = useCallback(() => {
    const faceSize = 2;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    const verticalFit = faceSize / (2 * Math.tan(fov / 2));
    const horizontalFit = faceSize / (2 * Math.tan(fov / 2) * aspect);
    return Math.min(verticalFit, horizontalFit) * 0.9;
  }, [camera, size]);

  const getFaceFromClick = useCallback((e: ThreeEvent<MouseEvent>): FaceId | null => {
    if (!e.face) return null;
    const faceIndex = Math.floor(e.faceIndex! / 2);
    return FACE_INDEX_TO_ID[faceIndex] ?? null;
  }, []);

  const animateToFace = useCallback(
    (faceId: FaceId) => {
      if (isAnimating.current || !enabled || !meshRef.current) return;
      isAnimating.current = true;
      onZoomStart?.(faceId);

      const mesh = meshRef.current;
      const defaultCameraPos = new THREE.Vector3(...CAMERA_POSITION);

      // Get target configurations
      const targetQuaternion = CANONICAL_QUATERNIONS[faceId].clone();
      const squaredCameraPos = SQUARED_CAMERA_POSITIONS[faceId].clone();
      const faceCenter = FACE_CENTERS[faceId].clone();
      const cameraUp = CAMERA_UP_VECTORS[faceId].clone();

      // Store initial states
      const startQuaternion = mesh.quaternion.clone();
      const startCameraPos = defaultCameraPos.clone();
      const startCameraUp = new THREE.Vector3(0, 1, 0);

      // Phase timing (as fractions of total duration)
      const rotateDuration = 0.4;  // 40% for rotation
      const squareDuration = 0.3;  // 30% for squaring
      const zoomDuration = 0.3;    // 30% for zoom

      // Animation state
      let phase: AnimationPhase = "rotate";
      let phaseStartTime = performance.now();

      const animate = () => {
        const now = performance.now();
        const totalDuration = animDurationRef.current;

        if (phase === "rotate") {
          // Phase 1: Rotate cube to canonical orientation
          const phaseDuration = totalDuration * rotateDuration;
          const elapsed = now - phaseStartTime;
          const progress = Math.min(elapsed / phaseDuration, 1);
          const eased = easeInOutQuint(progress);

          // Rotate cube
          mesh.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, eased);

          // Camera stays at default position, looking at origin
          camera.position.copy(defaultCameraPos);
          camera.up.copy(startCameraUp);
          camera.lookAt(0, 0, 0);

          if (progress >= 1) {
            onRotateComplete?.(faceId);
            phase = "square";
            phaseStartTime = now;
          }
        } else if (phase === "square") {
          // Phase 2: Move camera to squared position
          const phaseDuration = totalDuration * squareDuration;
          const elapsed = now - phaseStartTime;
          const progress = Math.min(elapsed / phaseDuration, 1);
          const eased = easeInOutQuint(progress);

          // Move camera from default to squared position
          camera.position.lerpVectors(defaultCameraPos, squaredCameraPos, eased);

          // Interpolate up vector
          camera.up.lerpVectors(startCameraUp, cameraUp, eased);

          // Shift look-at from origin to face center
          const lookAt = new THREE.Vector3(0, 0, 0).lerp(faceCenter, eased);
          camera.lookAt(lookAt);

          if (progress >= 1) {
            phase = "zoom";
            phaseStartTime = now;
          }
        } else if (phase === "zoom") {
          // Phase 3: Zoom in until face fills screen
          const phaseDuration = totalDuration * zoomDuration;
          const elapsed = now - phaseStartTime;
          const progress = Math.min(elapsed / phaseDuration, 1);
          const eased = easeInOutQuint(progress);

          // Calculate final zoom position
          const fillDistance = calculateFillDistance();
          const faceNormal = faceCenter.clone().normalize();
          const zoomTargetPos = faceCenter.clone().add(faceNormal.clone().multiplyScalar(fillDistance));

          // Move camera toward face
          camera.position.lerpVectors(squaredCameraPos, zoomTargetPos, eased);
          camera.up.copy(cameraUp);
          camera.lookAt(faceCenter);

          if (progress >= 1) {
            isAnimating.current = false;
            onZoomComplete?.(faceId);

            // Navigate to face route
            const face = FACE_MAP[faceId];
            if (face) {
              router.push(face.route);
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
      e.stopPropagation();

      const faceId = getFaceFromClick(e);
      if (!faceId) return;

      const now = performance.now();
      const timeSinceLastClick = now - lastClickTime.current;

      // Check for double-click on same face
      if (
        timeSinceLastClick < DOUBLE_CLICK_THRESHOLD &&
        lastClickFace.current === faceId
      ) {
        animateToFace(faceId);
        lastClickTime.current = 0;
        lastClickFace.current = null;
      } else {
        lastClickTime.current = now;
        lastClickFace.current = faceId;
      }
    },
    [enabled, getFaceFromClick, animateToFace]
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
