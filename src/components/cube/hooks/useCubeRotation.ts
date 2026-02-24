import { useRef, useCallback, useEffect } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  AUTO_ROTATE_SPEED,
  IDLE_TIMEOUT,
  DRAG_SENSITIVITY,
  MOMENTUM_FRICTION,
} from "@/lib/cube-config";

// Reusable world-space axis vectors for quaternion rotations
const _worldY = new THREE.Vector3(0, 1, 0);
const _worldX = new THREE.Vector3(1, 0, 0);

interface UseCubeRotationOptions {
  meshRef: React.RefObject<THREE.Mesh | null>;
  enabled?: boolean;
}

export function useCubeRotation({ meshRef, enabled = true }: UseCubeRotationOptions) {
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const isIdle = useRef(true);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const isEnabled = useRef(enabled);

  // Keep enabled ref in sync
  useEffect(() => {
    isEnabled.current = enabled;
  }, [enabled]);

  const resetIdleTimer = useCallback(() => {
    isIdle.current = false;
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }
    idleTimeout.current = setTimeout(() => {
      isIdle.current = true;
    }, IDLE_TIMEOUT);
  }, []);

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isEnabled.current) return;
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      isDragging.current = true;
      hasDragged.current = false;
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      lastPointer.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };
      resetIdleTimer();
    },
    [resetIdleTimer]
  );

  const onPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isEnabled.current || !isDragging.current || !meshRef.current) return;
      e.stopPropagation();

      const deltaX = e.clientX - lastPointer.current.x;
      const deltaY = e.clientY - lastPointer.current.y;

      // Track if the pointer moved significantly from where it was pressed
      const totalDx = e.clientX - pointerDownPos.current.x;
      const totalDy = e.clientY - pointerDownPos.current.y;
      if (totalDx * totalDx + totalDy * totalDy > 25) { // 5px threshold
        hasDragged.current = true;
      }

      velocity.current = {
        x: deltaX * DRAG_SENSITIVITY,
        y: deltaY * DRAG_SENSITIVITY,
      };

      // Rotate around world-space axes so drag direction is always consistent
      // regardless of the cube's current orientation
      const quatY = new THREE.Quaternion().setFromAxisAngle(_worldY, deltaX * DRAG_SENSITIVITY);
      const quatX = new THREE.Quaternion().setFromAxisAngle(_worldX, deltaY * DRAG_SENSITIVITY);
      meshRef.current.quaternion.premultiply(quatY.multiply(quatX));

      lastPointer.current = { x: e.clientX, y: e.clientY };
      resetIdleTimer();
    },
    [meshRef, resetIdleTimer]
  );

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isEnabled.current) return;
      e.stopPropagation();
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      isDragging.current = false;
    },
    []
  );

  // Frame update for momentum and auto-rotation
  const update = useCallback(() => {
    if (!meshRef.current || !isEnabled.current) return;

    if (!isDragging.current) {
      // Apply momentum (world-space)
      if (Math.abs(velocity.current.x) > 0.0001 || Math.abs(velocity.current.y) > 0.0001) {
        const quatY = new THREE.Quaternion().setFromAxisAngle(_worldY, velocity.current.x);
        const quatX = new THREE.Quaternion().setFromAxisAngle(_worldX, velocity.current.y);
        meshRef.current.quaternion.premultiply(quatY.multiply(quatX));
        velocity.current.x *= MOMENTUM_FRICTION;
        velocity.current.y *= MOMENTUM_FRICTION;
      }
      // Auto-rotate when idle (world-space)
      else if (isIdle.current) {
        const quatY = new THREE.Quaternion().setFromAxisAngle(_worldY, AUTO_ROTATE_SPEED);
        meshRef.current.quaternion.premultiply(quatY);
      }
    }
  }, [meshRef]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    isEnabled.current = value;
    if (!value) {
      isDragging.current = false;
      velocity.current = { x: 0, y: 0 };
    }
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    update,
    isDragging,
    hasDragged,
    setEnabled,
  };
}
