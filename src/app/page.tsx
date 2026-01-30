"use client";

import Link from "next/link";
import { FACES } from "@/lib/faces";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e5e5e0]">
      {/* Placeholder for Three.js cube — Phase 2 */}
      <div className="w-80 h-80 border-2 border-dashed border-foreground/20 rounded-lg flex items-center justify-center mb-12">
        <p className="text-foreground/40 text-sm text-center px-4">
          3D Cube goes here<br />(Phase 2)
        </p>
      </div>

      {/* Temporary navigation to face pages */}
      <div className="flex flex-wrap gap-3 justify-center">
        {FACES.map((face) => (
          <Link
            key={face.id}
            href={face.route}
            className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-lg text-sm transition-colors"
          >
            {face.label}
          </Link>
        ))}
      </div>

      {/* HUD placeholder */}
      <div className="fixed bottom-6 left-6 text-xs text-foreground/40">
        <p>0/6 faces visited</p>
      </div>
      <div className="fixed bottom-6 right-6 text-xs text-foreground/40 text-right">
        <p>a multi-dimensional website,</p>
        <p>made by a multidimensional person</p>
      </div>
    </div>
  );
}
