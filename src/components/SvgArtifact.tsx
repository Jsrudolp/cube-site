"use client";

import { useState, type CSSProperties } from "react";

interface SvgArtifactProps {
  src: string;
  hoverSrc?: string;
  alt: string;
  className?: string;
  size?: number;
  style?: CSSProperties;
}

export default function SvgArtifact({
  src,
  hoverSrc,
  alt,
  className = "",
  size = 160,
  style,
}: SvgArtifactProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentSrc = hoverSrc && isHovered ? hoverSrc : src;

  return (
    <div
      className={`inline-block flex-shrink-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: size, height: size, ...style }}
    >
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
