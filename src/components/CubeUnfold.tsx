"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FACES, FaceId } from "@/lib/faces";
import { useCubeNav } from "@/components/cube";
import { FACE_ICONS } from "@/components/FaceNav";

interface CubeUnfoldProps {
  currentFaceId?: FaceId;
  onClose: () => void;
}

/*
  Animation flow:
  1. Mount → "cube" phase: faces are folded into a 3D cube, parent is tilted
  2. After 900ms → "open" phase: parent flattens, faces hinge open into T-shape
  3. Click/dismiss → "closing" phase: fade out (faces stay flat, don't re-fold)

  T-shape layout:
            [thinking]
  [music]   [front]   [community]  [back]
            [building]

  Key: back face is nested inside a community wrapper <div> so that
  its fold transform composes with community's fold (both hinge in sequence
  to form the right side + back of the cube).
*/

const SIZE = 72;
const GAP = 4;
const CELL = SIZE + GAP;

export default function CubeUnfold({ currentFaceId, onClose }: CubeUnfoldProps) {
  const [phase, setPhase] = useState<"cube" | "open" | "closing">("cube");
  const { switchToFace } = useCubeNav();

  useEffect(() => {
    const id = setTimeout(() => setPhase("open"), 900);
    return () => clearTimeout(id);
  }, []);

  const close = () => {
    setPhase("closing");
    setTimeout(onClose, 500);
  };

  const handleFaceClick = (faceId: FaceId) => {
    if (faceId === currentFaceId) {
      close();
      return;
    }
    close();
    // Small delay to let the unfold close, then trigger cube transition
    setTimeout(() => {
      switchToFace(faceId);
    }, 300);
  };

  // Faces stay flat when open OR closing (don't re-fold on dismiss)
  const flat = phase === "open" || phase === "closing";
  const closing = phase === "closing";

  const ease = "650ms cubic-bezier(0.4, 0, 0.2, 1)";
  const stagger = (ms: number) => `${flat ? ms : 0}ms`;

  // 3D scene: tilted to show cube depth, flattened when open
  const sceneTransform = flat
    ? "rotateX(0deg) rotateY(0deg)"
    : "rotateX(-25deg) rotateY(32deg)";

  function faceCard(id: FaceId, extraStyle?: React.CSSProperties) {
    const f = FACES.find((x) => x.id === id)!;
    const active = id === currentFaceId;
    return (
      <button
        key={id}
        onClick={() => handleFaceClick(id)}
        className={`absolute flex items-center justify-center rounded-xl cursor-pointer overflow-hidden ${
          active
            ? "ring-2 ring-foreground shadow-lg"
            : "shadow-md border border-foreground/10 hover:shadow-lg"
        }`}
        style={{
          width: SIZE,
          height: SIZE,
          backfaceVisibility: "hidden",
          ...extraStyle,
        }}
        title={f.label}
      >
        <Image
          src={FACE_ICONS[id]}
          alt={f.label}
          width={SIZE}
          height={SIZE}
          className="object-cover w-full h-full"
        />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        style={{
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: closing ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
        onClick={close}
      />

      {/* Perspective wrapper */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
        style={{ perspective: "900px" }}
      >
        {/* 3D scene */}
        <div
          className="pointer-events-auto relative"
          style={{
            width: CELL * 4,
            height: CELL * 3,
            transformStyle: "preserve-3d",
            transform: closing ? `${sceneTransform} scale(0.92)` : sceneTransform,
            opacity: closing ? 0 : 1,
            transition: closing
              ? "transform 400ms ease, opacity 400ms ease"
              : "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Front — center of T, no fold */}
          {faceCard("front", {
            left: CELL,
            top: CELL,
            transform: "translateZ(1px)",
            zIndex: 1,
          })}

          {/* Thinking — top, hinge: bottom edge */}
          {faceCard("thinking", {
            left: CELL,
            top: 0,
            transformOrigin: `center ${SIZE}px`,
            transform: flat ? "rotateX(0deg)" : "rotateX(-90deg)",
            transition: `transform ${ease} ${stagger(150)}`,
          })}

          {/* Building — bottom, hinge: top edge */}
          {faceCard("building", {
            left: CELL,
            top: 2 * CELL,
            transformOrigin: "center 0px",
            transform: flat ? "rotateX(0deg)" : "rotateX(90deg)",
            transition: `transform ${ease} ${stagger(150)}`,
          })}

          {/* Music — left, hinge: right edge */}
          {faceCard("music", {
            left: 0,
            top: CELL,
            transformOrigin: `${SIZE}px center`,
            transform: flat ? "rotateY(0deg)" : "rotateY(90deg)",
            transition: `transform ${ease} ${stagger(250)}`,
          })}

          {/* Community + Back wrapper.
              The wrapper folds as one unit from front's right edge.
              Inside, Back has its own nested fold from Community's right edge.
              This nesting is required so Back's fold composes with Community's
              fold to form the back of the cube. */}
          <div
            style={{
              position: "absolute",
              left: 2 * CELL,
              top: CELL,
              width: CELL + SIZE,
              height: SIZE,
              transformStyle: "preserve-3d",
              transformOrigin: "0px center",
              transform: flat ? "rotateY(0deg)" : "rotateY(-90deg)",
              transition: `transform ${ease} ${stagger(250)}`,
            }}
          >
            {faceCard("community", { left: 0, top: 0 })}

            {faceCard("back", {
              left: CELL,
              top: 0,
              transformOrigin: "0px center",
              transform: flat ? "rotateY(0deg)" : "rotateY(-90deg)",
              transition: `transform ${ease} ${stagger(380)}`,
            })}
          </div>
        </div>
      </div>
    </>
  );
}
