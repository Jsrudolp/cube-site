"use client";

import Image from "next/image";
import { useState } from "react";

interface CompanyLinkProps {
  href: string;
  logo: string;
  name: string;
  bgColor?: string;
  scale?: number;
  verticalOffset?: number;
  shineWhite?: boolean;
  shineDuration?: number;
}

// Base values at scale 1.0
const BASE = {
  gap: 6,        // px
  paddingX: 16,  // px
  paddingY: 4,   // px
  iconSize: 16,  // px
  fontSize: 0.9, // em
  verticalMargin: -4, // px
  borderRadius: 9999, // px (full)
};

export default function CompanyLink({
  href,
  logo,
  name,
  bgColor = "#e5e5e5",
  scale = 1,
  verticalOffset,
  shineWhite = true,
  shineDuration = 400,
}: CompanyLinkProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Scale all values proportionally
  const gap = BASE.gap * scale;
  const paddingX = BASE.paddingX * scale;
  const paddingY = BASE.paddingY * scale;
  const iconSize = Math.round(BASE.iconSize * scale);
  const fontSize = BASE.fontSize * scale;
  const verticalPos = verticalOffset ?? 0;

  const handleMouseEnter = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  // Shine gradient color
  const shineColor = shineWhite
    ? "rgba(255, 255, 255, 0.4)"
    : `${bgColor}88`; // Use bg color with some transparency

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="company-pill inline-flex items-center rounded-full align-baseline relative overflow-hidden"
      style={{
        backgroundColor: bgColor,
        gap: `${gap}px`,
        paddingLeft: `${paddingX}px`,
        paddingRight: `${paddingX}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        top: `${verticalPos}px`,
      }}
      onMouseEnter={handleMouseEnter}
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        width={iconSize}
        height={iconSize}
        className="inline-block object-contain relative z-10"
      />
      <span
        className="font-semibold leading-none relative z-10"
        style={{ fontSize: `${fontSize}em` }}
      >
        {name}
      </span>

      {/* Shine overlay */}
      <span
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            ${shineColor} 50%,
            transparent 100%
          )`,
          transform: isAnimating ? "translateX(100%)" : "translateX(-100%)",
          transition: isAnimating ? `transform ${shineDuration}ms ease-in-out` : "none",
        }}
        onTransitionEnd={handleAnimationEnd}
      />
    </a>
  );
}
