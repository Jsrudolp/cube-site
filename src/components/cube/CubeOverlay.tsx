"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { FaceId, FACE_MAP } from "@/lib/faces";
import {
  CAMERA_POSITION,
  CAMERA_FOV,
  FACE_CENTERS,
  CANONICAL_QUATERNIONS,
  SQUARED_CAMERA_POSITIONS,
  CAMERA_UP_VECTORS,
} from "@/lib/cube-config";
import { CubeShadow } from "./CubeShadow";
import {
  createAllPlaceholderTextures,
  loadTexturesWithFallback,
  createMaterials,
} from "./cubeTextures";
import { easeInOutQuint } from "@/lib/animation-modes";

interface CubeOverlayProps {
  currentFace: FaceId;
  targetFace?: FaceId | null;
  onTransitionComplete?: () => void;
  mode: "zoom-out" | "switch-face";
  animationDuration?: number;
}

// Helper to dispose materials and their textures
function disposeMaterials(materials: THREE.MeshStandardMaterial[]) {
  materials.forEach((m) => {
    m.map?.dispose();
    m.dispose();
  });
}

// Cube mesh with textures
function TexturedCube({ meshRef }: { meshRef: React.RefObject<THREE.Mesh | null> }) {
  const [materials, setMaterials] = useState<THREE.MeshStandardMaterial[]>([]);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const placeholders = createAllPlaceholderTextures();
    const placeholderMaterials = createMaterials(placeholders);
    setMaterials(placeholderMaterials);

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

  if (materials.length === 0) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    );
  }

  return (
    <mesh ref={meshRef} material={materials}>
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  );
}

// Animation phases
type ZoomOutPhase = "zoom-out" | "unsquare";
type SwitchPhase = "zoom-out" | "unsquare" | "rotate" | "square" | "zoom-in";

function ZoomOutAnimation({
  currentFace,
  targetFace,
  onComplete,
  transitionMode,
  animationDuration,
}: {
  currentFace: FaceId;
  targetFace?: FaceId | null;
  onComplete: () => void;
  transitionMode: "zoom-out" | "switch-face";
  animationDuration: number;
}) {
  const { camera, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const initialized = useRef(false);
  const router = useRouter();

  // Animation state
  const phaseRef = useRef<ZoomOutPhase | SwitchPhase>("zoom-out");
  const phaseStartTime = useRef(0);

  // Position refs
  const zoomedCameraPos = useRef<THREE.Vector3 | null>(null);
  const squaredCameraPos = useRef<THREE.Vector3 | null>(null);
  const defaultCameraPos = useRef(new THREE.Vector3(...CAMERA_POSITION));
  const currentFaceCenter = useRef<THREE.Vector3 | null>(null);
  const currentCameraUp = useRef<THREE.Vector3 | null>(null);
  const defaultCameraUp = useRef(new THREE.Vector3(0, 1, 0));

  // For face switching
  const startQuaternion = useRef<THREE.Quaternion | null>(null);
  const targetQuaternion = useRef<THREE.Quaternion | null>(null);
  const targetFaceCenter = useRef<THREE.Vector3 | null>(null);
  const targetSquaredPos = useRef<THREE.Vector3 | null>(null);
  const targetCameraUp = useRef<THREE.Vector3 | null>(null);
  const targetZoomedPos = useRef<THREE.Vector3 | null>(null);

  // Calculate zoom distance
  const calculateFillDistance = useCallback(() => {
    const faceSize = 2;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    const verticalFit = faceSize / (2 * Math.tan(fov / 2));
    const horizontalFit = faceSize / (2 * Math.tan(fov / 2) * aspect);
    return Math.min(verticalFit, horizontalFit) * 0.9;
  }, [camera, size]);

  // Initialize
  useEffect(() => {
    if (!meshRef.current || initialized.current) return;
    initialized.current = true;

    // Set cube to canonical orientation for current face
    const currentQuaternion = CANONICAL_QUATERNIONS[currentFace].clone();
    meshRef.current.quaternion.copy(currentQuaternion);
    startQuaternion.current = currentQuaternion.clone();

    // Get current face geometry
    const faceCenter = FACE_CENTERS[currentFace].clone();
    const faceNormal = faceCenter.clone().normalize();
    currentFaceCenter.current = faceCenter;

    // Camera positions
    squaredCameraPos.current = SQUARED_CAMERA_POSITIONS[currentFace].clone();
    currentCameraUp.current = CAMERA_UP_VECTORS[currentFace].clone();

    const fillDistance = calculateFillDistance();
    const zoomed = faceCenter.clone().add(faceNormal.clone().multiplyScalar(fillDistance));
    zoomedCameraPos.current = zoomed;

    // Start camera at zoomed position
    camera.position.copy(zoomed);
    camera.up.copy(currentCameraUp.current);
    camera.lookAt(faceCenter);

    phaseStartTime.current = performance.now();

    // Set up target face if switching
    if (targetFace) {
      targetQuaternion.current = CANONICAL_QUATERNIONS[targetFace].clone();
      targetFaceCenter.current = FACE_CENTERS[targetFace].clone();
      targetSquaredPos.current = SQUARED_CAMERA_POSITIONS[targetFace].clone();
      targetCameraUp.current = CAMERA_UP_VECTORS[targetFace].clone();

      const targetNormal = targetFaceCenter.current.clone().normalize();
      targetZoomedPos.current = targetFaceCenter.current.clone().add(
        targetNormal.clone().multiplyScalar(fillDistance)
      );
    }
  }, [currentFace, targetFace, camera, calculateFillDistance]);

  useFrame(() => {
    if (!meshRef.current || !initialized.current) return;

    const now = performance.now();
    const phase = phaseRef.current;

    // Phase durations
    const zoomOutDuration = 0.25;
    const unsquareDuration = 0.25;
    const rotateDuration = 0.2;
    const squareDuration = 0.15;
    const zoomInDuration = 0.15;

    if (transitionMode === "zoom-out") {
      // ZOOM OUT: zoom-out -> unsquare -> navigate

      if (phase === "zoom-out") {
        const phaseDuration = animationDuration * zoomOutDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        if (zoomedCameraPos.current && squaredCameraPos.current && currentFaceCenter.current && currentCameraUp.current) {
          camera.position.lerpVectors(zoomedCameraPos.current, squaredCameraPos.current, eased);
          camera.up.copy(currentCameraUp.current);
          camera.lookAt(currentFaceCenter.current);
        }

        if (progress >= 1) {
          phaseRef.current = "unsquare";
          phaseStartTime.current = now;
        }
      } else if (phase === "unsquare") {
        const phaseDuration = animationDuration * unsquareDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        if (squaredCameraPos.current && currentFaceCenter.current && currentCameraUp.current) {
          camera.position.lerpVectors(squaredCameraPos.current, defaultCameraPos.current, eased);
          camera.up.lerpVectors(currentCameraUp.current, defaultCameraUp.current, eased);
          const lookAt = currentFaceCenter.current.clone().lerp(new THREE.Vector3(0, 0, 0), eased);
          camera.lookAt(lookAt);
        }

        if (progress >= 1) {
          onComplete();
          router.push(`/?from=${currentFace}`);
        }
      }
    } else {
      // SWITCH FACE: zoom-out -> unsquare -> rotate -> square -> zoom-in

      if (phase === "zoom-out") {
        const phaseDuration = animationDuration * zoomOutDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        if (zoomedCameraPos.current && squaredCameraPos.current && currentFaceCenter.current && currentCameraUp.current) {
          camera.position.lerpVectors(zoomedCameraPos.current, squaredCameraPos.current, eased);
          camera.up.copy(currentCameraUp.current);
          camera.lookAt(currentFaceCenter.current);
        }

        if (progress >= 1) {
          phaseRef.current = "unsquare";
          phaseStartTime.current = now;
        }
      } else if (phase === "unsquare") {
        const phaseDuration = animationDuration * unsquareDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        if (squaredCameraPos.current && currentFaceCenter.current && currentCameraUp.current) {
          camera.position.lerpVectors(squaredCameraPos.current, defaultCameraPos.current, eased);
          camera.up.lerpVectors(currentCameraUp.current, defaultCameraUp.current, eased);
          const lookAt = currentFaceCenter.current.clone().lerp(new THREE.Vector3(0, 0, 0), eased);
          camera.lookAt(lookAt);
        }

        if (progress >= 1) {
          phaseRef.current = "rotate";
          phaseStartTime.current = now;
        }
      } else if (phase === "rotate" && targetQuaternion.current && startQuaternion.current) {
        const phaseDuration = animationDuration * rotateDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        meshRef.current.quaternion.slerpQuaternions(
          startQuaternion.current,
          targetQuaternion.current,
          eased
        );

        camera.position.copy(defaultCameraPos.current);
        camera.up.copy(defaultCameraUp.current);
        camera.lookAt(0, 0, 0);

        if (progress >= 1) {
          phaseRef.current = "square";
          phaseStartTime.current = now;
        }
      } else if (phase === "square" && targetSquaredPos.current && targetFaceCenter.current && targetCameraUp.current) {
        const phaseDuration = animationDuration * squareDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        camera.position.lerpVectors(defaultCameraPos.current, targetSquaredPos.current, eased);
        camera.up.lerpVectors(defaultCameraUp.current, targetCameraUp.current, eased);
        const lookAt = new THREE.Vector3(0, 0, 0).lerp(targetFaceCenter.current, eased);
        camera.lookAt(lookAt);

        if (progress >= 1) {
          phaseRef.current = "zoom-in";
          phaseStartTime.current = now;
        }
      } else if (phase === "zoom-in" && targetZoomedPos.current && targetFaceCenter.current && targetCameraUp.current && targetFace) {
        const phaseDuration = animationDuration * zoomInDuration;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        if (targetSquaredPos.current) {
          camera.position.lerpVectors(targetSquaredPos.current, targetZoomedPos.current, eased);
          camera.up.copy(targetCameraUp.current);
          camera.lookAt(targetFaceCenter.current);
        }

        if (progress >= 1) {
          onComplete();
          const face = FACE_MAP[targetFace];
          if (face) {
            router.push(face.route);
          }
        }
      }
    }
  });

  return <TexturedCube meshRef={meshRef} />;
}

export function CubeOverlay({
  currentFace,
  targetFace,
  onTransitionComplete,
  mode,
  animationDuration = 1800,
}: CubeOverlayProps) {
  const [visible, setVisible] = useState(true);

  const handleComplete = useCallback(() => {
    setVisible(false);
    onTransitionComplete?.();
  }, [onTransitionComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#e5e5e0]">
      <Canvas
        camera={{
          position: CAMERA_POSITION,
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        <ZoomOutAnimation
          currentFace={currentFace}
          targetFace={targetFace}
          onComplete={handleComplete}
          transitionMode={mode}
          animationDuration={animationDuration}
        />

        <CubeShadow />
      </Canvas>
    </div>
  );
}
