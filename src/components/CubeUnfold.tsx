"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FACES, FaceId } from "@/lib/faces";
import { usePersistentCube } from "@/components/cube";
import { FACE_ICONS } from "@/components/FaceNav";

interface CubeUnfoldProps {
  currentFaceId?: FaceId;
  onClose: () => void;
}

/*
  Animation flow:
  1. Mount → "cube" phase: faces are folded into a 3D cube, parent is tilted
  2. After 400ms → "open" phase: parent flattens, faces hinge open into net shape
  3. Click/dismiss → "closing" phase: fade out

  LANDSCAPE net (4 wide × 3 tall):
            [thinking]
  [music]   [front]   [community]  [back]
            [building]

  PORTRAIT net (3 wide × 4 tall):
            [thinking]
  [music]   [front]   [community]
            [building]
               [back]

  In portrait, back chains to building (vertical fold) instead of to community (horizontal fold).
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

function computeLayout(): { size: number; portrait: boolean } {
  const portrait = window.innerWidth < window.innerHeight;
  const size = portrait
    ? Math.min(
        Math.floor((window.innerHeight * 0.75) / 4), // 4 rows in ~75vh
        Math.floor(window.innerWidth / 3.2)           // 3 cols fit in viewport
      )
    : Math.min(
        Math.floor((window.innerHeight * 0.5) / 3),  // 3 rows in ~50vh
        Math.floor(window.innerWidth / 4.2)           // 4 cols fit in viewport
      );
  return { size, portrait };
}

export default function CubeUnfold({ currentFaceId, onClose }: CubeUnfoldProps) {
  const [phase, setPhase] = useState<"cube" | "open" | "closing">("cube");
  const { switchToFace } = usePersistentCube();

  const [{ size: SIZE, portrait }, setLayout] = useState<{ size: number; portrait: boolean }>(() =>
    typeof window !== "undefined" ? computeLayout() : { size: 160, portrait: false }
  );

  useEffect(() => {
    const compute = () => setLayout(computeLayout());
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
        <Image
          src={FACE_ICONS[id]}
          alt={f.label}
          width={Math.round(SIZE * 0.46)}
          height={Math.round(SIZE * 0.46)}
          className="object-contain transition-transform duration-200 ease-out group-hover:scale-[1.18]"
        />
        {active && (
          <span
            className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${dark ? "bg-white/60" : "bg-black/25"}`}
          />
        )}
        <span
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 ${
            dark ? "bg-white/[0.06]" : "bg-black/[0.03]"
          }`}
        />
      </button>
    );
  }

  // Scene is always centered on the front face (which sits at CELL, CELL in both layouts)
  const sceneW = portrait ? CELL * 3 : CELL * 4;
  const sceneH = portrait ? CELL * 4 : CELL * 3;

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
      <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
        {/* 3D scene */}
        <div
          className="pointer-events-auto relative"
          style={{
            width: sceneW,
            height: sceneH,
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
          {/* Front — center of net, no fold (both layouts) */}
          {faceCard("front", {
            left: CELL,
            top: CELL,
            transform: "translateZ(1px)",
            zIndex: 1,
          })}

          {/* Thinking — above front, hinge on bottom edge (both layouts) */}
          {faceCard("thinking", {
            left: CELL,
            top: 0,
            transformOrigin: `center ${SIZE}px`,
            transform: flat ? "rotateX(0deg)" : "rotateX(90deg)",
            transition: `transform ${ease} ${stagger(150)}`,
          })}

          {/* Music — left of front, hinge on right edge (both layouts) */}
          {faceCard("music", {
            left: 0,
            top: CELL,
            transformOrigin: `${SIZE}px center`,
            transform: flat ? "rotateY(0deg)" : "rotateY(-90deg)",
            transition: `transform ${ease} ${stagger(250)}`,
          })}

          {portrait ? (
            <>
              {/* PORTRAIT: community is standalone right of front */}
              {faceCard("community", {
                left: 2 * CELL,
                top: CELL,
                transformOrigin: "0px center",
                transform: flat ? "rotateY(0deg)" : "rotateY(90deg)",
                transition: `transform ${ease} ${stagger(250)}`,
              })}

              {/* PORTRAIT: building + back chain vertically below front */}
              <div
                style={{
                  position: "absolute",
                  left: CELL,
                  top: 2 * CELL,
                  width: SIZE,
                  height: CELL + SIZE,
                  transformStyle: "preserve-3d",
                  transformOrigin: "center 0px",
                  transform: flat ? "rotateX(0deg)" : "rotateX(-90deg)",
                  transition: `transform ${ease} ${stagger(150)}`,
                }}
              >
                {faceCard("building", { left: 0, top: 0 })}
                {faceCard("back", {
                  left: 0,
                  top: CELL,
                  transformOrigin: "center 0px",
                  transform: flat ? "rotateX(0deg)" : "rotateX(-90deg)",
                  transition: `transform ${ease} ${stagger(380)}`,
                })}
              </div>
            </>
          ) : (
            <>
              {/* LANDSCAPE: building standalone below front */}
              {faceCard("building", {
                left: CELL,
                top: 2 * CELL,
                transformOrigin: "center 0px",
                transform: flat ? "rotateX(0deg)" : "rotateX(-90deg)",
                transition: `transform ${ease} ${stagger(150)}`,
              })}

              {/* LANDSCAPE: community + back chain horizontally right of front */}
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
