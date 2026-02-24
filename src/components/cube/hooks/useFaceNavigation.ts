import { useRef, useCallback, useEffect } from "react";
import { ThreeEvent, useThree, useFrame } from "@react-three/fiber";
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
  onZoomOutComplete?: (state?: {
    quaternion: [number, number, number, number];
    cameraPosition: [number, number, number];
  }) => void;
  onSwitchComplete?: (faceId: FaceId) => void;
  enabled?: boolean;
  animationDuration?: number;
  initialZoomedFace?: FaceId;
  zoomOutFromFace?: FaceId;
  zoomInToFace?: FaceId;
  switchToFace?: FaceId;
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

// Animation state stored in a ref, ticked by useFrame
type AnimState =
  | { type: "zoom-in"; faceId: FaceId; startQuat: THREE.Quaternion; uprightQuat: THREE.Quaternion; zoomTarget: THREE.Vector3; zoomLookAt: THREE.Vector3; startTime: number }
  | { type: "zoom-out"; faceId: FaceId; restingQuat: THREE.Quaternion; uprightQuat: THREE.Quaternion; zoomTarget: THREE.Vector3; zoomLookAt: THREE.Vector3; startTime: number }
  | { type: "switch"; targetFaceId: FaceId; fromUprightQuat: THREE.Quaternion; fromZoomTarget: THREE.Vector3; fromZoomLookAt: THREE.Vector3; midQuat: THREE.Quaternion; toUprightQuat: THREE.Quaternion; toZoomTarget: THREE.Vector3; toZoomLookAt: THREE.Vector3; startTime: number };

export function useFaceNavigation({
  meshRef,
  hasDragged,
  onZoomStart,
  onZoomComplete,
  onZoomOutComplete,
  onSwitchComplete,
  enabled = true,
  animationDuration = 1800,
  initialZoomedFace,
  zoomOutFromFace,
  zoomInToFace,
  switchToFace,
}: UseFaceNavigationOptions) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const lastClickTime = useRef(0);

  const animDurationRef = useRef(animationDuration);
  animDurationRef.current = animationDuration;

  // Active animation state — processed each frame by useFrame
  const animRef = useRef<AnimState | null>(null);

  // Store latest callbacks in refs to avoid stale closures
  const onZoomStartRef = useRef(onZoomStart);
  onZoomStartRef.current = onZoomStart;
  const onZoomCompleteRef = useRef(onZoomComplete);
  onZoomCompleteRef.current = onZoomComplete;
  const onZoomOutCompleteRef = useRef(onZoomOutComplete);
  onZoomOutCompleteRef.current = onZoomOutComplete;
  const onSwitchCompleteRef = useRef(onSwitchComplete);
  onSwitchCompleteRef.current = onSwitchComplete;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Snap camera to zoomed-in view whenever the active face changes
  // (e.g. direct navigation or face switch completing). Skipped during animations
  // since those handle their own camera positioning.
  const prevInitialFace = useRef<FaceId | undefined>(undefined);
  useEffect(() => {
    if (!initialZoomedFace || !meshRef.current) return;
    if (initialZoomedFace === prevInitialFace.current) return;
    if (animRef.current) return; // animation in progress handles camera
    prevInitialFace.current = initialZoomedFace;

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
      if (!programmatic && !enabledRef.current) return;
      isAnimating.current = true;
      onZoomStartRef.current?.(faceId);

      const { uprightQuat, zoomTarget, zoomLookAt } = computeZoomedState(faceId, camera);

      animRef.current = {
        type: "zoom-in",
        faceId,
        startQuat: meshRef.current.quaternion.clone(),
        uprightQuat,
        zoomTarget,
        zoomLookAt,
        startTime: performance.now(),
      };
    },
    [camera, meshRef]
  );

  // Reset isAnimating when the cube becomes interactive again
  useEffect(() => {
    if (enabled) {
      isAnimating.current = false;
    }
  }, [enabled]);

  const animateFromFace = useCallback(
    (faceId: FaceId) => {
      if (!meshRef.current) return;
      isAnimating.current = true;

      const { uprightQuat, zoomTarget, zoomLookAt } = computeZoomedState(faceId, camera);

      // Tilt slightly from the upright position so the zoomed face stays
      // prominent but the cube looks 3D (similar to INITIAL_ROTATION effect)
      const tilt = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-0.35, 0.4, 0)
      );
      const restingQuat = tilt.multiply(uprightQuat);

      animRef.current = {
        type: "zoom-out",
        faceId,
        restingQuat,
        uprightQuat,
        zoomTarget,
        zoomLookAt,
        startTime: performance.now(),
      };
    },
    [camera, meshRef]
  );

  const animateSwitchFace = useCallback(
    (fromFace: FaceId, toFace: FaceId) => {
      if (!meshRef.current) return;
      isAnimating.current = true;

      const fromState = computeZoomedState(fromFace, camera);
      const toState = computeZoomedState(toFace, camera);

      // Neutral midpoint quaternion — tilt from the source upright orientation
      const tilt = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-0.35, 0.4, 0)
      );
      const midQuat = tilt.multiply(fromState.uprightQuat);

      animRef.current = {
        type: "switch",
        targetFaceId: toFace,
        fromUprightQuat: fromState.uprightQuat,
        fromZoomTarget: fromState.zoomTarget,
        fromZoomLookAt: fromState.zoomLookAt,
        midQuat,
        toUprightQuat: toState.uprightQuat,
        toZoomTarget: toState.zoomTarget,
        toZoomLookAt: toState.zoomLookAt,
        startTime: performance.now(),
      };
    },
    [camera, meshRef]
  );

  // Process animation each R3F frame — synchronized with the render loop
  useFrame(() => {
    const anim = animRef.current;
    if (!anim || !meshRef.current) return;

    const mesh = meshRef.current;
    const cameraUp = new THREE.Vector3(0, 1, 0);
    const elapsed = performance.now() - anim.startTime;
    const duration = anim.type === "switch" ? animDurationRef.current * 1.5 : animDurationRef.current;
    const progress = Math.min(elapsed / duration, 1);

    if (anim.type === "zoom-in") {
      const eased = easeInOutQuint(progress);
      mesh.quaternion.slerpQuaternions(anim.startQuat, anim.uprightQuat, eased);
      camera.position.lerpVectors(CAMERA_VEC, anim.zoomTarget, eased);
      camera.up.copy(cameraUp);
      const lookAt = new THREE.Vector3(0, 0, 0).lerp(anim.zoomLookAt, eased);
      camera.lookAt(lookAt);

      if (progress >= 1) {
        const faceId = anim.faceId;
        animRef.current = null;
        // Defer callback to avoid React state updates inside R3F render loop
        requestAnimationFrame(() => onZoomCompleteRef.current?.(faceId));
      }
    } else if (anim.type === "zoom-out") {
      const t = 1 - easeInOutQuint(progress);
      mesh.quaternion.slerpQuaternions(anim.restingQuat, anim.uprightQuat, t);
      camera.position.lerpVectors(CAMERA_VEC, anim.zoomTarget, t);
      camera.up.copy(cameraUp);
      const lookAt = new THREE.Vector3(0, 0, 0).lerp(anim.zoomLookAt, t);
      camera.lookAt(lookAt);

      if (progress >= 1) {
        // Capture final state before clearing animation.
        // Clone values since mesh/camera may be mutated before the deferred callback runs.
        const finalState = {
          quaternion: [mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w] as [number, number, number, number],
          cameraPosition: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
        };
        animRef.current = null;
        isAnimating.current = false;
        // Defer callback to avoid React state updates (and Next.js pushState interception)
        // inside R3F's render loop, which can disrupt mesh/camera state.
        requestAnimationFrame(() => onZoomOutCompleteRef.current?.(finalState));
      }
    } else if (anim.type === "switch") {
      // 3-phase switch: zoom-out (0–0.35), rotate (0.35–0.65), zoom-in (0.65–1)
      const PHASE1_END = 0.35;
      const PHASE2_END = 0.65;

      if (progress < PHASE1_END) {
        // Phase 1: Zoom out from source face
        const phaseT = progress / PHASE1_END;
        const eased = easeInOutQuint(phaseT);
        const camT = 1 - eased; // 1 → 0 (zoomed → home)
        mesh.quaternion.slerpQuaternions(anim.fromUprightQuat, anim.midQuat, eased);
        camera.position.lerpVectors(CAMERA_VEC, anim.fromZoomTarget, camT);
        camera.up.copy(cameraUp);
        const lookAt = new THREE.Vector3(0, 0, 0).lerp(anim.fromZoomLookAt, camT);
        camera.lookAt(lookAt);
      } else if (progress < PHASE2_END) {
        // Phase 2: Rotate from source orientation to target orientation (camera at home)
        const phaseT = (progress - PHASE1_END) / (PHASE2_END - PHASE1_END);
        const eased = easeInOutQuint(phaseT);
        mesh.quaternion.slerpQuaternions(anim.midQuat, anim.toUprightQuat, eased);
        camera.position.copy(CAMERA_VEC);
        camera.up.copy(cameraUp);
        camera.lookAt(0, 0, 0);
      } else {
        // Phase 3: Zoom in to target face
        const phaseT = (progress - PHASE2_END) / (1 - PHASE2_END);
        const eased = easeInOutQuint(phaseT);
        mesh.quaternion.slerpQuaternions(anim.toUprightQuat, anim.toUprightQuat, eased);
        camera.position.lerpVectors(CAMERA_VEC, anim.toZoomTarget, eased);
        camera.up.copy(cameraUp);
        const lookAt = new THREE.Vector3(0, 0, 0).lerp(anim.toZoomLookAt, eased);
        camera.lookAt(lookAt);
      }

      if (progress >= 1) {
        const targetId = anim.targetFaceId;
        animRef.current = null;
        isAnimating.current = false;
        // Defer callback to avoid React state updates inside R3F render loop
        requestAnimationFrame(() => onSwitchCompleteRef.current?.(targetId));
      }
    }
  });

  // Trigger reverse animation when zoomOutFromFace is set (only for normal zoom-out, not switches)
  const prevZoomOutFace = useRef<FaceId | undefined>(undefined);
  useEffect(() => {
    if (zoomOutFromFace && zoomOutFromFace !== prevZoomOutFace.current && !switchToFace) {
      animateFromFace(zoomOutFromFace);
    }
    prevZoomOutFace.current = zoomOutFromFace;
  }, [zoomOutFromFace, switchToFace, animateFromFace]);

  // Trigger unified 3-phase switch animation
  const prevSwitchFace = useRef<FaceId | undefined>(undefined);
  useEffect(() => {
    if (switchToFace && switchToFace !== prevSwitchFace.current && zoomOutFromFace) {
      animateSwitchFace(zoomOutFromFace, switchToFace);
    }
    prevSwitchFace.current = switchToFace;
  }, [switchToFace, zoomOutFromFace, animateSwitchFace]);

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

  return {
    onClick,
    animateToFace,
    animateFromFace,
    isAnimating,
  };
}
