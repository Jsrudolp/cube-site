import { FaceId } from "./faces";

const STORAGE_KEY = "cube-visited-faces";

export function getVisitedFaces(): FaceId[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function markFaceVisited(faceId: FaceId): FaceId[] {
  const visited = getVisitedFaces();
  if (!visited.includes(faceId)) {
    visited.push(faceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
  }
  return visited;
}

export function getVisitedCount(): number {
  return getVisitedFaces().length;
}
