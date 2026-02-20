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

// Colors for each face (used as placeholders/fallbacks — match actual page backgrounds)
export const FACE_COLORS: Record<FaceId, string> = {
  front: "#FFFFFF",     // white
  music: "#100023",     // dark purple (matches music page)
  building: "#f5e6d3",  // warm beige
  community: "#FFFAE8", // off-white (matches community page)
  thinking: "#F5F5F5",  // light gray (matches thinking page)
  back: "#1a1a1a",      // near-black (matches back page)
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

// Canonical quaternions - identity for all faces.
// The squared camera positions already sit along each face's natural axis
// (community → +X, music → -X, etc.), so each face's local normal already
// points toward its camera in the default (identity) orientation.
// The previous non-identity values were designed for the CSS cube (fixed +Z
// viewer) and caused the wrong face to appear during the Three.js animation.
export const CANONICAL_QUATERNIONS: Record<FaceId, THREE.Quaternion> = {
  front: new THREE.Quaternion(),
  back: new THREE.Quaternion(),
  community: new THREE.Quaternion(),
  music: new THREE.Quaternion(),
  thinking: new THREE.Quaternion(),
  building: new THREE.Quaternion(),
};

// Local "up" direction for each face's content in the cube's canonical orientation.
// Used to compute the roll correction so face content appears right-side-up.
export const FACE_LOCAL_UP: Record<FaceId, THREE.Vector3> = {
  front: new THREE.Vector3(0, 1, 0),
  back: new THREE.Vector3(0, 1, 0),
  community: new THREE.Vector3(0, 1, 0),
  music: new THREE.Vector3(0, 1, 0),
  thinking: new THREE.Vector3(0, 0, -1),
  building: new THREE.Vector3(0, 0, 1),
};

// Camera configuration
export const CAMERA_POSITION: [number, number, number] = [3, 2, 4];
export const CAMERA_FOV = 50;

// Direction from origin toward the default camera
const CAMERA_VEC = new THREE.Vector3(...CAMERA_POSITION);
const CAMERA_DIR = CAMERA_VEC.clone().normalize();

/**
 * Compute a quaternion that aligns a face's normal with the camera direction
 * AND corrects roll so the face content appears right-side-up on screen.
 */
export function computeUprightQuat(faceId: FaceId): THREE.Quaternion {
  // Step 1: align face normal with camera direction
  const rotateQuat = new THREE.Quaternion().setFromUnitVectors(
    FACE_NORMALS[faceId].clone(),
    CAMERA_DIR
  );

  // Step 2: roll correction — project the face's local up (after rotation)
  // and the screen up onto the plane perpendicular to CAMERA_DIR, then
  // compute the rotation around CAMERA_DIR that aligns them.
  const faceUpAfterRotate = FACE_LOCAL_UP[faceId].clone().applyQuaternion(rotateQuat);
  const screenUp = new THREE.Vector3(0, 1, 0);
  const desiredUp = screenUp.clone()
    .sub(CAMERA_DIR.clone().multiplyScalar(screenUp.dot(CAMERA_DIR)))
    .normalize();
  const currentUp = faceUpAfterRotate.clone()
    .sub(CAMERA_DIR.clone().multiplyScalar(faceUpAfterRotate.dot(CAMERA_DIR)))
    .normalize();
  const rollQuat = new THREE.Quaternion().setFromUnitVectors(currentUp, desiredUp);

  return rollQuat.clone().multiply(rotateQuat);
}

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
export const AUTO_ROTATE_SPEED = 0.0007;
export const IDLE_TIMEOUT = 3000; // ms before auto-rotation starts

// Drag configuration
export const DRAG_SENSITIVITY = 0.002;
export const MOMENTUM_FRICTION = 0.95;

// Double-click configuration
export const DOUBLE_CLICK_THRESHOLD = 300; // ms between clicks

// Animation duration (total for all phases)
export const ANIMATION_DURATION = 1800; // ms
