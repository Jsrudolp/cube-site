"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FACES, FaceId } from "@/lib/faces";
import { CubeIcon, ZoomOutIcon } from "@/components/icons/FaceIcons";
import { useCubeNav } from "@/components/cube";
import CubeUnfold from "@/components/CubeUnfold";

// Map face IDs to their icon files
export const FACE_ICONS: Record<FaceId, string> = {
  front: "/icons/face1.png",
  music: "/icons/face2.png",
  building: "/icons/face3.png",
  community: "/icons/face4.png",
  thinking: "/icons/face5.png",
  back: "/icons/face6.png",
};

export default function FaceNav() {
  const pathname = usePathname();
  const [unfoldOpen, setUnfoldOpen] = useState(false);
  const { zoomOut } = useCubeNav();

  // Don't render nav on the home/cube page
  if (pathname === "/") return null;

  const currentFace = FACES.find((f) => pathname.startsWith(f.route));
  const currentFaceId = currentFace?.id as FaceId | undefined;

  const handleZoomOut = () => {
    zoomOut();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        {/* Left: Current face icon only */}
        <div className="flex items-center">
          {currentFaceId && (
            <div
              className="flex items-center justify-center w-10 h-10"
              title={currentFace?.label}
            >
              <Image
                src={FACE_ICONS[currentFaceId]}
                alt={currentFace?.label || ""}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {/* Right: Cube unfold + Zoom out */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnfoldOpen(!unfoldOpen)}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              unfoldOpen
                ? "bg-foreground text-background"
                : "bg-foreground/10 hover:bg-foreground/20"
            }`}
            title="Navigate faces"
            aria-label="Open cube navigation"
          >
            <CubeIcon size={20} />
          </button>

          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            title="Zoom out to cube"
          >
            <ZoomOutIcon size={20} />
          </button>
        </div>
      </nav>

      {/* Animated cube unfold */}
      {unfoldOpen && (
        <CubeUnfold
          currentFaceId={currentFaceId}
          onClose={() => setUnfoldOpen(false)}
        />
      )}
    </>
  );
}
