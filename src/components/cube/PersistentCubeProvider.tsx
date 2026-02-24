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
  // Saved cube state from zoom-out animation — persists across child remounts.
  // Used to restore the cube orientation if the component re-initializes.
  const savedCubeStateRef = useRef<{
    quaternion: [number, number, number, number];
    cameraPosition: [number, number, number];
  } | null>(null);

  // Dynamic textures — loaded once, persist across navigations
  const [isIframe, setIsIframe] = useState(true); // default true to skip on SSR
  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);
  const { textures: dynamicTextures } = useDynamicTextures(isIframe);

  const interactive = !activeFace && !zoomingOut && !isTransitioning;

  // Hide the cube when sitting on a face page (not animating).
  // It only needs to be visible on the home page or during zoom animations.
  const cubeVisible = !activeFace || zoomingOut || isTransitioning;

  // Handle zoom-in completion — navigate to face route (normal zoom-in from home)
  const handleZoomComplete = useCallback(
    (faceId: FaceId) => {
      const face = FACE_MAP[faceId];
      if (!face) return;
      savedCubeStateRef.current = null; // Clear stale restore state
      router.push(face.route);
    },
    [router]
  );

  // Handle switch animation completion — navigate to target face and clean up state.
  const handleSwitchComplete = useCallback(
    (faceId: FaceId) => {
      const face = FACE_MAP[faceId];
      if (!face) return;
      // Clean up transition state so the cube hides once the face page mounts.
      // We keep isTransitioning true briefly so the cube stays visible during navigation.
      setSwitchTarget(null);
      setZoomingOut(false);
      router.push(face.route);
    },
    [router]
  );

  // Handle zoom-out from a face page
  const zoomOut = useCallback(() => {
    setZoomingOut(true);
  }, []);

  // Ref to read isTransitioning inside callbacks without stale closures
  const isTransitioningRef = useRef(isTransitioning);
  isTransitioningRef.current = isTransitioning;

  // Zoom-out animation finished (normal zoom-out only — switches use handleSwitchComplete)
  const handleZoomOutComplete = useCallback((state?: {
    quaternion: [number, number, number, number];
    cameraPosition: [number, number, number];
  }) => {
    if (state) {
      savedCubeStateRef.current = state;
    }
    setZoomingOut(false);
    setActiveFace(null);
    setFaceContentHidden(true);
    // Defer URL change so Next.js's pushState interception doesn't trigger
    // synchronous React work that could disrupt the cube's final orientation.
    requestAnimationFrame(() => {
      window.history.pushState(null, "", "/");
    });
  }, []);

  // When a face page mounts (zoom-in navigation lands), reset hidden flag.
  // Ignores cleanup null calls during face switches to prevent brief rotation resets.
  const handleSetActiveFace = useCallback((face: FaceId | null) => {
    if (face === null && isTransitioningRef.current) return;
    setActiveFace(face);
    if (face !== null) {
      setFaceContentHidden(false);
      // Final cleanup for switch transitions — cube can now hide
      if (isTransitioningRef.current) {
        setIsTransitioning(false);
      }
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
          style={{
            zIndex: 0,
            background: "#EDEDED",
            visibility: cubeVisible ? "visible" : "hidden",
          }}
        >
          <CubeScene
            dynamicTextures={dynamicTextures}
            disabled={!interactive}
            onZoomComplete={handleZoomComplete}
            onZoomOutComplete={handleZoomOutComplete}
            onSwitchComplete={handleSwitchComplete}
            initialZoomedFace={activeFace ?? undefined}
            zoomOutFromFace={zoomingOut ? (activeFace ?? undefined) : undefined}
            switchToFace={isTransitioning && zoomingOut ? (switchTarget ?? undefined) : undefined}
            restoreState={savedCubeStateRef.current ?? undefined}
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
