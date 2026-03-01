import type { FaceId } from "./faces";

const FACE_ICON_MAP: Record<FaceId, string> = {
  front: "/icons/face1.png",
  music: "/icons/face2.png",
  building: "/icons/face3.png",
  community: "/icons/face4.png",
  thinking: "/icons/face5.png",
  back: "/icons/face6.png",
};

const FACES_WITH_BG = new Set<FaceId>(["front"]);
const FAVICON_BG: Partial<Record<FaceId, string>> = {
  front: "#ffffff",
};

function withBackground(href: string, bg: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 64;
      canvas.height = img.height || 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(href); // fallback to original
    img.src = href;
  });
}

export async function setFavicon(faceId: FaceId) {
  if (typeof document === "undefined") return;
  const href = FACE_ICON_MAP[faceId];
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  if (FACES_WITH_BG.has(faceId)) {
    link.href = await withBackground(href, FAVICON_BG[faceId]!);
  } else {
    link.href = href;
  }
}
