import { FaceId } from "./faces";
import * as THREE from "three";

// Three.js BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
// Maps each Three.js face index to our FaceId
export const FACE_INDEX_TO_ID: FaceId[] = [
  "community", // 0: Right (+X)
  "music",     // 1: Left (-X)
  "thinking",  // 2: Top (+Y)
  "building",  // 3: Bottom (-Y)
  "front",     // 4: Front (+Z)
  "back",      // 5: Back (-Z)
];

export const FACE_ID_TO_INDEX: Record<FaceId, number> = {
  community: 0,
  music: 1,
  thinking: 2,
  building: 3,
  front: 4,
  back: 5,
};

// Colors for each face (used as placeholders/fallbacks)
export const FACE_COLORS: Record<FaceId, string> = {
  front: "#FFFFFF",     // white
  music: "#1a1a2e",     // dark purple
  building: "#f5e6d3",  // warm beige
  community: "#f5f5f0", // off-white
  thinking: "#ececec",  // light gray
  back: "#000000",      // black
};

// Face normal vectors (outward-pointing, in canonical orientation)
export const FACE_NORMALS: Record<FaceId, THREE.Vector3> = {
  community: new THREE.Vector3(1, 0, 0),   // +X
  music: new THREE.Vector3(-1, 0, 0),      // -X
  thinking: new THREE.Vector3(0, 1, 0),    // +Y
  building: new THREE.Vector3(0, -1, 0),   // -Y
  front: new THREE.Vector3(0, 0, 1),       // +Z
  back: new THREE.Vector3(0, 0, -1),       // -Z
};

// Face centers (in canonical orientation, 1 unit from origin)
export const FACE_CENTERS: Record<FaceId, THREE.Vector3> = {
  community: new THREE.Vector3(1, 0, 0),   // +X
  music: new THREE.Vector3(-1, 0, 0),      // -X
  thinking: new THREE.Vector3(0, 1, 0),    // +Y
  building: new THREE.Vector3(0, -1, 0),   // -Y
  front: new THREE.Vector3(0, 0, 1),       // +Z
  back: new THREE.Vector3(0, 0, -1),       // -Z
};

// Canonical quaternions - cube rotation so each face points along its natural axis
// These are the "squared" orientations where face edges align with world axes
export const CANONICAL_QUATERNIONS: Record<FaceId, THREE.Quaternion> = {
  // Front face (+Z) - identity, no rotation needed
  front: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0),
  // Back face (-Z) - 180° around Y
  back: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
  // Right face (+X) - 90° around Y
  community: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2),
  // Left face (-X) - -90° around Y
  music: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
  // Top face (+Y) - -90° around X
  thinking: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
  // Bottom face (-Y) - 90° around X
  building: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
};

// Camera configuration
export const CAMERA_POSITION: [number, number, number] = [3, 2, 4];
export const CAMERA_FOV = 50;

// Distance from origin for squared camera positions
const CAMERA_DISTANCE = Math.sqrt(3*3 + 2*2 + 4*4); // ~5.385

// Squared camera positions - camera along each face's normal axis
export const SQUARED_CAMERA_POSITIONS: Record<FaceId, THREE.Vector3> = {
  front: new THREE.Vector3(0, 0, CAMERA_DISTANCE),
  back: new THREE.Vector3(0, 0, -CAMERA_DISTANCE),
  community: new THREE.Vector3(CAMERA_DISTANCE, 0, 0),  // Right (+X)
  music: new THREE.Vector3(-CAMERA_DISTANCE, 0, 0),     // Left (-X)
  thinking: new THREE.Vector3(0, CAMERA_DISTANCE, 0),   // Top (+Y)
  building: new THREE.Vector3(0, -CAMERA_DISTANCE, 0),  // Bottom (-Y)
};

// Camera up vectors for each face (to avoid gimbal lock on top/bottom)
export const CAMERA_UP_VECTORS: Record<FaceId, THREE.Vector3> = {
  front: new THREE.Vector3(0, 1, 0),
  back: new THREE.Vector3(0, 1, 0),
  community: new THREE.Vector3(0, 1, 0),
  music: new THREE.Vector3(0, 1, 0),
  thinking: new THREE.Vector3(0, 0, -1),  // Looking down, "up" is -Z
  building: new THREE.Vector3(0, 0, 1),   // Looking up, "up" is +Z
};

// Initial cube rotation (radians) - tilted to show 3 faces
export const INITIAL_ROTATION: [number, number, number] = [-0.4, 0.5, 0];

// Auto-rotation configuration
export const AUTO_ROTATE_SPEED = 0.001;
export const IDLE_TIMEOUT = 3000; // ms before auto-rotation starts

// Drag configuration
export const DRAG_SENSITIVITY = 0.006;
export const MOMENTUM_FRICTION = 0.95;

// Double-click configuration
export const DOUBLE_CLICK_THRESHOLD = 300; // ms between clicks

// Animation duration (total for all phases)
export const ANIMATION_DURATION = 1800; // ms
