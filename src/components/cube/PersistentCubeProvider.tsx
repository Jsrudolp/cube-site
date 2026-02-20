"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { FaceId, FACE_MAP } from "@/lib/faces";
import { CubeScene } from "./CubeScene";
import { CubeOverlay } from "./CubeOverlay";
import { useDynamicTextures } from "./hooks/useDynamicTextures";

interface PersistentCubeContextValue {
  zoomOut: () => void;
  switchToFace: (faceId: FaceId) => void;
  isTransitioning: boolean;
  zoomingOut: boolean;
  // True after zoom-out completes — keeps face content hidden without navigating
  faceContentHidden: boolean;
  setActiveFace: (faceId: FaceId | null) => void;
}

const PersistentCubeContext = createContext<PersistentCubeContextValue | null>(null);

export function PersistentCubeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [activeFace, setActiveFace] = useState<FaceId | null>(null);
  const [zoomingOut, setZoomingOut] = useState(false);
  const [faceContentHidden, setFaceContentHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [switchTarget, setSwitchTarget] = useState<FaceId | null>(null);

  // Dynamic textures — loaded once, persist across navigations
  const [isIframe, setIsIframe] = useState(true); // default true to skip on SSR
  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);
  const { textures: dynamicTextures } = useDynamicTextures(isIframe);

  const interactive = !activeFace && !zoomingOut;

  // Handle zoom-in completion on home page — navigate to face route
  const handleZoomComplete = useCallback(
    (faceId: FaceId) => {
      const face = FACE_MAP[faceId];
      if (face) router.push(face.route);
    },
    [router]
  );

  // Handle zoom-out from a face page
  const zoomOut = useCallback(() => {
    setZoomingOut(true);
  }, []);

  // Zoom-out animation finished.
  // NO router.push — just update URL and flip state. No flash.
  const handleZoomOutComplete = useCallback(() => {
    setZoomingOut(false);
    setFaceContentHidden(true);
    setActiveFace(null);
    window.history.pushState(null, "", "/");
  }, []);

  // When a face page mounts (zoom-in navigation lands), reset hidden flag
  const handleSetActiveFace = useCallback((face: FaceId | null) => {
    setActiveFace(face);
    if (face !== null) {
      setFaceContentHidden(false);
    }
  }, []);

  // Switch face (overlay-based)
  const switchToFace = useCallback(
    (faceId: FaceId) => {
      if (faceId === activeFace) return;
      setSwitchTarget(faceId);
      setIsTransitioning(true);
    },
    [activeFace]
  );

  const handleSwitchComplete = useCallback(() => {
    setIsTransitioning(false);
    setSwitchTarget(null);
  }, []);

  return (
    <PersistentCubeContext.Provider
      value={{
        zoomOut,
        switchToFace,
        isTransitioning,
        zoomingOut,
        faceContentHidden,
        setActiveFace: handleSetActiveFace,
      }}
    >
      {/* Persistent cube layer — always mounted, behind everything */}
      {!isIframe && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 0, background: "#EDEDED" }}
        >
          <CubeScene
            dynamicTextures={dynamicTextures}
            disabled={!interactive}
            onZoomComplete={handleZoomComplete}
            initialZoomedFace={activeFace ?? undefined}
            zoomOutFromFace={zoomingOut ? (activeFace ?? undefined) : undefined}
            onZoomOutComplete={handleZoomOutComplete}
          />
        </div>
      )}

      {/* Page content on top — pass through pointer events on home */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          pointerEvents: activeFace && !faceContentHidden ? "auto" : "none",
        }}
      >
        {children}
      </div>

      {/* Switch-face overlay */}
      {isTransitioning && switchTarget && activeFace && (
        <CubeOverlay
          currentFace={activeFace}
          targetFace={switchTarget}
          onTransitionComplete={handleSwitchComplete}
          animationDuration={1800}
        />
      )}
    </PersistentCubeContext.Provider>
  );
}

export function usePersistentCube() {
  const context = useContext(PersistentCubeContext);
  if (!context) {
    throw new Error("usePersistentCube must be used within PersistentCubeProvider");
  }
  return context;
}
