"use client";

import { FaceId } from "@/lib/faces";
import { FACE_COLORS } from "@/lib/cube-config";

interface FacePreviewProps {
  faceId: FaceId;
  size: number;
}

function FrontPreview({ size }: { size: number }) {
  const scale = size / 400;
  return (
    <div
      className="w-full h-full bg-white overflow-hidden"
      style={{ fontSize: `${15 * scale}px` }}
    >
      <div className="px-6 pt-8" style={{ maxWidth: 400 * scale }}>
        <p className="font-bold">Jake Rudolph</p>
        <p className="text-foreground/70">
          Creating startups, software, communities, songs, and mental models
        </p>
        <hr className="my-6 border-foreground/20" />
        <ul className="space-y-2 leading-relaxed">
          <li className="list-disc ml-5">
            Led <strong>product, engineering, and design</strong> for a B2B2C
            healthcare marketplace platform...
          </li>
        </ul>
      </div>
    </div>
  );
}

function MusicPreview({ size }: { size: number }) {
  return (
    <div
      className="w-full h-full bg-[#100023] text-white overflow-hidden relative"
      style={{
        backgroundImage: "url('/music-hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 flex items-end justify-center pb-[15%]">
        <div className="text-center">
          <p
            className="uppercase tracking-[0.3em] text-white/90"
            style={{ fontSize: size * 0.025 }}
          >
            New Demo
          </p>
          <h1
            className="font-black uppercase tracking-wider"
            style={{ fontSize: size * 0.12 }}
          >
            Supermagnetic
          </h1>
        </div>
      </div>
    </div>
  );
}

function BuildingPreview({ size }: { size: number }) {
  return (
    <div className="w-full h-full bg-[#f5e6d3] overflow-hidden">
      <div className="text-center pt-[15%] px-4">
        <p className="text-2xl md:text-3xl italic" style={{ fontSize: size * 0.06 }}>
          I figure out what&apos;s valuable, then build it
        </p>
        <p className="text-2xl md:text-3xl italic" style={{ fontSize: size * 0.06 }}>
          <em>using whatever tools it takes.</em>
        </p>
        <div
          className="mt-6 mx-auto rounded-lg bg-[#e8c9a8] border border-dashed border-foreground/15 flex items-center justify-center"
          style={{ width: size * 0.4, height: size * 0.3 }}
        >
          <span className="text-foreground/40" style={{ fontSize: size * 0.03 }}>
            Toolbox illustration
          </span>
        </div>
      </div>
    </div>
  );
}

function CommunityPreview({ size }: { size: number }) {
  return (
    <div className="w-full h-full bg-[#f5f5f0] overflow-hidden">
      <div className="text-center pt-[15%] px-4">
        <h1 className="font-bold" style={{ fontSize: size * 0.07 }}>
          jake&apos;s hosting wall
        </h1>
        <p className="text-foreground/60 mt-2" style={{ fontSize: size * 0.035 }}>
          a polaroid collection of the communities i&apos;ve built and lead
        </p>
        {/* Placeholder polaroids */}
        <div className="flex justify-center gap-4 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white shadow-md"
              style={{
                width: size * 0.18,
                height: size * 0.22,
                transform: `rotate(${(i - 1) * 5}deg)`,
              }}
            >
              <div
                className="bg-foreground/10"
                style={{
                  margin: size * 0.02,
                  height: size * 0.14,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThinkingPreview({ size }: { size: number }) {
  return (
    <div
      className="w-full h-full bg-[#F5F5F5] overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)",
        backgroundSize: `${size * 0.05}px ${size * 0.05}px`,
      }}
    >
      <div className="text-center pt-[15%] px-4">
        <div
          className="mx-auto mb-2"
          style={{ fontSize: size * 0.08, fontWeight: "bold" }}
        >
          My Thinking Tools
        </div>
        <p className="text-foreground/60" style={{ fontSize: size * 0.035 }}>
          A whiteboard gallery of my favourite frameworks
        </p>
      </div>
    </div>
  );
}

function BackPreview({ size }: { size: number }) {
  const scale = size / 400;
  return (
    <div
      className="w-full h-full bg-[#373737] text-white overflow-hidden"
      style={{ fontSize: `${15 * scale}px` }}
    >
      <div className="px-6 pt-8" style={{ maxWidth: 400 * scale }}>
        <p className="font-bold">Jake Rudolph</p>
        <p className="text-white/70">To be honest, still figuring it out</p>
        <hr className="my-6 border-white/20" />
        <ul className="space-y-2 leading-relaxed">
          <li className="list-disc ml-5">
            My biggest fears are: being <strong>boring</strong>, building
            exclusive communities...
          </li>
        </ul>
      </div>
    </div>
  );
}

const FACE_PREVIEWS: Record<FaceId, React.FC<{ size: number }>> = {
  front: FrontPreview,
  music: MusicPreview,
  building: BuildingPreview,
  community: CommunityPreview,
  thinking: ThinkingPreview,
  back: BackPreview,
};

export function FacePreview({ faceId, size }: FacePreviewProps) {
  const PreviewComponent = FACE_PREVIEWS[faceId];
  const bgColor = FACE_COLORS[faceId];

  if (!PreviewComponent) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-foreground/50">{faceId}</span>
      </div>
    );
  }

  return <PreviewComponent size={size} />;
}

export default FacePreview;
