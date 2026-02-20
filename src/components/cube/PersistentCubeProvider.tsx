"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { FaceId, FACE_MAP } from "@/lib/faces";
import { CubeScene } from "./CubeScene";
import { useDynamicTextures } from "./hooks/useDynamicTextures";

interface PersistentCubeContextValue {
  zoomOut: () => void;
  switchToFace: (faceId: FaceId) => void;
  isTransitioning: boolean;
  zoomingOut: boolean;
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
  // Face to zoom into (set after zoom-out completes during a switch)
  const [pendingZoomIn, setPendingZoomIn] = useState<FaceId | null>(null);

  // Dynamic textures — loaded once, persist across navigations
  const [isIframe, setIsIframe] = useState(true); // default true to skip on SSR
  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);
  const { textures: dynamicTextures } = useDynamicTextures(isIframe);

  const interactive = !activeFace && !zoomingOut && !isTransitioning;

  // Handle zoom-in completion — navigate to face route
  const handleZoomComplete = useCallback(
    (faceId: FaceId) => {
      const face = FACE_MAP[faceId];
      if (!face) return;

      if (isTransitioning) {
        // Switch-face zoom-in finished — navigate and clean up
        router.push(face.route);
        setIsTransitioning(false);
        setSwitchTarget(null);
        setPendingZoomIn(null);
      } else {
        // Normal zoom-in from home
        router.push(face.route);
      }
    },
    [router, isTransitioning]
  );

  // Handle zoom-out from a face page
  const zoomOut = useCallback(() => {
    setZoomingOut(true);
  }, []);

  // Refs to read state inside callbacks without stale closures
  const switchTargetRef = useRef(switchTarget);
  switchTargetRef.current = switchTarget;
  const isTransitioningRef = useRef(isTransitioning);
  isTransitioningRef.current = isTransitioning;

  // Zoom-out animation finished
  const handleZoomOutComplete = useCallback(() => {
    setZoomingOut(false);

    const target = switchTargetRef.current;
    if (target) {
      // Switch-face: keep activeFace (don't clear it — avoids rotation reset).
      // Chain into zoom-in to the target face.
      setPendingZoomIn(target);
    } else {
      // Normal zoom-out: go home
      setActiveFace(null);
      setFaceContentHidden(true);
      window.history.pushState(null, "", "/");
    }
  }, []);

  // When a face page mounts (zoom-in navigation lands), reset hidden flag.
  // Ignores cleanup null calls during face switches to prevent brief rotation resets.
  const handleSetActiveFace = useCallback((face: FaceId | null) => {
    if (face === null && isTransitioningRef.current) return;
    setActiveFace(face);
    if (face !== null) {
      setFaceContentHidden(false);
    }
  }, []);

  // Switch face: zoom out from current, then zoom in to target (on persistent cube)
  const switchToFace = useCallback(
    (faceId: FaceId) => {
      if (faceId === activeFace) return;
      setSwitchTarget(faceId);
      setIsTransitioning(true);
      setFaceContentHidden(true);
      setZoomingOut(true);
    },
    [activeFace]
  );

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
            zoomInToFace={pendingZoomIn ?? undefined}
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
