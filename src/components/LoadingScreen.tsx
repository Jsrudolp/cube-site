"use client";

import { useEffect, useState, useCallback } from "react";
import { usePersistentCube } from "@/components/cube";

const CUBE_FACTS = [
  "one cubic kilometer is a billion cubic meters",
  "thank cube-erry much for visiting my website",
  "a tesseract, or 4-cube, is the four-dimensional version of a cube",
  "think outside of the box :)",
  "singers use foam cubes when recording to reduce unwanted noise",
];

export default function LoadingScreen() {
  const { texturesReady } = usePersistentCube();
  const [isIframe, setIsIframe] = useState(true); // default true — skip on SSR
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * CUBE_FACTS.length));
  const [factFading, setFactFading] = useState(false);

  const cycleFact = useCallback(() => {
    setFactFading(true);
    setTimeout(() => {
      setFactIndex((i) => (i + 1) % CUBE_FACTS.length);
      setFactFading(false);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleFact, 3500);
    return () => clearInterval(interval);
  }, [cycleFact]);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!texturesReady) return;
    setFading(true);
    const t = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(t);
  }, [texturesReady]);

  if (isIframe || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 transition-opacity duration-500"
      style={{
        backgroundColor: "#EDEDED",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="cube-loader">
        <div className="cube-face cube-face--front" />
        <div className="cube-face cube-face--back" />
        <div className="cube-face cube-face--left" />
        <div className="cube-face cube-face--right" />
        <div className="cube-face cube-face--top" />
        <div className="cube-face cube-face--bottom" />
      </div>
      <p
        className="text-xs sm:text-sm tracking-widest uppercase text-foreground/80 select-none font-[family-name:var(--font-geist-mono)] text-center max-w-xs sm:max-w-sm px-4 transition-opacity duration-300"
        style={{ opacity: factFading ? 0 : 1 }}
      >
        {CUBE_FACTS[factIndex]}
      </p>

      <style>{`
        .cube-loader {
          width: 48px;
          height: 48px;
          position: relative;
          transform-style: preserve-3d;
          animation: cubeRotate 2.4s linear infinite;
        }

        @keyframes cubeRotate {
          from { transform: rotateX(-22deg) rotateY(0deg); }
          to   { transform: rotateX(-22deg) rotateY(360deg); }
        }

        .cube-face {
          position: absolute;
          width: 48px;
          height: 48px;
          border: 1.5px solid rgba(0,0,0,0.15);
          background: rgba(255,255,255,0.5);
        }

        .cube-face--front  { transform: translateZ(24px); }
        .cube-face--back   { transform: rotateY(180deg) translateZ(24px); }
        .cube-face--left   { transform: rotateY(-90deg) translateZ(24px); }
        .cube-face--right  { transform: rotateY(90deg)  translateZ(24px); }
        .cube-face--top    { transform: rotateX(90deg)  translateZ(24px); }
        .cube-face--bottom { transform: rotateX(-90deg) translateZ(24px); }

`}</style>
    </div>
  );
}
