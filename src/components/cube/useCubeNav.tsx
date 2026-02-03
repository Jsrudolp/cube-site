"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FaceId } from "@/lib/faces";
import { CubeOverlay } from "./CubeOverlay";

interface CubeNavContextValue {
  zoomOut: () => void;
  switchToFace: (faceId: FaceId) => void;
  isTransitioning: boolean;
}

const CubeNavContext = createContext<CubeNavContextValue | null>(null);

interface CubeNavProviderProps {
  children: ReactNode;
  currentFace: FaceId;
  animationDuration?: number;
}

export function CubeNavProvider({
  children,
  currentFace,
  animationDuration = 1800,
}: CubeNavProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMode, setTransitionMode] = useState<"zoom-out" | "switch-face">("zoom-out");
  const [targetFace, setTargetFace] = useState<FaceId | null>(null);

  const zoomOut = useCallback(() => {
    setTransitionMode("zoom-out");
    setTargetFace(null);
    setIsTransitioning(true);
  }, []);

  const switchToFace = useCallback((faceId: FaceId) => {
    if (faceId === currentFace) return;
    setTransitionMode("switch-face");
    setTargetFace(faceId);
    setIsTransitioning(true);
  }, [currentFace]);

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
    setTargetFace(null);
  }, []);

  return (
    <CubeNavContext.Provider value={{ zoomOut, switchToFace, isTransitioning }}>
      {children}
      {isTransitioning && (
        <CubeOverlay
          currentFace={currentFace}
          targetFace={targetFace}
          onTransitionComplete={handleTransitionComplete}
          mode={transitionMode}
          animationDuration={animationDuration}
        />
      )}
    </CubeNavContext.Provider>
  );
}

export function useCubeNav() {
  const context = useContext(CubeNavContext);
  if (!context) {
    throw new Error("useCubeNav must be used within CubeNavProvider");
  }
  return context;
}
