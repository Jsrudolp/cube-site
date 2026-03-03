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
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500"
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
