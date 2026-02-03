import { useRef, useCallback, useEffect } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  AUTO_ROTATE_SPEED,
  IDLE_TIMEOUT,
  DRAG_SENSITIVITY,
  MOMENTUM_FRICTION,
} from "@/lib/cube-config";

interface UseCubeRotationOptions {
  meshRef: React.RefObject<THREE.Mesh | null>;
  enabled?: boolean;
}

export function useCubeRotation({ meshRef, enabled = true }: UseCubeRotationOptions) {
  const isDragging = useRef(false);
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

      velocity.current = {
        x: deltaX * DRAG_SENSITIVITY,
        y: deltaY * DRAG_SENSITIVITY,
      };

      // Apply rotation based on drag
      meshRef.current.rotation.y += deltaX * DRAG_SENSITIVITY;
      meshRef.current.rotation.x += deltaY * DRAG_SENSITIVITY;

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
      // Apply momentum
      if (Math.abs(velocity.current.x) > 0.0001 || Math.abs(velocity.current.y) > 0.0001) {
        meshRef.current.rotation.y += velocity.current.x;
        meshRef.current.rotation.x += velocity.current.y;
        velocity.current.x *= MOMENTUM_FRICTION;
        velocity.current.y *= MOMENTUM_FRICTION;
      }
      // Auto-rotate when idle
      else if (isIdle.current) {
        meshRef.current.rotation.y += AUTO_ROTATE_SPEED;
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
    setEnabled,
  };
}
