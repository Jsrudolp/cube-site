"use client";

import { useEffect, useRef, useState } from "react";

interface CurtainRevealProps {
  canvas: HTMLCanvasElement;
  onComplete: () => void;
  duration?: number;
}

export function CurtainReveal({
  canvas,
  onComplete,
  duration = 600,
}: CurtainRevealProps) {
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState(0);
  const animRef = useRef<number | null>(null);

  // Draw the left and right halves of the captured canvas
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const halfW = Math.ceil(w / 2);

    // Scale the captured canvas to viewport size
    const drawHalf = (
      target: HTMLCanvasElement,
      srcX: number,
      destW: number
    ) => {
      target.width = destW;
      target.height = h;
      const ctx = target.getContext("2d")!;
      // Draw the appropriate half, scaling from capture size to viewport size
      ctx.drawImage(
        canvas,
        (srcX / w) * canvas.width,
        0,
        (destW / w) * canvas.width,
        canvas.height,
        0,
        0,
        destW,
        h
      );
    };

    if (leftRef.current) drawHalf(leftRef.current, 0, halfW);
    if (rightRef.current) drawHalf(rightRef.current, halfW, w - halfW);
  }, [canvas]);

  // Animate the curtain opening
  useEffect(() => {
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      setOffset(eased * 100);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {/* Left half */}
      <canvas
        ref={leftRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translateX(-${offset}%)`,
          willChange: "transform",
        }}
      />
      {/* Right half */}
      <canvas
        ref={rightRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          transform: `translateX(${offset}%)`,
          willChange: "transform",
        }}
      />
    </div>
  );
}
