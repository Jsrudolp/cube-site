"use client";

import { ContactShadows } from "@react-three/drei";

export function CubeShadow() {
  return (
    <ContactShadows
      position={[0, -1.2, 0]}
      opacity={0.4}
      scale={8}
      blur={2}
      far={4}
      color="#000000"
    />
  );
}
