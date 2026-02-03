"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { FaceId } from "./faces";

export type TransitionPhase =
  | "idle"           // Normal state, cube visible
  | "rotating"       // Rotating to center a face
  | "zooming-in"     // Zooming into a face
  | "zoomed"         // Fully zoomed, showing page
  | "zooming-out"    // Zooming out from a page
  | "switching";     // Switching between faces (zoom out → rotate → zoom in)

export interface TransitionState {
  phase: TransitionPhase;
  targetFace: FaceId | null;
  fromFace: FaceId | null;
  progress: number; // 0-1 for current phase
}

interface CubeTransitionContextValue {
  state: TransitionState;
  // Start zoom-in transition to a face
  zoomToFace: (faceId: FaceId) => void;
  // Start zoom-out transition from current face
  zoomOut: () => void;
  // Switch from one face to another (zoom out, rotate, zoom in)
  switchToFace: (faceId: FaceId) => void;
  // Update progress (called by animation)
  setProgress: (progress: number) => void;
  // Move to next phase
  advancePhase: () => void;
  // Complete transition
  completeTransition: () => void;
  // Current face we're viewing (when zoomed)
  currentFace: FaceId | null;
  // Set current face
  setCurrentFace: (faceId: FaceId | null) => void;
}

const CubeTransitionContext = createContext<CubeTransitionContextValue | null>(null);

export function CubeTransitionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransitionState>({
    phase: "idle",
    targetFace: null,
    fromFace: null,
    progress: 0,
  });
  const [currentFace, setCurrentFace] = useState<FaceId | null>(null);

  const zoomToFace = useCallback((faceId: FaceId) => {
    setState({
      phase: "rotating",
      targetFace: faceId,
      fromFace: null,
      progress: 0,
    });
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({
      phase: "zooming-out",
      targetFace: null,
      fromFace: currentFace,
      progress: 0,
    }));
  }, [currentFace]);

  const switchToFace = useCallback((faceId: FaceId) => {
    if (currentFace === faceId) return;
    setState({
      phase: "zooming-out",
      targetFace: faceId,
      fromFace: currentFace,
      progress: 0,
    });
  }, [currentFace]);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const advancePhase = useCallback(() => {
    setState(prev => {
      const { phase, targetFace, fromFace } = prev;

      if (phase === "rotating") {
        return { ...prev, phase: "zooming-in", progress: 0 };
      }
      if (phase === "zooming-in") {
        return { ...prev, phase: "zoomed", progress: 1 };
      }
      if (phase === "zooming-out") {
        // If we have a target, rotate to it; otherwise go to idle
        if (targetFace) {
          return { ...prev, phase: "rotating", progress: 0 };
        }
        return { ...prev, phase: "idle", progress: 0, fromFace: null };
      }
      return prev;
    });
  }, []);

  const completeTransition = useCallback(() => {
    setState(prev => {
      if (prev.targetFace) {
        setCurrentFace(prev.targetFace);
      } else {
        setCurrentFace(null);
      }
      return {
        phase: prev.phase === "zooming-out" && !prev.targetFace ? "idle" : "zoomed",
        targetFace: null,
        fromFace: null,
        progress: 0,
      };
    });
  }, []);

  return (
    <CubeTransitionContext.Provider
      value={{
        state,
        zoomToFace,
        zoomOut,
        switchToFace,
        setProgress,
        advancePhase,
        completeTransition,
        currentFace,
        setCurrentFace,
      }}
    >
      {children}
    </CubeTransitionContext.Provider>
  );
}

export function useCubeTransition() {
  const context = useContext(CubeTransitionContext);
  if (!context) {
    throw new Error("useCubeTransition must be used within CubeTransitionProvider");
  }
  return context;
}
