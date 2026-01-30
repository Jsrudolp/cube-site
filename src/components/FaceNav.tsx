"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FACES, FaceId } from "@/lib/faces";
import { FaceIcon, CubeIcon, ZoomOutIcon } from "@/components/icons/FaceIcons";
import CubeUnfold from "@/components/CubeUnfold";

export default function FaceNav() {
  const pathname = usePathname();
  const [unfoldOpen, setUnfoldOpen] = useState(false);

  // Don't render nav on the home/cube page
  if (pathname === "/") return null;

  const currentFace = FACES.find((f) => pathname.startsWith(f.route));
  const currentFaceId = currentFace?.id as FaceId | undefined;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
        {/* Left: Current face icon */}
        <div className="flex items-center">
          {currentFaceId && (
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10"
              title={currentFace?.label}
            >
              <FaceIcon faceId={currentFaceId} size={20} />
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

          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            title="Zoom out to cube"
          >
            <ZoomOutIcon size={20} />
          </Link>
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
