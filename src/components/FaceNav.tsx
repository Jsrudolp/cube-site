"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FACES, FaceId } from "@/lib/faces";

const FACE_ICONS: Record<FaceId, string> = {
  front: "F",
  music: "M",
  building: "B",
  community: "C",
  thinking: "T",
  back: "P",
};

export default function FaceNav() {
  const pathname = usePathname();

  // Don't render nav on the home/cube page
  if (pathname === "/") return null;

  const currentFace = FACES.find((f) => pathname.startsWith(f.route));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        {/* Brain icon — home/cube */}
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
          title="Back to cube"
        >
          <span className="text-sm font-bold">&#x2302;</span>
        </Link>

        {/* Face icons */}
        {FACES.map((face) => {
          const isActive = currentFace?.id === face.id;
          return (
            <Link
              key={face.id}
              href={face.route}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-foreground/10 hover:bg-foreground/20"
              }`}
              title={face.label}
            >
              <span className="text-sm font-bold">
                {FACE_ICONS[face.id]}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/"
        className="text-sm hover:opacity-70 transition-opacity"
      >
        Zoom Out
      </Link>
    </nav>
  );
}
