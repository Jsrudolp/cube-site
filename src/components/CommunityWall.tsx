"use client";

import { useRef, useEffect } from "react";
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
  coverPosition: number;
  artifactPosition: number;
  artifact: {
    src: string;
    hoverSrc: string;
    alt: string;
    size?: number;
    offsetY?: number;
  };
  photos: { src: string; alt: string; rotation: number }[];
  cover: { src: string; alt: string; rotation: number; link?: string };
}

type RowItem =
  | { type: "photo"; src: string; alt: string; rotation: number }
  | { type: "cover"; src: string; alt: string; rotation: number; link?: string }
  | {
      type: "artifact";
      src: string;
      hoverSrc: string;
      alt: string;
      size?: number;
      offsetY?: number;
    };

function buildRowItems(row: CommunityRowData): RowItem[] {
  const result: (RowItem | null)[] = [null, null, null, null, null, null];
  result[row.coverPosition - 1] = { type: "cover", ...row.cover };
  result[row.artifactPosition - 1] = { type: "artifact", ...row.artifact };
  let photoIdx = 0;
  for (let i = 0; i < 6; i++) {
    if (!result[i]) {
      result[i] = { type: "photo", ...row.photos[photoIdx++] };
    }
  }
  return result as RowItem[];
}

/**
 * For artifacts with negative offsetY, we render them outside the scroll
 * container (on a non-clipping wrapper) and sync their horizontal position
 * with a spacer inside the flex layout via direct DOM updates on scroll.
 */
const STANDARD_ARTIFACT_WIDTH = 160;

function PolaroidItem({ item }: { item: RowItem & { type: "photo" | "cover" } }) {
  const polaroid = (
    <Polaroid
      src={item.src}
      alt={item.alt}
      rotation={item.rotation}
      wide={item.type === "cover"}
    />
  );

  return (
    <div className="relative flex-shrink-0">
      <Pin />
      {item.type === "cover" && item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {polaroid}
        </a>
      ) : (
        polaroid
      )}
    </div>
  );
}

function FloatingRow({ row }: { row: CommunityRowData }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const artifactRef = useRef<HTMLDivElement>(null);
  const items = buildRowItems(row);
  const artifact = row.artifact;
  const artifactSize = artifact.size || 160;

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    const spacer = spacerRef.current;
    const floating = artifactRef.current;
    const wrapper = wrapperRef.current;
    if (!scroller || !spacer || !floating || !wrapper) return;

    const sync = () => {
      const spacerRect = spacer.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      // Center the artifact over the spacer
      const centerOffset = (artifactSize - STANDARD_ARTIFACT_WIDTH) / 2;
      floating.style.left = `${spacerRect.left - wrapperRect.left - centerOffset}px`;
      const top = spacerRect.top - wrapperRect.top + (artifact.offsetY || 0);
      floating.style.top = `${top}px`;
      // Add bottom padding if the artifact extends below the row
      const artifactBottom = top + artifactSize;
      const overhang = artifactBottom - wrapperRect.height;
      wrapper.style.paddingBottom = overhang > 0 ? `${overhang}px` : "0px";
    };

    sync();
    scroller.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      scroller.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [artifact.offsetY]);

  return (
    <div ref={wrapperRef} className="relative">
      <CommunityRow scrollContainerRef={scrollContainerRef}>
        {items.map((item, i) => {
          if (item.type === "artifact") {
            return (
              <div
                key={`spacer-${i}`}
                ref={spacerRef}
                className="flex-shrink-0"
                style={{
                  width: STANDARD_ARTIFACT_WIDTH,
                }}
              />
            );
          }
          return <PolaroidItem key={i} item={item} />;
        })}
      </CommunityRow>

      {/* Floating artifact — rendered outside the scroll container */}
      <div
        ref={artifactRef}
        className="absolute z-20 pointer-events-auto"
        style={{ top: 0, left: 0 }}
      >
        <SvgArtifact
          src={artifact.src}
          hoverSrc={artifact.hoverSrc}
          alt={artifact.alt}
          size={artifact.size}
        />
      </div>
    </div>
  );
}

function StandardRow({ row }: { row: CommunityRowData }) {
  const items = buildRowItems(row);
  return (
    <CommunityRow>
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
        return <PolaroidItem key={i} item={item} />;
      })}
    </CommunityRow>
  );
}

export default function CommunityWall({ rows }: { rows: CommunityRowData[] }) {
  return (
    <div className="space-y-6 pb-16">
      {rows.map((row) => {
        const needsFloat = row.artifact.offsetY && row.artifact.offsetY < 0;
        return needsFloat ? (
          <FloatingRow key={row.id} row={row} />
        ) : (
          <StandardRow key={row.id} row={row} />
        );
      })}
    </div>
  );
}
