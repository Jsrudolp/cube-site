"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CubeScene, CubeHud } from "@/components/cube";
import { useDynamicTextures } from "@/components/cube/hooks/useDynamicTextures";
import { FaceId, FACES, FACE_MAP } from "@/lib/faces";

const VALID_FACE_IDS = FACES.map(f => f.id);
const ANIMATION_DURATION = 1800;

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromParam = searchParams.get("from");
  const initialFace = fromParam && VALID_FACE_IDS.includes(fromParam as FaceId)
    ? (fromParam as FaceId)
    : undefined;

  const { textures: dynamicTextures } = useDynamicTextures();

  const handleZoomComplete = useCallback((faceId: FaceId) => {
    const face = FACE_MAP[faceId];
    if (face) router.push(face.route);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#EDEDED]">
      <div className="fixed inset-0">
        <CubeScene
          animationDuration={ANIMATION_DURATION}
          initialFace={initialFace}
          onZoomComplete={handleZoomComplete}
          dynamicTextures={dynamicTextures}
        />
      </div>

      <CubeHud />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDEDED]" />}>
      <HomeContent />
    </Suspense>
  );
}
