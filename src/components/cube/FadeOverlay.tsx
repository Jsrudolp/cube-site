"use client";

interface FadeOverlayProps {
  visible: boolean;
}

export function FadeOverlay({ visible }: FadeOverlayProps) {
  return (
    <div
      className={`fixed inset-0 bg-white pointer-events-none transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ zIndex: 100 }}
    />
  );
}
