"use client";

import { forwardRef, useMemo } from "react";
import { FaceId } from "@/lib/faces";

interface CSS3DCubeProps {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  perspective: number;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

interface CubeFaceProps {
  faceId: FaceId;
  size: number;
  children?: React.ReactNode;
}

// Face transforms to position each face of the cube
// In CSS 3D, positive rotateY goes clockwise when viewed from above
// positive rotateX tilts the top toward the viewer
const FACE_TRANSFORMS: Record<FaceId, (halfSize: number) => string> = {
  front: (h) => `translateZ(${h}px)`,
  back: (h) => `rotateY(180deg) translateZ(${h}px)`,
  community: (h) => `rotateY(90deg) translateZ(${h}px)`, // Right (+X)
  music: (h) => `rotateY(-90deg) translateZ(${h}px)`, // Left (-X)
  thinking: (h) => `rotateX(-90deg) translateZ(${h}px)`, // Top (+Y) - CSS Y is down, so -90 lifts face up
  building: (h) => `rotateX(90deg) translateZ(${h}px)`, // Bottom (-Y) - 90 tilts face down
};

export function CubeFace({ faceId, size, children }: CubeFaceProps) {
  const halfSize = size / 2;
  const transform = FACE_TRANSFORMS[faceId](halfSize);

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        width: size,
        height: size,
        left: -halfSize,
        top: -halfSize,
        transform,
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export const CSS3DCube = forwardRef<HTMLDivElement, CSS3DCubeProps>(
  function CSS3DCube(
    {
      rotationX,
      rotationY,
      rotationZ,
      scale,
      perspective,
      className = "",
      children,
      style,
    },
    ref
  ) {
    const containerStyle = useMemo(
      () => ({
        perspective: `${perspective}px`,
        perspectiveOrigin: "center center",
        ...style,
      }),
      [perspective, style]
    );

    const cubeStyle = useMemo(
      () => ({
        width: 0,
        height: 0,
        position: "relative" as const,
        transformStyle: "preserve-3d" as const,
        transform: `rotateX(${rotationX}rad) rotateY(${rotationY}rad) rotateZ(${rotationZ}rad) scale(${scale})`,
      }),
      [rotationX, rotationY, rotationZ, scale]
    );

    return (
      <div ref={ref} className={className} style={containerStyle}>
        <div style={cubeStyle}>
          {children}
        </div>
      </div>
    );
  }
);

export default CSS3DCube;
