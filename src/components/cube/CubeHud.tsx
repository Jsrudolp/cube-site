"use client";

import { useState, useEffect } from "react";
import { getVisitedCount } from "@/lib/visited-faces";

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
  const [timestamp, setTimestamp] = useState("");
  const [visitedCount, setVisitedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimestamp(formatTimestamp());
    setVisitedCount(getVisitedCount());

    // Update timestamp every minute
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp());
      setVisitedCount(getVisitedCount());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Bottom-left: timestamp + visited count */}
      <div className="fixed bottom-6 left-6 text-xs text-foreground/50 font-mono">
        <p>{timestamp}</p>
        <p>{visitedCount}/6 FACES VISITED</p>
      </div>

      {/* Bottom-right: name + tagline */}
      <div className="fixed bottom-6 right-6 text-xs text-foreground/50 text-right">
        <p className="font-semibold tracking-wide">JAKE RUDOLPH</p>
        <p className="italic">a multi-dimensional website,</p>
        <p className="italic">made by a multidimensional person</p>
      </div>
    </>
  );
}
