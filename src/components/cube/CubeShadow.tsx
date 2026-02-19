"use client";

import { ContactShadows } from "@react-three/drei";

export function CubeShadow() {
  return (
    <ContactShadows
      position={[0, -2.0, 0]}
      opacity={0.3}
      scale={8}
      blur={3}
      far={5}
      color="#000000"
    />
  );
}
