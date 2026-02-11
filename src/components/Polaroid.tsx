"use client";

import { useRef, useCallback } from "react";

interface PolaroidProps {
  src: string;
  alt: string;
  rotation?: number;
  wide?: boolean;
}

export default function Polaroid({ src, alt, rotation = 0, wide = false }: PolaroidProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    ref.current.style.transform = `rotate(${rotation + x * 4}deg)`;
  }, [rotation]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = `rotate(${rotation}deg)`;
  }, [rotation]);

  return (
    <div
      ref={ref}
      className="inline-block flex-shrink-0 bg-white p-2 pb-8"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        boxShadow: `
          1px 1px 3px rgba(0, 0, 0, 0.06),
          3px 3px 5px rgba(0, 0, 0, 0.05),
          6px 7px 7px rgba(0, 0, 0, 0.03),
          12px 13px 9px rgba(0, 0, 0, 0.01)
        `,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "top center",
        transition: "transform 0.5s ease-out",
      }}
    >
      <div
        className={`bg-foreground/10 overflow-hidden ${
          wide ? "w-56 h-56" : "w-36 h-48"
        }`}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
