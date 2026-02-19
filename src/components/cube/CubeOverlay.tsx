"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { useRouter } from "next/navigation";
import { FaceId, FACE_MAP } from "@/lib/faces";
import {
  CAMERA_POSITION,
  CAMERA_FOV,
  FACE_CENTERS,
  FACE_NORMALS,
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
function disposeMaterials(materials: THREE.MeshBasicMaterial[]) {
  materials.forEach((m) => {
    m.map?.dispose();
    m.dispose();
  });
}

// Cube mesh with textures
function TexturedCube({ meshRef }: { meshRef: React.RefObject<THREE.Mesh | null> }) {
  const geometry = useMemo(() => new RoundedBoxGeometry(2, 2, 2, 4, 0.07), []);
  const [materials, setMaterials] = useState<THREE.MeshBasicMaterial[]>([]);
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const placeholders = createAllPlaceholderTextures();
    setMaterials(createMaterials(placeholders));

    loadTexturesWithFallback(placeholders).then((textures) => {
      setMaterials((prevMaterials) => {
        disposeMaterials(prevMaterials);
        return createMaterials(textures);
      });
    });

    return () => {
      disposeMaterials(materialsRef.current);
      geometry.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <mesh ref={meshRef} material={materials.length > 0 ? materials : undefined} geometry={geometry}>
      {materials.length === 0 && <meshStandardMaterial color="#888" />}
    </mesh>
  );
}

// Animation phases
type ZoomOutPhase = "zoom-out" | "unsquare";
type SwitchPhase = "zoom-out" | "rotate" | "zoom-in";

// Direction from origin toward the default camera — matches useFaceNavigation
const CAMERA_VEC = new THREE.Vector3(...CAMERA_POSITION);
const CAMERA_DIR = CAMERA_VEC.clone().normalize();

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

  const phaseRef = useRef<ZoomOutPhase | SwitchPhase>("zoom-out");
  const phaseStartTime = useRef(0);

  const cameraUp = useRef(new THREE.Vector3(0, 1, 0));

  // Current face (computed on init)
  const currentFaceQuat = useRef<THREE.Quaternion | null>(null);
  const currentWorldFaceCenter = useRef<THREE.Vector3 | null>(null);
  const currentZoomTarget = useRef<THREE.Vector3 | null>(null);

  // Target face for switch-face mode
  const targetFaceQuat = useRef<THREE.Quaternion | null>(null);
  const targetWorldFaceCenter = useRef<THREE.Vector3 | null>(null);
  const targetZoomTarget = useRef<THREE.Vector3 | null>(null);

  const calculateFillDistance = useCallback(() => {
    const faceSize = 2;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const aspect = size.width / size.height;
    const verticalFit = faceSize / (2 * Math.tan(fov / 2));
    const horizontalFit = faceSize / (2 * Math.tan(fov / 2) * aspect);
    return Math.min(verticalFit, horizontalFit) * 0.9;
  }, [camera, size]);

  useFrame(() => {
    if (!meshRef.current) return;

    // First-frame init: runs before Three.js renders, avoiding any flash at the
    // wrong camera position.
    if (!initialized.current) {
      initialized.current = true;

      const fillDistance = calculateFillDistance();
      const dir = CAMERA_DIR;

      // Cube: current face's local normal rotated to point toward the camera
      const cq = new THREE.Quaternion().setFromUnitVectors(
        FACE_NORMALS[currentFace].clone(),
        dir
      );
      currentFaceQuat.current = cq;
      meshRef.current.quaternion.copy(cq);

      // Face center in world space (lies along CAMERA_DIR at distance 1)
      const wfc = FACE_CENTERS[currentFace].clone().applyQuaternion(cq);
      currentWorldFaceCenter.current = wfc;

      // Camera starts at zoom target: fillDistance past the face center along CAMERA_DIR
      const zt = wfc.clone().add(dir.clone().multiplyScalar(fillDistance));
      currentZoomTarget.current = zt;

      camera.position.copy(zt);
      camera.up.copy(cameraUp.current);
      camera.lookAt(wfc);

      // Set up target face if switching
      if (targetFace) {
        const tq = new THREE.Quaternion().setFromUnitVectors(
          FACE_NORMALS[targetFace].clone(),
          dir
        );
        targetFaceQuat.current = tq;
        const twfc = FACE_CENTERS[targetFace].clone().applyQuaternion(tq);
        targetWorldFaceCenter.current = twfc;
        targetZoomTarget.current = twfc.clone().add(dir.clone().multiplyScalar(fillDistance));
      }

      phaseStartTime.current = performance.now();
      return;
    }

    const now = performance.now();
    const phase = phaseRef.current;

    if (transitionMode === "zoom-out") {
      // Camera pulls straight back from zoomTarget → CAMERA_VEC, then navigate
      if (phase === "zoom-out") {
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / animationDuration, 1);
        const eased = easeInOutQuint(progress);

        if (currentZoomTarget.current && currentWorldFaceCenter.current) {
          camera.position.lerpVectors(currentZoomTarget.current, CAMERA_VEC, eased);
          camera.up.copy(cameraUp.current);
          // lookAt drifts from face center toward cube center as we pull back
          const lookAt = currentWorldFaceCenter.current.clone().lerp(new THREE.Vector3(0, 0, 0), eased);
          camera.lookAt(lookAt);
        }

        if (progress >= 1) {
          const navigate = () => router.push(`/?from=${currentFace}`);
          if (typeof document !== "undefined" && "startViewTransition" in document) {
            (document as Document & { startViewTransition: (cb: () => void) => void })
              .startViewTransition(navigate);
          } else {
            navigate();
          }
        }
      }
    } else {
      // SWITCH FACE: zoom-out → rotate → zoom-in
      const zoomOutDur = 0.35;
      const rotateDur = 0.30;
      const zoomInDur = 0.35;

      if (phase === "zoom-out") {
        const phaseDuration = animationDuration * zoomOutDur;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        if (currentZoomTarget.current && currentWorldFaceCenter.current) {
          camera.position.lerpVectors(currentZoomTarget.current, CAMERA_VEC, eased);
          camera.up.copy(cameraUp.current);
          const lookAt = currentWorldFaceCenter.current.clone().lerp(new THREE.Vector3(0, 0, 0), eased);
          camera.lookAt(lookAt);
        }

        if (progress >= 1) {
          phaseRef.current = "rotate";
          phaseStartTime.current = now;
        }
      } else if (phase === "rotate" && currentFaceQuat.current && targetFaceQuat.current) {
        const phaseDuration = animationDuration * rotateDur;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        meshRef.current.quaternion.slerpQuaternions(
          currentFaceQuat.current,
          targetFaceQuat.current,
          eased
        );

        camera.position.copy(CAMERA_VEC);
        camera.up.copy(cameraUp.current);
        camera.lookAt(0, 0, 0);

        if (progress >= 1) {
          phaseRef.current = "zoom-in";
          phaseStartTime.current = now;
        }
      } else if (phase === "zoom-in" && targetZoomTarget.current && targetWorldFaceCenter.current && targetFace) {
        const phaseDuration = animationDuration * zoomInDur;
        const elapsed = now - phaseStartTime.current;
        const progress = Math.min(elapsed / phaseDuration, 1);
        const eased = easeInOutQuint(progress);

        camera.position.lerpVectors(CAMERA_VEC, targetZoomTarget.current, eased);
        camera.up.copy(cameraUp.current);
        const lookAt = new THREE.Vector3(0, 0, 0).lerp(targetWorldFaceCenter.current, eased);
        camera.lookAt(lookAt);

        if (progress >= 1) {
          const face = FACE_MAP[targetFace];
          if (face) {
            const navigate = () => router.push(face.route);
            if (typeof document !== "undefined" && "startViewTransition" in document) {
              (document as Document & { startViewTransition: (cb: () => void) => void })
                .startViewTransition(navigate);
            } else {
              navigate();
            }
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
