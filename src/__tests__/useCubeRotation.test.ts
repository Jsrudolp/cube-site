/**
 * Tests for useCubeRotation hook.
 *
 * Focus areas:
 *   1. hasDragged resets on pointerDown
 *   2. hasDragged is set when pointer moves >5px from press point
 *   3. Mesh rotation is applied on pointer move
 *   4. isDragging flag is correctly managed
 *   5. Velocity is cleared on new pointer down
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as THREE from "three";
import { useCubeRotation } from "@/components/cube/hooks/useCubeRotation";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeMockMesh() {
  const mesh = new THREE.Mesh();
  mesh.rotation.set(0, 0, 0);
  return mesh;
}

/** Minimal ThreeEvent-like pointer event */
function makePointerEvent(clientX: number, clientY: number, pointerId = 1) {
  return {
    clientX,
    clientY,
    pointerId,
    stopPropagation: vi.fn(),
    target: {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
    },
  } as unknown as import("@react-three/fiber").ThreeEvent<PointerEvent>;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useCubeRotation — isDragging flag", () => {
  it("isDragging is false initially", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));
    expect(result.current.isDragging.current).toBe(false);
  });

  it("isDragging becomes true after pointerDown", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });

    expect(result.current.isDragging.current).toBe(true);
  });

  it("isDragging becomes false after pointerUp", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerUp(makePointerEvent(110, 100)); });

    expect(result.current.isDragging.current).toBe(false);
  });
});

describe("useCubeRotation — hasDragged tracking", () => {
  it("hasDragged is false after pointerDown (reset)", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    expect(result.current.hasDragged.current).toBe(false);
  });

  it("hasDragged remains false for tiny moves (<5px total)", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(102, 101)); }); // ~2.2px
    expect(result.current.hasDragged.current).toBe(false);
  });

  it("hasDragged becomes true after moving >5px horizontally", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(106, 100)); }); // 6px
    expect(result.current.hasDragged.current).toBe(true);
  });

  it("hasDragged becomes true after moving >5px diagonally", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(104, 104)); }); // 4²+4²=32 > 25
    expect(result.current.hasDragged.current).toBe(true);
  });

  it("hasDragged stays false for 4px diagonal move (4²+2²=20 < 25)", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(104, 102)); }); // 16+4=20 < 25
    expect(result.current.hasDragged.current).toBe(false);
  });

  it("hasDragged is measured from pointerDown position, not previous move position", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(0, 0)); });
    // Move 3px at a time (each sub-threshold, but cumulative grows)
    act(() => { result.current.onPointerMove(makePointerEvent(3, 0)); });   // 9 < 25 → not yet
    act(() => { result.current.onPointerMove(makePointerEvent(6, 0)); });   // total=6px → 36 > 25
    expect(result.current.hasDragged.current).toBe(true);
  });

  it("new pointerDown resets hasDragged even after a drag", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    // First drag
    act(() => { result.current.onPointerDown(makePointerEvent(0, 0)); });
    act(() => { result.current.onPointerMove(makePointerEvent(100, 0)); });
    expect(result.current.hasDragged.current).toBe(true);

    // User lifts and re-presses
    act(() => { result.current.onPointerUp(makePointerEvent(100, 0)); });
    act(() => { result.current.onPointerDown(makePointerEvent(100, 0)); });
    expect(result.current.hasDragged.current).toBe(false);
  });
});

describe("useCubeRotation — mesh rotation", () => {
  it("rotates mesh.rotation.y on horizontal pointer move", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));
    const initialY = meshRef.current!.rotation.y;

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(110, 100)); }); // +10px X

    // Y rotation should have increased (sensitivity = 0.006, delta = 10)
    expect(meshRef.current!.rotation.y).toBeGreaterThan(initialY);
  });

  it("rotates mesh.rotation.x on vertical pointer move", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));
    const initialX = meshRef.current!.rotation.x;

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(100, 120)); }); // +20px Y

    expect(meshRef.current!.rotation.x).toBeGreaterThan(initialX);
  });

  it("does not rotate mesh when not dragging", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));
    const initialY = meshRef.current!.rotation.y;

    // Move without pressing down first
    act(() => { result.current.onPointerMove(makePointerEvent(200, 100)); });

    expect(meshRef.current!.rotation.y).toBe(initialY);
  });

  it("does not rotate when disabled", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef, enabled: false }));
    const initialY = meshRef.current!.rotation.y;

    act(() => { result.current.onPointerDown(makePointerEvent(100, 100)); });
    act(() => { result.current.onPointerMove(makePointerEvent(150, 100)); });

    expect(meshRef.current!.rotation.y).toBe(initialY);
    expect(result.current.isDragging.current).toBe(false);
  });
});

describe("useCubeRotation — velocity and momentum", () => {
  it("velocity is reset to zero on new pointerDown", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    // Build up velocity with a drag
    act(() => { result.current.onPointerDown(makePointerEvent(0, 0)); });
    act(() => { result.current.onPointerMove(makePointerEvent(100, 0)); });
    act(() => { result.current.onPointerUp(makePointerEvent(100, 0)); });

    // New press should clear velocity
    act(() => { result.current.onPointerDown(makePointerEvent(100, 0)); });

    // Velocity is an internal ref; we verify it by calling update() and
    // checking that no unexpected rotation happens from stale momentum.
    const rotYAfterReset = meshRef.current!.rotation.y;
    act(() => { result.current.update(); }); // should not apply old momentum
    // Rotation shouldn't change (isDragging=true → update won't apply momentum,
    // and after reset, velocity=0)
    expect(meshRef.current!.rotation.y).toBe(rotYAfterReset);
  });
});

describe("useCubeRotation — setEnabled", () => {
  it("disabling mid-drag stops rotation", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(0, 0)); });
    act(() => { result.current.setEnabled(false); });

    const rotYBeforeMove = meshRef.current!.rotation.y;
    act(() => { result.current.onPointerMove(makePointerEvent(100, 0)); });
    // After disabling, move should have no effect
    expect(meshRef.current!.rotation.y).toBe(rotYBeforeMove);
  });

  it("isDragging is cleared when disabled", () => {
    const meshRef = { current: makeMockMesh() };
    const { result } = renderHook(() => useCubeRotation({ meshRef }));

    act(() => { result.current.onPointerDown(makePointerEvent(0, 0)); });
    expect(result.current.isDragging.current).toBe(true);

    act(() => { result.current.setEnabled(false); });
    expect(result.current.isDragging.current).toBe(false);
  });
});
