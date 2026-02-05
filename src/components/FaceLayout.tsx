"use client";

import { useEffect } from "react";
import { FaceId } from "@/lib/faces";
import { markFaceVisited } from "@/lib/visited-faces";
import { CubeNavProvider } from "@/components/cube";
import FaceNav from "./FaceNav";

interface FaceLayoutProps {
  faceId: FaceId;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function FaceLayout({ faceId, children, className = "", style }: FaceLayoutProps) {
  useEffect(() => {
    markFaceVisited(faceId);
  }, [faceId]);

  return (
    <CubeNavProvider currentFace={faceId}>
      <div className={`min-h-screen pt-20 ${className}`} style={style}>
        <FaceNav />
        {children}
      </div>
    </CubeNavProvider>
  );
}
