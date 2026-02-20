import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import { FACE_INDEX_TO_ID, FACE_COLORS } from "@/lib/cube-config";

// Create a solid-color placeholder texture
export function createPlaceholderTexture(_faceId: FaceId, color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Create all placeholder textures
export function createAllPlaceholderTextures(): THREE.CanvasTexture[] {
  return FACE_INDEX_TO_ID.map((faceId) =>
    createPlaceholderTexture(faceId, FACE_COLORS[faceId])
  );
}

// Create materials from textures
export function createMaterials(textures: THREE.Texture[]): THREE.MeshBasicMaterial[] {
  return textures.map(
    (texture) =>
      new THREE.MeshBasicMaterial({ map: texture })
  );
}
