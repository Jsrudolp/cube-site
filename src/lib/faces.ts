export type FaceId = "front" | "music" | "building" | "community" | "thinking" | "back";

export interface FaceConfig {
  id: FaceId;
  route: string;
  label: string;
  title: string;
}

export const FACES: FaceConfig[] = [
  { id: "front", route: "/front", label: "Resume", title: "Front" },
  { id: "music", route: "/music", label: "Music", title: "Music" },
  { id: "building", route: "/building", label: "Building", title: "Building" },
  { id: "community", route: "/community", label: "Community", title: "Community" },
  { id: "thinking", route: "/thinking", label: "Thinking Tools", title: "Thinking" },
  { id: "back", route: "/back", label: "Personal", title: "Back" },
];

export const FACE_MAP = Object.fromEntries(
  FACES.map((f) => [f.id, f])
) as Record<FaceId, FaceConfig>;

// Maps FaceId to cube position description and Three.js face index
export const FACE_CUBE_POSITIONS: Record<FaceId, { position: string; index: number }> = {
  community: { position: "Right (+X)", index: 0 },
  music: { position: "Left (-X)", index: 1 },
  thinking: { position: "Top (+Y)", index: 2 },
  building: { position: "Bottom (-Y)", index: 3 },
  front: { position: "Front (+Z)", index: 4 },
  back: { position: "Back (-Z)", index: 5 },
};
