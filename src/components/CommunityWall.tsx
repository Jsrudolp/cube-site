"use client";

import Polaroid from "@/components/Polaroid";
import SvgArtifact from "@/components/SvgArtifact";
import CommunityRow from "@/components/CommunityRow";

function Pin() {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground z-10" />
  );
}

interface CommunityRowData {
  id: string;
  artifactPosition: number;
  artifact: { src: string; hoverSrc: string; alt: string; size?: number; offsetY?: number };
  photos: { src: string; alt: string; rotation: number }[];
  cover: { src: string; alt: string; rotation: number };
}

type RowItem =
  | { type: "photo"; src: string; alt: string; rotation: number }
  | { type: "cover"; src: string; alt: string; rotation: number }
  | { type: "artifact"; src: string; hoverSrc: string; alt: string; size?: number; offsetY?: number };

function buildRowItems(row: CommunityRowData): RowItem[] {
  const base: RowItem[] = [
    { type: "photo", ...row.photos[0] },
    { type: "photo", ...row.photos[1] },
    { type: "cover", ...row.cover },
    { type: "photo", ...row.photos[2] },
    { type: "photo", ...row.photos[3] },
  ];
  const artifact: RowItem = { type: "artifact", ...row.artifact };
  base.splice(row.artifactPosition - 1, 0, artifact);
  return base;
}

export default function CommunityWall({ rows }: { rows: CommunityRowData[] }) {
  return (
    <div className="space-y-6 pb-16">
      {rows.map((row) => {
        const items = buildRowItems(row);
        return (
          <CommunityRow key={row.id}>
            {items.map((item, i) => {
              if (item.type === "artifact") {
                return (
                  <SvgArtifact
                    key={`artifact-${i}`}
                    src={item.src}
                    hoverSrc={item.hoverSrc}
                    alt={item.alt}
                    size={item.size}
                    className="relative z-20 flex-shrink-0"
                    style={item.offsetY ? { marginTop: item.offsetY } : undefined}
                  />
                );
              }
              return (
                <div key={i} className="relative flex-shrink-0">
                  <Pin />
                  <Polaroid
                    src={item.src}
                    alt={item.alt}
                    rotation={item.rotation}
                    wide={item.type === "cover"}
                  />
                </div>
              );
            })}
          </CommunityRow>
        );
      })}
    </div>
  );
}
