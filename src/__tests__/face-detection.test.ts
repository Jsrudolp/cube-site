/**
 * Tests for the face detection algorithm used in useFaceNavigation.
 *
 * The algorithm: given a hit point in local (mesh) space, find the dominant
 * axis to determine which of the 6 cube faces was clicked.
 *
 * This is the logic we fixed — previously used e.face.normal which was
 * unreliable for RoundedBoxGeometry; now uses e.point transformed to local space.
 */
import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { FACE_INDEX_TO_ID } from "@/lib/cube-config";
import type { FaceId } from "@/lib/faces";

/**
 * Pure face-detection logic extracted from useFaceNavigation.getFaceFromClick.
 * Determines which cube face a local-space hit point belongs to.
 */
function detectFaceFromLocalPoint(localPoint: THREE.Vector3): FaceId | null {
  const { x, y, z } = localPoint;
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const absZ = Math.abs(z);

  let faceIndex: number;
  if (absX >= absY && absX >= absZ) {
    faceIndex = x > 0 ? 0 : 1; // +X (community) or -X (music)
  } else if (absY >= absX && absY >= absZ) {
    faceIndex = y > 0 ? 2 : 3; // +Y (thinking) or -Y (building)
  } else {
    faceIndex = z > 0 ? 4 : 5; // +Z (front) or -Z (back)
  }

  return FACE_INDEX_TO_ID[faceIndex] ?? null;
}

describe("detectFaceFromLocalPoint — axis-aligned face centers", () => {
  it("detects front face from point at (0, 0, 1)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0, 0, 1))).toBe("front");
  });

  it("detects back face from point at (0, 0, -1)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0, 0, -1))).toBe("back");
  });

  it("detects community face (+X) from point at (1, 0, 0)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(1, 0, 0))).toBe("community");
  });

  it("detects music face (-X) from point at (-1, 0, 0)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(-1, 0, 0))).toBe("music");
  });

  it("detects thinking face (+Y) from point at (0, 1, 0)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0, 1, 0))).toBe("thinking");
  });

  it("detects building face (-Y) from point at (0, -1, 0)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0, -1, 0))).toBe("building");
  });
});

describe("detectFaceFromLocalPoint — off-center clicks on flat face regions", () => {
  it("detects front for any point near the front face (z dominant, positive)", () => {
    // Simulate clicking near a corner of the front face (still z-dominant)
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.4, 0.4, 0.9))).toBe("front");
    expect(detectFaceFromLocalPoint(new THREE.Vector3(-0.4, 0.4, 0.9))).toBe("front");
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.4, -0.4, 0.9))).toBe("front");
  });

  it("detects back for any point near the back face (z dominant, negative)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.4, 0.4, -0.9))).toBe("back");
    expect(detectFaceFromLocalPoint(new THREE.Vector3(-0.4, -0.3, -0.85))).toBe("back");
  });

  it("detects community for points on +X face even with small y/z offsets", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.95, 0.2, 0.1))).toBe("community");
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.85, -0.3, 0.4))).toBe("community");
  });

  it("detects thinking for points on +Y face with x/z offsets", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.3, 0.9, 0.1))).toBe("thinking");
    expect(detectFaceFromLocalPoint(new THREE.Vector3(-0.2, 0.95, -0.15))).toBe("thinking");
  });
});

describe("detectFaceFromLocalPoint — rounded edge points (non-axis-aligned)", () => {
  // On a RoundedBoxGeometry the rounded edges have mixed coordinates.
  // The dominant-axis approach still picks the nearest face correctly.

  it("front-top rounded edge → front (z slightly > y)", () => {
    // z=0.93, y=0.35 → z dominant → front
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0, 0.35, 0.93))).toBe("front");
  });

  it("front-top rounded edge → thinking (y slightly > z)", () => {
    // y=0.93, z=0.35 → y dominant, positive → thinking
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0, 0.93, 0.35))).toBe("thinking");
  });

  it("front-right rounded edge → front (z > x)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.35, 0, 0.93))).toBe("front");
  });

  it("front-right rounded edge → community (x > z)", () => {
    expect(detectFaceFromLocalPoint(new THREE.Vector3(0.93, 0, 0.35))).toBe("community");
  });

  it("back-left rounded corner assigns to whichever axis dominates", () => {
    // Back-left-bottom corner: x=-0.7, y=-0.5, z=-0.5 → x dominant negative → music
    expect(detectFaceFromLocalPoint(new THREE.Vector3(-0.7, -0.5, -0.5))).toBe("music");
  });
});

describe("detectFaceFromLocalPoint — behavior after cube rotation", () => {
  /**
   * After the cube rotates, the world-space hit point changes, but worldToLocal
   * transforms it back to object space. We simulate this by verifying that the
   * algorithm always works on local-space coordinates regardless of world rotation.
   *
   * Simulate worldToLocal by manually applying the inverse of a known rotation.
   */

  it("correctly detects face after +90° Y rotation (music face now faces camera)", () => {
    // After rotating cube +90° around Y:
    //   local +X → world -Z  (community faces away)
    //   local -X → world +Z  (music now faces the camera at +Z)
    // Clicking the center of the now-forward face lands at world (0, 0, 1).
    // worldToLocal (inverse of Ry+90 = Ry-90) maps (0,0,1) → (-1,0,0) → music.
    const rotationY90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    const mesh = new THREE.Mesh();
    mesh.quaternion.copy(rotationY90);
    mesh.updateMatrixWorld();

    const worldHitPoint = new THREE.Vector3(0, 0, 1);
    const localPoint = mesh.worldToLocal(worldHitPoint.clone());

    expect(localPoint.x).toBeLessThan(-0.9); // ~(-1, 0, 0)
    expect(detectFaceFromLocalPoint(localPoint)).toBe("music");
  });

  it("correctly detects face after -90° Y rotation (community face now faces camera)", () => {
    // After rotating cube -90° around Y:
    //   local +X → world +Z  (community now faces camera)
    // worldToLocal maps (0,0,1) → (1,0,0) → community.
    const rotationNegY90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    const mesh = new THREE.Mesh();
    mesh.quaternion.copy(rotationNegY90);
    mesh.updateMatrixWorld();

    const worldHitPoint = new THREE.Vector3(0, 0, 1);
    const localPoint = mesh.worldToLocal(worldHitPoint.clone());

    expect(localPoint.x).toBeGreaterThan(0.9); // ~(1, 0, 0)
    expect(detectFaceFromLocalPoint(localPoint)).toBe("community");
  });

  it("correctly detects front face regardless of cube tilt (simulates initial rotation)", () => {
    // Replicate the cube's initial rotation: Euler(-0.4, 0.5, 0)
    const mesh = new THREE.Mesh();
    mesh.rotation.set(-0.4, 0.5, 0);
    mesh.updateMatrixWorld();

    // A click lands on the front face of the rotated cube.
    // The front face center in local space is at (0, 0, 1).
    // In world space, this is at mesh.localToWorld((0,0,1)).
    const frontFaceCenterLocal = new THREE.Vector3(0, 0, 1);
    const frontFaceCenterWorld = mesh.localToWorld(frontFaceCenterLocal.clone());

    // Simulate the click hit at the front face center (in world space)
    // Then transform back to local space (as the navigation hook does):
    const localPoint = mesh.worldToLocal(frontFaceCenterWorld.clone());

    expect(localPoint.z).toBeGreaterThan(0.9); // Should be ~1
    expect(detectFaceFromLocalPoint(localPoint)).toBe("front");
  });
});
