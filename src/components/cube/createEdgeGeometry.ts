import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const EDGE_RADIUS = 0.06;
const EDGE_SEGMENTS = 4;
const HALF = 1; // half-size of the 2×2×2 box

/**
 * Builds a single merged BufferGeometry containing 12 quarter-cylinder edge
 * strips and 8 eighth-sphere corner patches for a 2×2×2 box.
 */
export function createEdgeGeometry(): THREE.BufferGeometry {
  const r = EDGE_RADIUS;
  const seg = EDGE_SEGMENTS;
  const edgeLen = 2 * HALF - 2 * r; // length of straight edge between corners
  const parts: THREE.BufferGeometry[] = [];

  // --- 12 quarter-cylinder edges ---
  // Each edge is a 90° cylinder arc extruded along the edge direction.
  // We build a template cylinder (along Y axis) and position/rotate copies.

  // Edges grouped by direction:
  // 4 edges along X, 4 along Y, 4 along Z
  const edgeDefs: { pos: [number, number, number]; axis: "x" | "y" | "z"; rotX: number; rotY: number; rotZ: number; thetaStart: number }[] = [];

  // Helper: for a given pair of sign offsets perpendicular to the edge axis,
  // compute position and rotation.

  // Edges along X (length along X)
  for (const [sy, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
    edgeDefs.push({
      pos: [0, sy * (HALF - r), sz * (HALF - r)],
      axis: "x",
      rotX: 0,
      rotY: 0,
      rotZ: Math.PI / 2,
      thetaStart: getThetaStart(sy, sz, "x"),
    });
  }

  // Edges along Y (length along Y)
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
    edgeDefs.push({
      pos: [sx * (HALF - r), 0, sz * (HALF - r)],
      axis: "y",
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      thetaStart: getThetaStart(sx, sz, "y"),
    });
  }

  // Edges along Z (length along Z)
  for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]) {
    edgeDefs.push({
      pos: [sx * (HALF - r), sy * (HALF - r), 0],
      axis: "z",
      rotX: Math.PI / 2,
      rotY: 0,
      rotZ: 0,
      thetaStart: getThetaStart(sx, sy, "z"),
    });
  }

  for (const def of edgeDefs) {
    const cyl = new THREE.CylinderGeometry(r, r, edgeLen, seg, 1, true, def.thetaStart, Math.PI / 2);
    const m = new THREE.Matrix4();
    // First rotate the cylinder to align with edge axis, then apply the theta rotation
    m.makeRotationFromEuler(new THREE.Euler(def.rotX, def.rotY, def.rotZ));
    m.setPosition(def.pos[0], def.pos[1], def.pos[2]);
    cyl.applyMatrix4(m);
    cyl.deleteAttribute("uv");
    parts.push(cyl);
  }

  // --- 8 eighth-sphere corners ---
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const corner = createEighthSphere(r, seg, sx, sy, sz);
        corner.translate(
          sx * (HALF - r),
          sy * (HALF - r),
          sz * (HALF - r)
        );
        parts.push(corner);
      }
    }
  }

  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error("Failed to merge edge geometries");

  // Dispose individual parts
  parts.forEach((p) => p.dispose());

  return merged;
}

/**
 * Determine the thetaStart for a quarter-cylinder so it faces outward.
 */
function getThetaStart(s1: number, s2: number, axis: "x" | "y" | "z"): number {
  // The cylinder is created along Y by default. After rotation, the theta
  // angle maps to different world-space directions depending on axis.
  // We want the 90° arc to cover the outward-facing quadrant.

  if (axis === "y") {
    // Cylinder stays along Y. Cross-section is in XZ plane.
    // CylinderGeometry theta=0 starts at +X in local, goes CCW when viewed from +Y.
    if (s1 > 0 && s2 > 0) return 0;
    if (s1 > 0 && s2 < 0) return -Math.PI / 2;
    if (s1 < 0 && s2 > 0) return Math.PI / 2;
    return Math.PI;
  }

  if (axis === "x") {
    // Cylinder rotated 90° around Z → lies along X. Cross-section in YZ plane.
    // After rotation, local X→-Y, local Z→Z. theta=0 → -Y direction.
    if (s1 > 0 && s2 > 0) return 0;
    if (s1 > 0 && s2 < 0) return Math.PI / 2;
    if (s1 < 0 && s2 > 0) return -Math.PI / 2;
    return Math.PI;
  }

  // axis === "z"
  // Cylinder rotated 90° around X → lies along Z. Cross-section in XY plane.
  if (s1 > 0 && s2 > 0) return 0;
  if (s1 > 0 && s2 < 0) return Math.PI / 2;
  if (s1 < 0 && s2 > 0) return -Math.PI / 2;
  return Math.PI;
}

/**
 * Creates an eighth-sphere patch for one corner of the box.
 * sx, sy, sz indicate which octant (+1 or -1).
 */
function createEighthSphere(
  radius: number,
  segments: number,
  sx: number,
  sy: number,
  sz: number
): THREE.BufferGeometry {
  // Build the patch manually from vertices
  const vertices: number[] = [];
  const indices: number[] = [];

  // Parametric: phi from 0 to PI/2, theta from 0 to PI/2
  // phi = polar angle from +Y, theta = azimuthal from +X toward +Z
  const steps = segments;

  for (let i = 0; i <= steps; i++) {
    const phi = (i / steps) * (Math.PI / 2);
    for (let j = 0; j <= steps; j++) {
      const theta = (j / steps) * (Math.PI / 2);

      const x = sx * radius * Math.sin(phi) * Math.cos(theta);
      const y = sy * radius * Math.cos(phi);
      const z = sz * radius * Math.sin(phi) * Math.sin(theta);

      vertices.push(x, y, z);
    }
  }

  const stride = steps + 1;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
