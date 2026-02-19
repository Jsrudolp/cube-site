/**
 * Tests for useFaceNavigation hook.
 *
 * Focus areas:
 *   1. onClick guard: isAnimating blocks navigation
 *   2. onClick guard: hasDragged blocks navigation
 *   3. onClick: calls animateToFace → onZoomStart with the correct faceId
 *   4. getFaceFromClick: local-space point → correct faceId
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as THREE from "three";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Minimal camera and size for useThree
const mockCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
mockCamera.position.set(3, 2, 4);

vi.mock("@react-three/fiber", () => ({
  useThree: () => ({
    camera: mockCamera,
    size: { width: 1280, height: 720 },
  }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

import { useFaceNavigation } from "@/components/cube/hooks/useFaceNavigation";

/** Build a minimal mock THREE.Mesh whose worldToLocal is a passthrough (identity world matrix). */
function makeMockMesh(worldToLocalFn?: (v: THREE.Vector3) => THREE.Vector3) {
  const mesh = new THREE.Mesh();
  mesh.matrixWorld.identity();
  if (worldToLocalFn) {
    mesh.worldToLocal = worldToLocalFn;
  }
  return mesh;
}

/** Build a React ThreeEvent-like click event with a given world-space hit point. */
function makeClickEvent(point: THREE.Vector3, overrides: Partial<{
  stopPropagation: () => void;
}> = {}) {
  return {
    point: point.clone(),
    face: { normal: new THREE.Vector3(0, 0, 1), materialIndex: 4, a: 0, b: 1, c: 2 },
    object: new THREE.Mesh(),
    stopPropagation: vi.fn(),
    ...overrides,
    // ThreeEvent fields R3F populates — unused by the hook but required by type
    nativeEvent: new MouseEvent("click"),
    eventObject: new THREE.Mesh(),
    intersections: [],
    unprojectedPoint: new THREE.Vector3(),
    ray: new THREE.Ray(),
    camera: mockCamera,
    sourceEvent: new MouseEvent("click"),
    delta: 0,
    spaceX: 0,
    spaceY: 0,
  } as unknown as import("@react-three/fiber").ThreeEvent<MouseEvent>;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("useFaceNavigation — navigation guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onZoomStart with detected faceId on clean click (no drag)", () => {
    const onZoomStart = vi.fn();
    const meshRef = { current: makeMockMesh() };
    const hasDragged = { current: false };

    const { result } = renderHook(() =>
      useFaceNavigation({ meshRef, hasDragged, onZoomStart })
    );

    // Click on front face: world point (0, 0, 1) → localPoint ≈ (0, 0, 1) → front
    const event = makeClickEvent(new THREE.Vector3(0, 0, 1));
    act(() => { result.current.onClick(event); });

    expect(onZoomStart).toHaveBeenCalledOnce();
    expect(onZoomStart).toHaveBeenCalledWith("front");
  });

  it("does NOT navigate when hasDragged is true", () => {
    const onZoomStart = vi.fn();
    const meshRef = { current: makeMockMesh() };
    const hasDragged = { current: true }; // drag happened

    const { result } = renderHook(() =>
      useFaceNavigation({ meshRef, hasDragged, onZoomStart })
    );

    const event = makeClickEvent(new THREE.Vector3(0, 0, 1));
    act(() => { result.current.onClick(event); });

    expect(onZoomStart).not.toHaveBeenCalled();
  });

  it("does NOT navigate while isAnimating", () => {
    const onZoomStart = vi.fn();
    const meshRef = { current: makeMockMesh() };
    const hasDragged = { current: false };

    const { result } = renderHook(() =>
      useFaceNavigation({ meshRef, hasDragged, onZoomStart })
    );

    // Trigger a navigation to start an animation
    const event1 = makeClickEvent(new THREE.Vector3(0, 0, 1));
    act(() => { result.current.onClick(event1); });
    expect(onZoomStart).toHaveBeenCalledOnce();

    // isAnimating is now true; second click should be ignored
    const event2 = makeClickEvent(new THREE.Vector3(-1, 0, 0));
    act(() => { result.current.onClick(event2); });
    // Still only one call
    expect(onZoomStart).toHaveBeenCalledOnce();
  });

  it("does NOT navigate when enabled=false", () => {
    const onZoomStart = vi.fn();
    const meshRef = { current: makeMockMesh() };
    const hasDragged = { current: false };

    const { result } = renderHook(() =>
      useFaceNavigation({ meshRef, hasDragged, onZoomStart, enabled: false })
    );

    const event = makeClickEvent(new THREE.Vector3(0, 0, 1));
    act(() => { result.current.onClick(event); });

    expect(onZoomStart).not.toHaveBeenCalled();
  });
});

describe("useFaceNavigation — face detection via local-space point", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const cases: [string, THREE.Vector3, string][] = [
    ["front face (+Z)",     new THREE.Vector3(0,  0,  1), "front"],
    ["back face (-Z)",      new THREE.Vector3(0,  0, -1), "back"],
    ["community face (+X)", new THREE.Vector3(1,  0,  0), "community"],
    ["music face (-X)",     new THREE.Vector3(-1, 0,  0), "music"],
    ["thinking face (+Y)",  new THREE.Vector3(0,  1,  0), "thinking"],
    ["building face (-Y)",  new THREE.Vector3(0, -1,  0), "building"],
  ];

  cases.forEach(([label, worldPoint, expectedFace]) => {
    it(`detects ${label}`, () => {
      const onZoomStart = vi.fn();
      const meshRef = { current: makeMockMesh() };
      const hasDragged = { current: false };

      const { result } = renderHook(() =>
        useFaceNavigation({ meshRef, hasDragged, onZoomStart })
      );

      const event = makeClickEvent(worldPoint);
      act(() => { result.current.onClick(event); });

      expect(onZoomStart).toHaveBeenCalledOnce();
      expect(onZoomStart).toHaveBeenCalledWith(expectedFace);
    });
  });

  it("detects the correct face when worldToLocal applies a rotation", () => {
    const onZoomStart = vi.fn();

    // Mesh rotated 90° around Y: local +X maps to world +Z
    // So clicking world (0,0,1) → local (1,0,0) → community
    const rotatedMesh = makeMockMesh();
    rotatedMesh.rotation.set(0, Math.PI / 2, 0);
    rotatedMesh.updateMatrixWorld();

    const meshRef = { current: rotatedMesh };
    const hasDragged = { current: false };

    const { result } = renderHook(() =>
      useFaceNavigation({ meshRef, hasDragged, onZoomStart })
    );

    // World-space click on the face that was originally +X and now faces +Z
    const worldPoint = rotatedMesh.localToWorld(new THREE.Vector3(1, 0, 0));
    const event = makeClickEvent(worldPoint);
    act(() => { result.current.onClick(event); });

    expect(onZoomStart).toHaveBeenCalledOnce();
    expect(onZoomStart).toHaveBeenCalledWith("community");
  });
});
