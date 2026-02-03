import * as THREE from "three";
import { FaceId } from "@/lib/faces";
import { FACE_INDEX_TO_ID, FACE_COLORS } from "@/lib/cube-config";

// Create a canvas-based placeholder texture with label
export function createPlaceholderTexture(faceId: FaceId, color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  // Add label
  ctx.fillStyle = color === "#000000" || color === "#1a1a2e" ? "#ffffff" : "#333333";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(faceId.toUpperCase(), 256, 256);

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

// Load textures with fallback to placeholders
export async function loadTexturesWithFallback(
  placeholders: THREE.Texture[]
): Promise<THREE.Texture[]> {
  const loader = new THREE.TextureLoader();
  const texturePaths = FACE_INDEX_TO_ID.map(
    (faceId) => `/face-textures/${faceId}.png`
  );

  return Promise.all(
    texturePaths.map(
      (path, index) =>
        new Promise<THREE.Texture>((resolve) => {
          loader.load(
            path,
            (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              resolve(texture);
            },
            undefined,
            () => {
              // On error, use placeholder
              resolve(placeholders[index]);
            }
          );
        })
    )
  );
}

// Create materials from textures
export function createMaterials(textures: THREE.Texture[]): THREE.MeshStandardMaterial[] {
  return textures.map(
    (texture) =>
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.1,
      })
  );
}
