import type { FaceId } from "./faces";

const FACE_ICON_MAP: Record<FaceId, string> = {
  front: "/icons/face1.png",
  music: "/icons/face2.png",
  building: "/icons/face3.png",
  community: "/icons/face4.png",
  thinking: "/icons/face5.png",
  back: "/icons/face6.png",
};

export function setFavicon(faceId: FaceId) {
  if (typeof document === "undefined") return;
  const href = FACE_ICON_MAP[faceId];
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = href;
}
