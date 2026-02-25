"use client";

import { useEffect } from "react";
import { FaceId } from "@/lib/faces";
import { markFaceVisited } from "@/lib/visited-faces";
import { usePersistentCube } from "@/components/cube";
import { setFavicon } from "@/lib/favicon";
import FaceNav from "./FaceNav";

interface FaceLayoutProps {
  faceId: FaceId;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function FaceLayout({ faceId, children, className = "", style }: FaceLayoutProps) {
  const { zoomingOut, faceContentHidden, setActiveFace } = usePersistentCube();

  useEffect(() => {
    markFaceVisited(faceId);
    setFavicon(faceId);
  }, [faceId]);

  // Tell the persistent cube we're on this face
  useEffect(() => {
    setActiveFace(faceId);
    return () => setActiveFace(null);
  }, [faceId, setActiveFace]);

  return (
    <div
      className={`min-h-screen pt-20 ${className}`}
      style={{
        ...style,
        position: "relative",
        opacity: zoomingOut || faceContentHidden ? 0 : 1,
        transition: zoomingOut ? "opacity 0.4s ease-out" : undefined,
        pointerEvents: zoomingOut || faceContentHidden ? "none" : "auto",
      }}
    >
      <FaceNav />
      {children}
    </div>
  );
}
