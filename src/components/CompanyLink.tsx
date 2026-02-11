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
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  gap?: number;
  height?: number;
  iconSize?: number;
  fontSize?: number;
}

// Base values at scale 1.0
const BASE = {
  gap: 8,        // px
  paddingX: 14,  // px
  height: 33,    // px (fixed height for consistency)
  iconSize: 16,  // px
  fontSize: 0.8, // em
  verticalMargin: -4, // px
  borderRadius: 6, // px
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
  paddingX: customPaddingX,
  paddingY: customPaddingY,
  borderRadius: customBorderRadius,
  gap: customGap,
  height: customHeight,
  iconSize: customIconSize,
  fontSize: customFontSize,
}: CompanyLinkProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Scale all values proportionally, allow overrides
  const gap = customGap ?? BASE.gap * scale;
  const paddingX = customPaddingX ?? BASE.paddingX * scale;
  const paddingY = customPaddingY ?? 0;
  const height = customHeight ?? Math.round(BASE.height * scale);
  const iconSize = customIconSize ?? Math.round(BASE.iconSize * scale);
  const fontSize = customFontSize ?? BASE.fontSize * scale;
  const verticalPos = verticalOffset ?? 0;
  const borderRadius = customBorderRadius ?? BASE.borderRadius;

  const handleMouseEnter = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  // Extract hue/sat from bg, produce a lighter bg and darker text
  const hslFromHex = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d > 0) {
      if (max === r) h = ((g - b) / d + 6) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    const s = d === 0 ? 0 : d / (1 - Math.abs(max + min - 1));
    return { h: Math.round(h), s: Math.min(s, 1) };
  };
  const { h: hue, s: sat } = hslFromHex(bgColor);
  const lightBg = `hsl(${hue}, ${Math.round(Math.min(sat * 1.2, 1) * 100)}%, 94%)`;
  const textColor = `hsl(${hue}, ${Math.round(Math.min(sat * 2.5, 1) * 100)}%, 22%)`;

  // Shine gradient color
  const shineColor = shineWhite
    ? "rgba(255, 255, 255, 0.4)"
    : `${bgColor}88`; // Use bg color with some transparency

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="company-pill inline-flex items-center align-baseline relative overflow-hidden"
      style={{
        backgroundColor: lightBg,
        color: textColor,
        gap: `${gap}px`,
        paddingLeft: `${paddingX}px`,
        paddingRight: `${paddingX}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        height: paddingY ? "auto" : `${height}px`,
        borderRadius: `${borderRadius}px`,
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
