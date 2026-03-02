"use client";

import { useState, useEffect } from "react";
import { getVisitedCount } from "@/lib/visited-faces";
import { usePersistentCube } from "./PersistentCubeProvider";

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

export function CubeHud() {
  const { zoomingIn } = usePersistentCube();
  const [timestamp, setTimestamp] = useState("");
  const [visitedCount, setVisitedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimestamp(formatTimestamp());
    setVisitedCount(getVisitedCount());

    const interval = setInterval(() => {
      setTimestamp(formatTimestamp());
      setVisitedCount(getVisitedCount());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || zoomingIn) {
    return null;
  }

  return (
    <>
      {/* Bottom-left: timestamp + visited count */}
      <div className="fixed bottom-6 left-6 sm:bottom-16 sm:left-16 text-[11px] sm:text-sm text-foreground/80 uppercase tracking-wide font-[family-name:var(--font-geist-mono)]">
        <p>{timestamp}</p>
        <p>{visitedCount}/6 FACES VISITED</p>
      </div>

      {/* Bottom-right: name + tagline */}
      <div className="fixed bottom-6 right-6 sm:bottom-16 sm:right-16 text-[11px] sm:text-sm text-foreground/80 text-right uppercase tracking-wide font-[family-name:var(--font-geist-mono)]">
        <p className="font-semibold">JAKE RUDOLPH</p>
        <div className="hidden sm:block mt-2">
          <p>A MULTI-DIMENSIONAL WEBSITE, MADE</p>
          <p>BY A MULTIDIMENSIONAL PERSON</p>
        </div>
      </div>
    </>
  );
}
