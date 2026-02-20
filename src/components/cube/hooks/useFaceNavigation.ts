import { useRef, useCallback, useEffect } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import {
  FACE_INDEX_TO_ID,
  FACE_CENTERS,
  FACE_LOCAL_UP,
  CAMERA_POSITION,
  INITIAL_ROTATION,
  computeUprightQuat,
} from "@/lib/cube-config";
import { easeInOutQuint } from "@/lib/animation-modes";

interface UseFaceNavigationOptions {
  meshRef: React.RefObject<THREE.Mesh | null>;
  hasDragged?: React.RefObject<boolean>;
  onZoomStart?: (faceId: FaceId) => void;
  onZoomComplete?: (faceId: FaceId) => void;
  onZoomOutComplete?: () => void;
  enabled?: boolean;
  animationDuration?: number;
  initialZoomedFace?: FaceId;
  zoomOutFromFace?: FaceId;
  zoomInToFace?: FaceId;
}

// Direction from origin toward the default camera — computed once, never changes
const CAMERA_VEC = new THREE.Vector3(...CAMERA_POSITION);
const CAMERA_DIR = CAMERA_VEC.clone().normalize();

/**
 * Compute the zoomed-in camera state for a given face.
 * Returns the target camera position and lookAt point.
 */
function computeZoomedState(faceId: FaceId, camera: THREE.Camera) {
  const cam = camera as THREE.PerspectiveCamera;
  const vfov = cam.fov * (Math.PI / 180);
  const aspect = cam.aspect;
  const horizontalFit = 1 / (Math.tan(vfov / 2) * aspect);

  const uprightQuat = computeUprightQuat(faceId);
  const worldFaceCenter = FACE_CENTERS[faceId].clone().applyQuaternion(uprightQuat);

  const faceUpWorld = FACE_LOCAL_UP[faceId].clone().applyQuaternion(uprightQuat);
  const topAlignOffset = Math.max(0, 1 - 1 / aspect);
  const offsetVec = faceUpWorld.multiplyScalar(topAlignOffset);

  const zoomLookAt = worldFaceCenter.clone().add(offsetVec);
  const zoomTarget = zoomLookAt.clone().add(
    CAMERA_DIR.clone().multiplyScalar(horizontalFit)
  );

  return { uprightQuat, zoomTarget, zoomLookAt };
}

export function useFaceNavigation({
  meshRef,
  hasDragged,
  onZoomStart,
  onZoomComplete,
  onZoomOutComplete,
  enabled = true,
  animationDuration = 1800,
  initialZoomedFace,
  zoomOutFromFace,
  zoomInToFace,
}: UseFaceNavigationOptions) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const animationRef = useRef<number | null>(null);
  const lastClickTime = useRef(0);

  const animDurationRef = useRef(animationDuration);
  animDurationRef.current = animationDuration;

  // Store latest callbacks in refs to avoid stale closures in rAF loops
  const onZoomStartRef = useRef(onZoomStart);
  onZoomStartRef.current = onZoomStart;
  const onZoomCompleteRef = useRef(onZoomComplete);
  onZoomCompleteRef.current = onZoomComplete;
  const onZoomOutCompleteRef = useRef(onZoomOutComplete);
  onZoomOutCompleteRef.current = onZoomOutComplete;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Position camera at zoomed-in view when a face page becomes active.
  // Only runs on initial mount with an active face (direct navigation).
  // When arriving via zoom-in animation, the cube is already positioned.
  const zoomedInitialized = useRef(false);
  useEffect(() => {
    if (!initialZoomedFace || !meshRef.current) return;
    // Only snap to zoomed position if we haven't already animated there
    if (zoomedInitialized.current) return;
    zoomedInitialized.current = true;

    const { uprightQuat, zoomTarget, zoomLookAt } = computeZoomedState(initialZoomedFace, camera);
    meshRef.current.quaternion.copy(uprightQuat);
    camera.position.copy(zoomTarget);
    camera.up.set(0, 1, 0);
    camera.lookAt(zoomLookAt);
  }, [initialZoomedFace, meshRef, camera]);

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
    (faceId: FaceId, programmatic = false) => {
      if (isAnimating.current || !meshRef.current) return;
      // Only check enabled for user clicks, not programmatic calls
      if (!programmatic && !enabledRef.current) return;
      isAnimating.current = true;
      onZoomStartRef.current?.(faceId);

      const mesh = meshRef.current;
      const cameraUp = new THREE.Vector3(0, 1, 0);

      const { uprightQuat, zoomTarget, zoomLookAt } = computeZoomedState(faceId, camera);

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
          // Keep isAnimating true — the cube should stay frozen at the zoomed
          // position until it becomes interactive again. Without this, auto-rotate
          // or momentum from useCubeRotation can shift the cube before the face
          // page mounts and sets disabled=true.
          onZoomCompleteRef.current?.(faceId);
          return;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [camera, meshRef]
  );

  // Reset isAnimating when the cube becomes interactive again (e.g. after zoom-out
  // completes, or if the user navigates back via browser history)
  useEffect(() => {
    if (enabled) {
      isAnimating.current = false;
    }
  }, [enabled]);

  // Reverse animation: from zoomed-in face back to resting position
  const animateFromFace = useCallback(
    (faceId: FaceId) => {
      if (!meshRef.current) return;
      isAnimating.current = true;

      const mesh = meshRef.current;
      const cameraUp = new THREE.Vector3(0, 1, 0);

      const { uprightQuat, zoomTarget, zoomLookAt } = computeZoomedState(faceId, camera);
      const restingQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(...INITIAL_ROTATION)
      );

      const startTime = performance.now();

      const animate = () => {
        const now = performance.now();
        const totalDuration = animDurationRef.current;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        const t = 1 - easeInOutQuint(progress); // 1 → 0 (starts zoomed, ends at resting)

        mesh.quaternion.slerpQuaternions(restingQuat, uprightQuat, t);
        camera.position.lerpVectors(CAMERA_VEC, zoomTarget, t);
        camera.up.copy(cameraUp);
        const lookAt = new THREE.Vector3(0, 0, 0).lerp(zoomLookAt, t);
        camera.lookAt(lookAt);

        if (progress >= 1) {
          isAnimating.current = false;
          onZoomOutCompleteRef.current?.();
          return;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [camera, meshRef]
  );

  // Trigger reverse animation when zoomOutFromFace is set
  const prevZoomOutFace = useRef<FaceId | undefined>(undefined);
  useEffect(() => {
    if (zoomOutFromFace && zoomOutFromFace !== prevZoomOutFace.current) {
      animateFromFace(zoomOutFromFace);
    }
    prevZoomOutFace.current = zoomOutFromFace;
  }, [zoomOutFromFace, animateFromFace]);

  // Trigger zoom-in animation programmatically (used for face switching)
  const prevZoomInFace = useRef<FaceId | undefined>(undefined);
  useEffect(() => {
    if (zoomInToFace && zoomInToFace !== prevZoomInFace.current) {
      animateToFace(zoomInToFace, true);
    }
    prevZoomInFace.current = zoomInToFace;
  }, [zoomInToFace, animateToFace]);

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!enabledRef.current || isAnimating.current) return;
      if (hasDragged?.current) return;

      // Debounce rapid clicks (300ms cooldown)
      const now = performance.now();
      if (now - lastClickTime.current < 300) return;
      lastClickTime.current = now;

      e.stopPropagation();

      const faceId = getFaceFromClick(e);
      if (!faceId) return;

      animateToFace(faceId);
    },
    [hasDragged, getFaceFromClick, animateToFace]
  );

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return {
    onClick,
    animateToFace,
    animateFromFace,
    isAnimating,
    cleanup,
  };
}
