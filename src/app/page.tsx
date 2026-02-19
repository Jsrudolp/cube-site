"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CubeScene, CubeHud } from "@/components/cube";
import { FaceId, FACES } from "@/lib/faces";

const VALID_FACE_IDS = FACES.map(f => f.id);

const ANIMATION_DURATION = 1800;

function HomeContent() {
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const initialFace = fromParam && VALID_FACE_IDS.includes(fromParam as FaceId)
    ? (fromParam as FaceId)
    : undefined;

  return (
    <div className="min-h-screen bg-[#e5e5e0]">
      <div className="fixed inset-0">
        <CubeScene
          animationDuration={ANIMATION_DURATION}
          initialFace={initialFace}
        />
      </div>

      <CubeHud />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e5e5e0]" />}>
      <HomeContent />
    </Suspense>
  );
}
