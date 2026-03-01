"use client";

import { useEffect } from "react";
import { CubeHud } from "@/components/cube";
import { setFavicon } from "@/lib/favicon";

export default function Home() {
  useEffect(() => {
    void setFavicon("front");
  }, []);

  return (
    <div className="min-h-screen">
      <CubeHud />
    </div>
  );
}
