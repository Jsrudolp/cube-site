"use client";

import { useEffect } from "react";
import { CubeHud } from "@/components/cube";
import { setFavicon } from "@/lib/favicon";

export default function Home() {
  useEffect(() => {
    setFavicon("front");
  }, []);

  return (
    <div className="min-h-screen">
      <CubeHud />
    </div>
  );
}
