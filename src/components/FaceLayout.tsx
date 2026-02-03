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
}

export default function FaceLayout({ faceId, children, className = "" }: FaceLayoutProps) {
  useEffect(() => {
    markFaceVisited(faceId);
  }, [faceId]);

  return (
    <CubeNavProvider currentFace={faceId}>
      <div className={`min-h-screen pt-20 ${className}`}>
        <FaceNav />
        {children}
      </div>
    </CubeNavProvider>
  );
}
