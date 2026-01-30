"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getVisitedFaces } from "@/lib/visited-faces";

// Radius in px per number of OTHER faces visited (0-5)
const RADIUS_MAP = [50, 90, 140, 200, 280, 400];

export default function Flashlight({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [radius, setRadius] = useState(0);

  useEffect(() => {
    // Count how many NON-"back" faces have been visited
    const visited = getVisitedFaces().filter((id) => id !== "back");
    const count = Math.min(visited.length, 5);
    setRadius(RADIUS_MAP[count]);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + window.scrollY,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top + window.scrollY,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchMove}
    >
      {/* Content underneath */}
      {children}

      {/* Dark overlay with circular cutout */}
      <div
        className="absolute inset-0 pointer-events-none z-40 transition-[mask-position] duration-75 ease-out"
        style={{
          background: "black",
          maskImage: `radial-gradient(circle ${radius}px at ${position.x}px ${position.y}px, transparent 0%, transparent 80%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${radius}px at ${position.x}px ${position.y}px, transparent 0%, transparent 80%, black 100%)`,
        }}
      />
    </div>
  );
}
