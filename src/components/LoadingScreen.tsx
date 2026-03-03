"use client";

import { useEffect, useState } from "react";
import { usePersistentCube } from "@/components/cube";

export default function LoadingScreen() {
  const { texturesReady } = usePersistentCube();
  const [isIframe, setIsIframe] = useState(true); // default true — skip on SSR
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

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
      <p className="text-sm tracking-widest uppercase text-black/50 select-none">
        3-dimensionalising
        <span className="dot-1">.</span>
        <span className="dot-2">.</span>
        <span className="dot-3">.</span>
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

        @keyframes dotBlink {
          0%, 80%, 100% { opacity: 0.15; }
          40%            { opacity: 1; }
        }
        .dot-1 { animation: dotBlink 1.4s ease-in-out infinite 0s; }
        .dot-2 { animation: dotBlink 1.4s ease-in-out infinite 0.2s; }
        .dot-3 { animation: dotBlink 1.4s ease-in-out infinite 0.4s; }
      `}</style>
    </div>
  );
}
