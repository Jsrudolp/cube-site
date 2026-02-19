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
  2. After 400ms → "open" phase: parent flattens, faces hinge open into T-shape
  3. Click/dismiss → "closing" phase: fade out (faces stay flat, don't re-fold)

  T-shape layout (no gaps — a true cube net):
            [thinking]
  [music]   [front]   [community]  [back]
            [building]

  Key: back face is nested inside a community wrapper <div> so that
  its fold transform composes with community's fold (both hinge in sequence
  to form the right side + back of the cube).
*/

const GAP = 0;

const FACE_BG: Record<FaceId, { color: string; extra?: React.CSSProperties }> = {
  front: { color: "#FFFFFF" },
  music: { color: "#100023" },
  building: { color: "#f5e6d3" },
  community: { color: "#FFFCF3" },
  thinking: {
    color: "#F5F5F5",
    extra: {
      backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    },
  },
  back: { color: "#1a1a1a" },
};

const DARK_FACES = new Set<FaceId>(["music", "back"]);

export default function CubeUnfold({ currentFaceId, onClose }: CubeUnfoldProps) {
  const [phase, setPhase] = useState<"cube" | "open" | "closing">("cube");
  const { switchToFace } = useCubeNav();

  // SIZE = 1 cell = 50vh / 3 rows, clamped to a sensible range
  const [SIZE, setSIZE] = useState(() =>
    typeof window !== "undefined" ? Math.floor(window.innerHeight * 0.5 / 3) : 160
  );
  useEffect(() => {
    const compute = () => setSIZE(Math.floor(window.innerHeight * 0.5 / 3));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  const CELL = SIZE + GAP;

  useEffect(() => {
    const id = setTimeout(() => setPhase("open"), 400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTimeout(() => {
      switchToFace(faceId);
    }, 300);
  };

  const flat = phase === "open" || phase === "closing";
  const closing = phase === "closing";

  const ease = "650ms cubic-bezier(0.4, 0, 0.2, 1)";
  const stagger = (ms: number) => `${flat ? ms : 0}ms`;

  const sceneTransform = flat
    ? "rotateX(0deg) rotateY(0deg)"
    : "rotateX(-25deg) rotateY(32deg)";

  function faceCard(id: FaceId, extraStyle?: React.CSSProperties) {
    const f = FACES.find((x) => x.id === id)!;
    const active = id === currentFaceId;
    const dark = DARK_FACES.has(id);
    const bg = FACE_BG[id];

    return (
      <button
        key={id}
        onClick={() => handleFaceClick(id)}
        className="absolute flex items-center justify-center cursor-pointer overflow-hidden group"
        style={{
          width: SIZE,
          height: SIZE,
          backfaceVisibility: "hidden",
          backgroundColor: bg.color,
          ...bg.extra,
          ...(id === "thinking" ? { backgroundSize: `${Math.round(SIZE / 6)}px ${Math.round(SIZE / 6)}px` } : {}),
          outline: active
            ? dark
              ? "2.5px solid rgba(255,255,255,0.5)"
              : "2.5px solid rgba(0,0,0,0.2)"
            : "1px solid rgba(150,150,150,0.4)",
          outlineOffset: active ? "-2.5px" : "-1px",
          ...extraStyle,
        }}
        title={f.label}
      >
        {/* Face icon — centered, not full-bleed */}
        <Image
          src={FACE_ICONS[id]}
          alt={f.label}
          width={Math.round(SIZE * 0.46)}
          height={Math.round(SIZE * 0.46)}
          className="object-contain transition-transform duration-200 ease-out group-hover:scale-[1.18]"
        />
        {/* Active dot */}
        {active && (
          <span
            className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${dark ? "bg-white/60" : "bg-black/25"}`}
          />
        )}
        {/* Hover overlay */}
        <span
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 ${
            dark ? "bg-white/[0.06]" : "bg-black/[0.03]"
          }`}
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
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          opacity: closing ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
        onClick={close}
      />

      {/* Perspective wrapper */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
      >
        {/* 3D scene */}
        <div
          className="pointer-events-auto relative"
          style={{
            width: CELL * 4,
            height: CELL * 3,
            transformStyle: "preserve-3d",
            transformOrigin: `${CELL + SIZE / 2}px ${CELL + SIZE / 2}px ${-SIZE / 2}px`,
            transform: closing
              ? `perspective(${SIZE * 10}px) ${sceneTransform} scale(0.94)`
              : `perspective(${SIZE * 10}px) ${sceneTransform}`,
            opacity: closing ? 0 : 1,
            transition: closing
              ? "transform 350ms ease, opacity 350ms ease"
              : "transform 650ms cubic-bezier(0.4, 0, 0.2, 1)",
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
            transform: flat ? "rotateX(0deg)" : "rotateX(90deg)",
            transition: `transform ${ease} ${stagger(150)}`,
          })}

          {/* Building — bottom, hinge: top edge */}
          {faceCard("building", {
            left: CELL,
            top: 2 * CELL,
            transformOrigin: "center 0px",
            transform: flat ? "rotateX(0deg)" : "rotateX(-90deg)",
            transition: `transform ${ease} ${stagger(150)}`,
          })}

          {/* Music — left, hinge: right edge */}
          {faceCard("music", {
            left: 0,
            top: CELL,
            transformOrigin: `${SIZE}px center`,
            transform: flat ? "rotateY(0deg)" : "rotateY(-90deg)",
            transition: `transform ${ease} ${stagger(250)}`,
          })}

          {/* Community + Back wrapper */}
          <div
            style={{
              position: "absolute",
              left: 2 * CELL,
              top: CELL,
              width: CELL + SIZE,
              height: SIZE,
              transformStyle: "preserve-3d",
              transformOrigin: "0px center",
              transform: flat ? "rotateY(0deg)" : "rotateY(90deg)",
              transition: `transform ${ease} ${stagger(250)}`,
            }}
          >
            {faceCard("community", { left: 0, top: 0 })}

            {faceCard("back", {
              left: CELL,
              top: 0,
              transformOrigin: "0px center",
              transform: flat ? "rotateY(0deg)" : "rotateY(90deg)",
              transition: `transform ${ease} ${stagger(380)}`,
            })}
          </div>
        </div>
      </div>
    </>
  );
}
