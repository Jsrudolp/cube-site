"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { FaceId, FACE_MAP } from "@/lib/faces";
import {
  CAMERA_POSITION,
  CAMERA_FOV,
  FACE_CENTERS,
  FACE_COLORS,
  FACE_LOCAL_UP,
  INITIAL_ROTATION,
  computeUprightQuat,
} from "@/lib/cube-config";
import { CubeShadow } from "./CubeShadow";
import {
  createAllPlaceholderTextures,
  createMaterials,
} from "./cubeTextures";
import { easeInOutQuint } from "@/lib/animation-modes";

interface CubeOverlayProps {
  currentFace: FaceId;
  targetFace: FaceId;
  onTransitionComplete?: () => void;
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
  const geometry = useMemo(() => new THREE.BoxGeometry(2, 2, 2), []);
  const [materials, setMaterials] = useState<THREE.MeshBasicMaterial[]>([]);
  const materialsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const placeholders = createAllPlaceholderTextures();
    setMaterials(createMaterials(placeholders));

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

// Animation phases for switch-face
type SwitchPhase = "zoom-out" | "rotate" | "zoom-in";

// Direction from origin toward the default camera
const CAMERA_VEC = new THREE.Vector3(...CAMERA_POSITION);
const CAMERA_DIR = CAMERA_VEC.clone().normalize();

function SwitchFaceAnimation({
  currentFace,
  targetFace,
  onComplete,
  animationDuration,
}: {
  currentFace: FaceId;
  targetFace: FaceId;
  onComplete: () => void;
  animationDuration: number;
}) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const initialized = useRef(false);
  const router = useRouter();

  const phaseRef = useRef<SwitchPhase>("zoom-out");
  const phaseStartTime = useRef(0);

  const cameraUp = useRef(new THREE.Vector3(0, 1, 0));

  // Current face (computed on init)
  const currentFaceQuat = useRef<THREE.Quaternion | null>(null);
  const currentZoomTarget = useRef<THREE.Vector3 | null>(null);
  const currentZoomLookAt = useRef<THREE.Vector3 | null>(null);

  // Target face
  const targetFaceQuat = useRef<THREE.Quaternion | null>(null);
  const targetZoomTarget = useRef<THREE.Vector3 | null>(null);
  const targetZoomLookAt = useRef<THREE.Vector3 | null>(null);

  useFrame(() => {
    if (!meshRef.current) return;

    if (!initialized.current) {
      initialized.current = true;

      const cam = camera as THREE.PerspectiveCamera;
      const vfov = cam.fov * (Math.PI / 180);
      const aspect = cam.aspect;
      const horizontalFit = 1 / (Math.tan(vfov / 2) * aspect);

      // Current face setup
      const cq = computeUprightQuat(currentFace);
      currentFaceQuat.current = cq;
      meshRef.current.quaternion.copy(cq);

      const wfc = FACE_CENTERS[currentFace].clone().applyQuaternion(cq);
      const faceUpWorld = FACE_LOCAL_UP[currentFace].clone().applyQuaternion(cq);
      const topAlignOffset = Math.max(0, 1 - 1 / aspect);
      const offsetVec = faceUpWorld.multiplyScalar(topAlignOffset);
      const zoomLookAt = wfc.clone().add(offsetVec);
      currentZoomLookAt.current = zoomLookAt;
      currentZoomTarget.current = zoomLookAt.clone().add(CAMERA_DIR.clone().multiplyScalar(horizontalFit));

      camera.position.copy(currentZoomTarget.current);
      camera.up.copy(cameraUp.current);
      camera.lookAt(zoomLookAt);

      // Target face setup
      const tq = computeUprightQuat(targetFace);
      targetFaceQuat.current = tq;
      const twfc = FACE_CENTERS[targetFace].clone().applyQuaternion(tq);
      const tFaceUpWorld = FACE_LOCAL_UP[targetFace].clone().applyQuaternion(tq);
      const tTopAlignOffset = Math.max(0, 1 - 1 / aspect);
      const tOffsetVec = tFaceUpWorld.multiplyScalar(tTopAlignOffset);
      const tZoomLookAt = twfc.clone().add(tOffsetVec);
      targetZoomLookAt.current = tZoomLookAt;
      targetZoomTarget.current = tZoomLookAt.clone().add(CAMERA_DIR.clone().multiplyScalar(horizontalFit));

      phaseStartTime.current = performance.now();
      return;
    }

    const now = performance.now();
    const phase = phaseRef.current;

    // SWITCH FACE: zoom-out → rotate → zoom-in
    const zoomOutDur = 0.35;
    const rotateDur = 0.30;
    const zoomInDur = 0.35;

    if (phase === "zoom-out") {
      const phaseDuration = animationDuration * zoomOutDur;
      const elapsed = now - phaseStartTime.current;
      const progress = Math.min(elapsed / phaseDuration, 1);
      const eased = easeInOutQuint(progress);

      if (currentZoomTarget.current && currentZoomLookAt.current) {
        camera.position.lerpVectors(currentZoomTarget.current, CAMERA_VEC, eased);
        camera.up.copy(cameraUp.current);
        const lookAt = currentZoomLookAt.current.clone().lerp(new THREE.Vector3(0, 0, 0), eased);
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
    } else if (phase === "zoom-in" && targetZoomTarget.current && targetZoomLookAt.current) {
      const phaseDuration = animationDuration * zoomInDur;
      const elapsed = now - phaseStartTime.current;
      const progress = Math.min(elapsed / phaseDuration, 1);
      const eased = easeInOutQuint(progress);

      camera.position.lerpVectors(CAMERA_VEC, targetZoomTarget.current, eased);
      camera.up.copy(cameraUp.current);
      const lookAt = new THREE.Vector3(0, 0, 0).lerp(targetZoomLookAt.current, eased);
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
  });

  return <TexturedCube meshRef={meshRef} />;
}

export function CubeOverlay({
  currentFace,
  targetFace,
  onTransitionComplete,
  animationDuration = 1800,
}: CubeOverlayProps) {
  const [visible, setVisible] = useState(true);

  const handleComplete = useCallback(() => {
    setVisible(false);
    onTransitionComplete?.();
  }, [onTransitionComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200]"
      style={{ backgroundColor: FACE_COLORS[currentFace] }}
    >
      <Canvas
        camera={{
          position: CAMERA_POSITION,
          fov: CAMERA_FOV,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <SwitchFaceAnimation
          currentFace={currentFace}
          targetFace={targetFace}
          onComplete={handleComplete}
          animationDuration={animationDuration}
        />

        <CubeShadow />
      </Canvas>
    </div>
  );
}
