import FaceLayout from "@/components/FaceLayout";
import Polaroid from "@/components/Polaroid";
import SvgArtifact from "@/components/SvgArtifact";

// Placeholder data — real photos and artifacts to be added
// Each row represents a community
const COMMUNITY_ROWS = [
  {
    id: "socratica",
    items: [
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Community event", rotation: -3 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Group photo", rotation: 2 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Demo day", rotation: -1 },
      { type: "artifact" as const, src: "/artifacts/trophy.svg", alt: "Trophy" },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Outdoor event", rotation: 4 },
    ],
  },
  {
    id: "hot-gxrl-walk-club",
    items: [
      { type: "artifact" as const, src: "/artifacts/icecream.svg", alt: "Ice cream" },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Walk club", rotation: -2 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Group walk", rotation: 3 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Event photo", rotation: -4 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Community", rotation: 1 },
    ],
  },
  {
    id: "symposium",
    items: [
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Symposium", rotation: 2 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Stage", rotation: -3 },
      { type: "artifact" as const, src: "/artifacts/jersey.svg", alt: "Hockey jersey" },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Crowd", rotation: 1 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Demo", rotation: -2 },
    ],
  },
  {
    id: "kickoff",
    items: [
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Friends", rotation: -1 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Team", rotation: 3 },
      { type: "artifact" as const, src: "/artifacts/cone.svg", alt: "Traffic cone" },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Kickoff event", rotation: -4 },
    ],
  },
  {
    id: "music-community",
    items: [
      { type: "artifact" as const, src: "/artifacts/guitar.svg", alt: "Guitar" },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Music night", rotation: 2 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Performance", rotation: -2 },
      { type: "photo" as const, src: "/photos/placeholder.jpg", alt: "Jam session", rotation: 4 },
    ],
  },
];

export default function CommunityPage() {
  return (
    <FaceLayout faceId="community" className="bg-[#f5f5f0]">
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">jake&apos;s hosting wall</h1>
          <p className="text-foreground/60 mt-2">
            a polaroid collection of the communities i&apos;ve built and lead
            over the past 7 years.
          </p>
        </div>

        {/* Photo wall — rows of communities */}
        <div className="space-y-6">
          {COMMUNITY_ROWS.map((row) => (
            <div key={row.id} className="relative">
              {/* String/wire line */}
              <div className="absolute top-4 left-0 right-0 h-px bg-foreground/15" />

              {/* Scrollable row */}
              <div className="flex gap-6 items-end overflow-x-auto pb-4 pt-6 px-2 md:flex-wrap md:overflow-x-visible md:justify-center">
                {row.items.map((item, i) => {
                  if (item.type === "photo") {
                    return (
                      <div key={i} className="relative flex-shrink-0">
                        {/* Pin dot */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground/30 z-10" />
                        <Polaroid
                          src={item.src}
                          alt={item.alt}
                          rotation={item.rotation}
                        />
                      </div>
                    );
                  }
                  return (
                    <SvgArtifact
                      key={i}
                      src={item.src}
                      alt={item.alt}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FaceLayout>
  );
}
