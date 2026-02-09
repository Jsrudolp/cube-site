"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaceId, FACE_MAP, FACES } from "@/lib/faces";
import { CSS3DCube, CubeFace } from "./CSS3DCube";
import { FacePreview } from "./FacePreview";
import type { CubeHandoffState } from "./hooks/useFaceNavigation";

// CSS rotation targets for each face (to make face parallel to screen)
// In CSS 3D, the coordinate system has Y pointing down, so we negate X rotations
// The cube rotations should bring the selected face to face the camera
const FACE_TARGET_ROTATIONS: Record<FaceId, { x: number; y: number; z: number }> = {
  front: { x: 0, y: 0, z: 0 },
  back: { x: 0, y: Math.PI, z: 0 },
  community: { x: 0, y: -Math.PI / 2, z: 0 }, // Right (+X) - rotate cube left to see right face
  music: { x: 0, y: Math.PI / 2, z: 0 }, // Left (-X) - rotate cube right to see left face
  thinking: { x: -Math.PI / 2, y: 0, z: 0 }, // Top (+Y) - tilt cube back to see top
  building: { x: Math.PI / 2, y: 0, z: 0 }, // Bottom (-Y) - tilt cube forward to see bottom
};

// easeInOutQuint function
function easeInOutQuint(x: number): number {
  return x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

interface AnimationState {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  cubeSize: number;
  perspective: number;
  isActive: boolean;
}

const INITIAL_STATE: AnimationState = {
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scale: 1,
  cubeSize: 200,
  perspective: 1000,
  isActive: false,
};

interface CSSCubeZoomProps {
  handoffState: CubeHandoffState | null;
  onComplete?: () => void;
  animationDuration?: number;
}

export function CSSCubeZoom({
  handoffState,
  onComplete,
  animationDuration = 1800,
}: CSSCubeZoomProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AnimationState>(INITIAL_STATE);
  const animationRef = useRef<number | null>(null);

  // Calculate scale needed to fill viewport with face
  const calculateFillScale = useCallback((size: number) => {
    if (typeof window === "undefined") return 10;
    const viewportSize = Math.max(window.innerWidth, window.innerHeight);
    return (viewportSize / size) * 1.1; // 110% to ensure full coverage
  }, []);

  // Run animation when handoff state changes
  useEffect(() => {
    if (!handoffState) {
      // Reset state when handoff is cleared - this is intentional
      setState(INITIAL_STATE);
      return;
    }

    // Initialize from handoff state
    // Convert from Three.js coordinate system (Y up) to CSS 3D (Y down)
    // We negate X to account for the inverted Y axis
    const startRotation = {
      x: -handoffState.rotationX,
      y: handoffState.rotationY,
      z: handoffState.rotationZ,
    };
    const targetRotation = FACE_TARGET_ROTATIONS[handoffState.faceId];
    const size = handoffState.cubeScreenSize;

    // Calculate initial perspective based on camera distance
    const initialPerspective = handoffState.cameraDistance * size * 0.5;

    // Phase timing from plan: 40% rotate, 30% square, 30% zoom
    // Combined rotate+square = 70%, zoom = 30%
    const rotateDuration = animationDuration * 0.7;
    const zoomDuration = animationDuration * 0.3;
    const totalDuration = rotateDuration + zoomDuration;

    const startScale = 1;
    const targetScale = calculateFillScale(size);

    const startTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      let newState: AnimationState;

      if (elapsed < rotateDuration) {
        // Phase 1: Rotate to face-forward
        const progress = Math.min(elapsed / rotateDuration, 1);
        const eased = easeInOutQuint(progress);

        newState = {
          cubeSize: size,
          rotationX: startRotation.x + (targetRotation.x - startRotation.x) * eased,
          rotationY: startRotation.y + (targetRotation.y - startRotation.y) * eased,
          rotationZ: startRotation.z + (targetRotation.z - startRotation.z) * eased,
          scale: 1,
          perspective: initialPerspective,
          isActive: true,
        };
      } else if (elapsed < totalDuration) {
        // Phase 2: Zoom in
        const phaseElapsed = elapsed - rotateDuration;
        const progress = Math.min(phaseElapsed / zoomDuration, 1);
        const eased = easeInOutQuint(progress);

        newState = {
          cubeSize: size,
          rotationX: targetRotation.x,
          rotationY: targetRotation.y,
          rotationZ: targetRotation.z,
          scale: startScale + (targetScale - startScale) * eased,
          perspective: initialPerspective + 2000 * eased,
          isActive: true,
        };
      } else {
        // Animation complete - navigate to face route
        const face = FACE_MAP[handoffState.faceId];
        if (face) {
          router.push(face.route);
        }
        onComplete?.();
        return;
      }

      setState(newState);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation on next frame
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handoffState, animationDuration, calculateFillScale, router, onComplete]);

  if (!state.isActive) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 50 }}
    >
      <CSS3DCube
        rotationX={state.rotationX}
        rotationY={state.rotationY}
        rotationZ={state.rotationZ}
        scale={state.scale}
        perspective={state.perspective}
      >
        {FACES.map((face) => (
          <CubeFace key={face.id} faceId={face.id} size={state.cubeSize}>
            <FacePreview faceId={face.id} size={state.cubeSize} />
          </CubeFace>
        ))}
      </CSS3DCube>
    </div>
  );
}

export default CSSCubeZoom;
