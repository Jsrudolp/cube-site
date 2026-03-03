"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const DEFAULT_RADIUS = 280;

function FlashlightInner({ children, fullscreen, overlayZIndex = 40 }: { children: React.ReactNode; fullscreen?: boolean; overlayZIndex?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const searchParams = useSearchParams();

  // Store last known cursor position in viewport coordinates
  const cursorRef = useRef({ clientX: -1000, clientY: -1000 });

  const updatePosition = useCallback(() => {
    if (fullscreen) {
      setPosition({ x: cursorRef.current.clientX, y: cursorRef.current.clientY });
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: cursorRef.current.clientX - rect.left,
      y: cursorRef.current.clientY - rect.top,
    });
  }, [fullscreen]);

  useEffect(() => {
    // Dev override: ?radius=50 (or any number)
    const radiusOverride = searchParams.get("radius");
    if (radiusOverride) {
      const parsed = parseInt(radiusOverride, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setRadius(parsed);
      }
    }
  }, [searchParams]);

  // Update position on scroll
  useEffect(() => {
    window.addEventListener("scroll", updatePosition);
    return () => window.removeEventListener("scroll", updatePosition);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    cursorRef.current = { clientX: e.clientX, clientY: e.clientY };
    updatePosition();
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    cursorRef.current = { clientX: touch.clientX, clientY: touch.clientY };
    updatePosition();
  }, [updatePosition]);

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
        className={`${fullscreen ? "fixed" : "absolute"} inset-0 pointer-events-none`}
        style={{ zIndex: overlayZIndex,
          background: "black",
          maskImage: `radial-gradient(circle ${radius}px at ${position.x}px ${position.y}px, transparent 0%, transparent 80%, black 100%)`,
          WebkitMaskImage: `radial-gradient(circle ${radius}px at ${position.x}px ${position.y}px, transparent 0%, transparent 80%, black 100%)`,
        }}
      />
    </div>
  );
}

export default function Flashlight({ children, fullscreen, overlayZIndex }: { children: React.ReactNode; fullscreen?: boolean; overlayZIndex?: number }) {
  return (
    <Suspense fallback={<div className="relative">{children}</div>}>
      <FlashlightInner fullscreen={fullscreen} overlayZIndex={overlayZIndex}>{children}</FlashlightInner>
    </Suspense>
  );
}
