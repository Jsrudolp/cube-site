"use client";

import { useRef, useEffect, useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import FaceLayout from "@/components/FaceLayout";

// ---------------------------------------------------------------------------
// Decoration types & helpers
// ---------------------------------------------------------------------------

type ToolType = "nail" | "tape" | "screw" | "staple" | "stitch";

interface PointDecoration {
  id: number;
  type: Exclude<ToolType, "tape">;
  x: number;
  y: number;
  rotation: number;
}

interface TapeDecoration {
  id: number;
  type: "tape";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

type Decoration = PointDecoration | TapeDecoration;

// ---------------------------------------------------------------------------
// Section data
// ---------------------------------------------------------------------------

interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  projects: { name: string; company?: string; description: string; icon?: string }[];
  bgColor: string;
  layout: "text-left" | "text-right";
  cursor: string; // path to cursor SVG
}

// Cursor SVGs (32×32 versions for CSS cursor)
const CURSORS = {
  string: "/building-cursors/cursor-string-icon.svg",
  screwdriver: "/building-cursors/cursor-screwdriver-icon.svg",
  hammer: "/building-cursors/cursor-hammer-icon.svg",
  staples: "/building-cursors/cursor-staples-icon.svg",
  tapeRoll: "/building-cursors/cursor-tape-roll-icon.svg",
};

const ALL_CURSORS = Object.values(CURSORS);

const TOOL_FOR_CURSOR: Record<string, ToolType> = {
  [CURSORS.hammer]: "nail",
  [CURSORS.tapeRoll]: "tape",
  [CURSORS.screwdriver]: "screw",
  [CURSORS.staples]: "staple",
  [CURSORS.string]: "stitch",
};

let nextDecorationId = Date.now();

const SECTIONS: SectionData[] = [
  {
    id: "discovery",
    title: "Discovery",
    subtitle: "The secret weapon of doing great work",
    description:
      "Discovery is about understanding the world and choosing to solve problems that matter. Sometimes that means talking to hundreds of users to understand their top-of-list priorities. Other times I\u2019m embedded into a team as a forward-deployed engineer, ethnographically observing workflow friction, or building and testing in the field right away to validate risky assumptions. The goal in all cases is identifying the small set of problems that drive most of the impact.",
    projects: [
      { name: "Finding a unique proposition with PMF interviews", company: "Wygo", description: "Interviewed dozens of indie, revenue-generating community builders to understand barriers to their growth and profitability.", icon: "/building-cursors/magnify-icon.svg" },
      { name: "Forward-deploying to build a system for scale", company: "Alma Care", description: "Migrated operations-intensive team from Google Sheets to a comprehensive data model by building domain expertise and identifying time-sink workflows.", icon: "/building-cursors/clipboard-icon.svg" },
    ],
    bgColor: "#F2B188",
    layout: "text-left",
    cursor: CURSORS.hammer,
  },
  {
    id: "design",
    title: "Design",
    subtitle: "The sum of hundreds of small decisions",
    description:
      "My first foray into visual design started with urgently needing a poster for an event I was running, so I made one myself. I started with an idea in my head, but learned that without a crisp font, good textures, and a coherent colour palette, it fell flat. To me, design is about making small decisions that iteratively compound, whether that\u2019s for poster design, digital product, physical prototypes or IRL experiences. Good design means good judgement.",
    projects: [
      { name: "Designing for cognitive simplicity in healthcare", company: "Kindly", description: "Designed a care planner to reduce the cognitive load of healthcare management, with simplicity, flexibility and emergence as principles across employee and admin views.", icon: "/building-cursors/caliper-icon.svg" },
      { name: "Turning around event visuals in under 24 hours to launch fast", company: "various", description: "Visual design for a range of community events, from 5-person workshops to 100-person gatherings. each poster built from scratch with a different creative brief.", icon: "/building-cursors/compass-icon.svg" },
    ],
    bgColor: "#F8FAFF",
    layout: "text-right",
    cursor: CURSORS.staples,
  },
  {
    id: "engineering",
    title: "Engineering",
    subtitle: "AI-native development from technical foundations",
    description:
      "I\u2019ve always been drawn to \u2018building\u2019 over \u2018syntax\u2019 and adopted a slew of low/no-code tools like Bubble, Zapier and Airtable. As agentic development has improved, I started building better and faster, directly in code instead. This site was built with Claude Code. I\u2019ve shipped real products too, building the end-to-end product for a Simple Ventures startup that signed and piloted with 5 enterprise customers.",
    projects: [
      { name: "Building an end-to-end MVP to pilot with enterprise customers", company: "Kindly", description: "As sole builder, shipped onboarding, authentication, landing pages, custom company configs, booking flows, transactional emails, a database with RLS, and internal ops tooling.", icon: "/building-cursors/saw-icon.png" },
      { name: "Building a subscription management and checkout flow", company: "Zero Collective", description: "Architected a handbag selection and swap checkout, handling edge cases across subscription tiers, influencer accounts, paused and cancelled states, multiple subscriptions, and legacy pricing.", icon: "/building-cursors/wrench-icon.png" },
    ],
    bgColor: "#D7D9DC",
    layout: "text-left",
    cursor: CURSORS.screwdriver,
  },
  {
    id: "feedback-systems",
    title: "Feedback Systems",
    subtitle: "Compounding what works, sunsetting what doesn\u2019t",
    description:
      "My favourite thing about business and products is that shipping is just the beginning, not the end. I strongly believe in combining qualitative and quantitative signals, talking to real users, root-causing support tickets, tracking product analytics, to measure AND understand what could be better. For me, feedback data has been a springboard for my most impactful ideas. I\u2019m also not afraid of cutting low-impact, low-performing work to remove bloat and sharpen focus.",
    projects: [
      { name: "Pairing qual and quant to sunset a hyped feature", company: "Outschool", description: "User reactions to a new recommendations tool were lukewarm. Paired interview clips and quotes with conversion data to make the case for sunsetting it.", icon: "/building-cursors/pliers-icon.png" },
      { name: "Designing feedback loops to run the world's best demo day", company: "Socratica", description: "Built a series of engaging surveys with org-value likerts for cross-event comparison, testimonial sourcing, and open-ended questions that shaped how we run Symposium.", icon: "/building-cursors/measuring-icon.png" },
    ],
    bgColor: "#F8FAFF",
    layout: "text-right",
    cursor: CURSORS.tapeRoll,
  },
  {
    id: "business-sense",
    title: "Business Sense",
    subtitle: "Creating value, not just products",
    description:
      "My first priority when joining a new company is always to figure out \u201chow do they make money?\u201d I\u2019ve spent time in business metric meetings I wasn\u2019t required to attend, followed the threads of CEO and manager Slack messages to understand their priorities, and learned deeply about unit economics and go-to-market wedges. I care about building something that actually works as a business, sustainably. That means thinking about path to profitability, defensibility, and how the product reaches people.",
    projects: [
      { name: "Writing keep-or-kill investment memos", company: "Simple Ventures", description: "Evaluated concepts in FinTech and Healthcare against the Simple Ventures thesis of capital efficiency and sustainable profitability, writing memos to drive investment decisions.", icon: "/building-cursors/printer-icon.svg" },
      { name: "Increasing marketplace premiumness through positioning", company: "Outschool", description: "Created a value perception test inspired by info foraging theory. parents compared Outschool and competitor classes across six axes, surfacing insights from syllabus density to a macro problem: the marketplace was flattening top teachers' unique value.", icon: "/building-cursors/positioning-icon.svg" },
    ],
    bgColor: "#F2BDB4",
    layout: "text-left",
    cursor: CURSORS.string,
  },
  {
    id: "scrappiness",
    title: "Scrappiness",
    subtitle: "Everything else that it takes",
    description:
      "For the past two years, I\u2019ve deliberately avoided a job title. I don\u2019t think of myself as a software developer, a designer, a growth marketer, or a product manager, because the work I do rarely fits neatly into one box. I\u2019ll do what needs doing: directly messaging prospective customers one by one, learning to be genuinely silly on social media, a 4 hour commute to in-person events in the Ontario suburbs to recruit our first users, or manually cleaning sensitive business data in a spreadsheet. The work that needs to be done is often unglamorous, but I do it anyways.",
    projects: [
      { name: "Commuting 4 hours to land pilot customers at niche events", description: "Travelled to the outskirts of Toronto to attend niche domain-specific events and land D2C pilot customers face to face.", icon: "/building-cursors/gluegun-icon.svg" },
      { name: "$90 Intermission", company: "Socratica", description: "Threw a Shopify-sponsored fashion show for under $90 by sourcing everything from the dollar store. tablecloths, pylon hats, lightsabers, and whatever else maximized fun for minimum cost.", icon: "/building-cursors/pylon-icon.svg" },
      { name: "Manually cleaning a legacy database to enable a system migration", company: "Alma Care", description: "When transitioning Alma Care to a new database, manually cleaned existing data. fixing incorrect columns, transforming open fields to proper data types, and filling missing values.", icon: "/building-cursors/sponge-icon.svg" },
    ],
    bgColor: "#F8FAFF",
    layout: "text-right",
    cursor: CURSORS.string, // initial; cycles on click
  },
];

// ---------------------------------------------------------------------------
// Scroll animation config
// ---------------------------------------------------------------------------

// Each segment is measured in viewport-heights of scroll room.
// "pause" = section is fully visible, user reads.
// "exit"/"enter" = sliding transition.
const SCROLL_SEGMENTS = [
  { id: "discovery-pause", vh: 0.6 },
  { id: "discovery-exit", vh: 1 },      // slides LEFT
  { id: "design-pause", vh: 0.6 },
  { id: "eng-enter", vh: 1 },           // slides in from LEFT
  { id: "eng-pause", vh: 0.6 },
  { id: "eng-exit", vh: 1 },            // slides RIGHT
  { id: "feedback-pause", vh: 0.6 },
  { id: "biz-enter", vh: 1 },           // slides in from BOTTOM
  { id: "biz-pause", vh: 0.6 },
  { id: "biz-exit", vh: 1 },            // exits TOP
  { id: "scrappy-pause", vh: 0.6 },
];

const TOTAL_VH = SCROLL_SEGMENTS.reduce((sum, s) => sum + s.vh, 0);

// Precompute segment boundaries as fractions of total scroll
const SEGMENT_BOUNDS = (() => {
  let cursor = 0;
  return SCROLL_SEGMENTS.map((s) => {
    const start = cursor / TOTAL_VH;
    cursor += s.vh;
    return { id: s.id, start, end: cursor / TOTAL_VH };
  });
})();

// Precompute boundary values for visibility switching
const ENG_PAUSE_END = SEGMENT_BOUNDS.find((s) => s.id === "eng-pause")!.end;
const BIZ_PAUSE_END = SEGMENT_BOUNDS.find((s) => s.id === "biz-pause")!.end;

function segmentProgress(scrollFraction: number, segmentId: string): number {
  const seg = SEGMENT_BOUNDS.find((s) => s.id === segmentId);
  if (!seg) return 0;
  if (scrollFraction <= seg.start) return 0;
  if (scrollFraction >= seg.end) return 1;
  return (scrollFraction - seg.start) / (seg.end - seg.start);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Tape design config & tuner
// ---------------------------------------------------------------------------

interface TapeConfig {
  fillColor: string;
  fillOpacity: number;
  height: number;
  borderRadius: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowOpacity: number;
}

const DEFAULT_TAPE_CONFIG: TapeConfig = {
  fillColor: "#e0e0e0",
  fillOpacity: 0.5,
  height: 28,
  borderRadius: 2,
  shadowX: 0,
  shadowY: 1,
  shadowBlur: 0,
  shadowOpacity: 0.05,
};

// ---------------------------------------------------------------------------
// Decoration design config
// ---------------------------------------------------------------------------

interface LayoutConfig {
  hero: { height: number; titleSize: number; imgWidth: number; imgHeight: number; imgMarginTop: number };
  section: { titleSize: number; subtitleSize: number; bodySize: number; tagSize: number; gapX: number; maxWidth: number };
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  hero: { height: 85, titleSize: 48, imgWidth: 500, imgHeight: 400, imgMarginTop: 90 },
  section: { titleSize: 44, subtitleSize: 20, bodySize: 16, tagSize: 13, gapX: 64, maxWidth: 1300 },
};

interface DecorationConfig {
  screw: { size: number; crossWidth: number; crossLength: number };
  staple: { width: number; height: number };
  stitch: { size: number; strokeWidth: number; dotRadius: number };
  tape: TapeConfig;
}

const DEFAULT_DECO_CONFIG: DecorationConfig = {
  screw: { size: 30, crossWidth: 5, crossLength: 20 },
  staple: { width: 28, height: 3 },
  stitch: { size: 20, strokeWidth: 2, dotRadius: 1.5 },
  tape: DEFAULT_TAPE_CONFIG,
};


// ---------------------------------------------------------------------------
// Decoration SVG renderer
// ---------------------------------------------------------------------------

// Builds a tape path with serrated left and right ends, straight top and bottom edges.
function buildSerratedPath(w: number, h: number, yTop: number, toothH: number): string {
  const yBot = yTop + h;
  const n = 3; // teeth per end cap
  const toothW = h / n;
  // Left end: zigzag from top-left to bottom-left
  let d = `M ${toothH} ${yTop}`;
  for (let i = 0; i < n; i++) {
    const y1 = yTop + i * toothW + toothW / 2;
    const y2 = yTop + (i + 1) * toothW;
    d += ` L 0 ${y1} L ${toothH} ${y2}`;
  }
  // Bottom edge: straight across
  d += ` L ${w - toothH} ${yBot}`;
  // Right end: zigzag from bottom-right to top-right
  for (let i = n; i > 0; i--) {
    const y1 = yTop + i * toothW - toothW / 2;
    const y2 = yTop + (i - 1) * toothW;
    d += ` L ${w} ${y1} L ${w - toothH} ${y2}`;
  }
  // Top edge: straight back
  d += ` L ${toothH} ${yTop} Z`;
  return d;
}

function TapeStrip({ x1, y1, x2, y2, config }: { x1: number; y1: number; x2: number; y2: number; config: TapeConfig }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 1) return null;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const pad = (config.height - 16) / 2;
  const svgH = config.height + 4;
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        filter: `drop-shadow(${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px rgba(0,0,0,${config.shadowOpacity}))`,
      }}
    >
      <svg width={length} height={svgH} viewBox={`0 0 ${length} ${svgH}`}>
        <path
          d={buildSerratedPath(length, config.height, 2 - pad, 3)}
          fill={config.fillColor}
          fillOpacity={config.fillOpacity}
        />
      </svg>
    </div>
  );
}

function DecorationSVG({ decoration, decoConfig }: { decoration: Decoration; decoConfig: DecorationConfig }) {
  if (decoration.type === "tape") {
    return <TapeStrip x1={decoration.x1} y1={decoration.y1} x2={decoration.x2} y2={decoration.y2} config={decoConfig.tape} />;
  }

  const style: React.CSSProperties = {
    position: "absolute",
    left: decoration.x,
    top: decoration.y,
    transform: `translate(-50%, -50%) rotate(${decoration.rotation}deg)`,
  };

  const uid = `d${decoration.id}`;

  switch (decoration.type) {
    case "nail":
      return (
        <div style={style}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="6" r="4" fill="#888" stroke="#666" strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="19" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "screw": {
      const sc = decoConfig.screw;
      const s = sc.size;
      const r = s / 2 - 1;
      const cw = sc.crossWidth;
      const cl = sc.crossLength;
      return (
        <div style={style}>
          <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
            <defs>
              <radialGradient id={`screwGrad-${uid}`} cx="40%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#d0d0d0" />
                <stop offset="60%" stopColor="#a0a0a0" />
                <stop offset="100%" stopColor="#606060" />
              </radialGradient>
            </defs>
            <circle cx={s / 2} cy={s / 2} r={r} fill={`url(#screwGrad-${uid})`} />
            <rect x={(s - cw) / 2} y={(s - cl) / 2} width={cw} height={cl} rx={1} fill="#101010" />
            <rect x={(s - cl) / 2} y={(s - cw) / 2} width={cl} height={cw} rx={1} fill="#101010" />
          </svg>
        </div>
      );
    }
    case "staple": {
      const st = decoConfig.staple;
      return (
        <div style={style}>
          <svg width={st.width} height={st.height} viewBox={`0 0 ${st.width} ${st.height}`}>
            <defs>
              <linearGradient id={`stapleGrad-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2B2B2B" />
                <stop offset="53%" stopColor="#919191" />
                <stop offset="100%" stopColor="#2B2B2B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={st.width} height={st.height} rx={st.height / 6} fill={`url(#stapleGrad-${uid})`} />
          </svg>
        </div>
      );
    }
    case "stitch": {
      const x = decoConfig.stitch;
      const s = x.size;
      const pad = 3 * (s / 20);
      return (
        <div style={style}>
          <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
            <line x1={pad} y1={pad} x2={s - pad} y2={s - pad} stroke="#8b1a1a" strokeWidth={x.strokeWidth} strokeLinecap="round" />
            <line x1={s - pad} y1={pad} x2={pad} y2={s - pad} stroke="#8b1a1a" strokeWidth={x.strokeWidth} strokeLinecap="round" />
            <circle cx={pad} cy={pad} r={x.dotRadius} fill="#3d0c0c" />
            <circle cx={s - pad} cy={pad} r={x.dotRadius} fill="#3d0c0c" />
            <circle cx={pad} cy={s - pad} r={x.dotRadius} fill="#3d0c0c" />
            <circle cx={s - pad} cy={s - pad} r={x.dotRadius} fill="#3d0c0c" />
          </svg>
        </div>
      );
    }
  }
}

function TapePreview({ anchor, stickyRef, decoConfig }: { anchor: { x: number; y: number }; stickyRef: React.RefObject<HTMLDivElement | null>; decoConfig: DecorationConfig }) {
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = stickyRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [stickyRef]);

  if (!mouse) return null;
  return <TapeStrip x1={anchor.x} y1={anchor.y} x2={mouse.x} y2={mouse.y} config={decoConfig.tape} />;
}

function CardPin({ tool }: { tool: ToolType }) {
  switch (tool) {
    case "nail":
      return (
        <div className="absolute left-1/2 z-10" style={{ top: -18, transform: "translateX(-50%)" }}>
          <svg width="14" height="20" viewBox="0 0 14 20">
            <circle cx="7" cy="5" r="4" fill="#888" stroke="#666" strokeWidth="1" />
            <line x1="7" y1="9" x2="7" y2="19" stroke="#666" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "staple":
      return (
        <div className="absolute left-1/2 z-10" style={{ top: -2, transform: "translateX(-50%)" }}>
          <svg width="32" height="3" viewBox="0 0 32 3">
            <defs>
              <linearGradient id="stapleGradPin" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2B2B2B" />
                <stop offset="53%" stopColor="#919191" />
                <stop offset="100%" stopColor="#2B2B2B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="32" height="3" rx="0.5" fill="url(#stapleGradPin)" />
          </svg>
        </div>
      );
    case "screw":
      return (
        <div className="absolute left-1/2 z-10" style={{ top: -12, transform: "translateX(-50%)" }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <defs>
              <radialGradient id="screwGradPin" cx="40%" cy="35%" r="55%">
                <stop offset="0%" stopColor="#d0d0d0" />
                <stop offset="60%" stopColor="#a0a0a0" />
                <stop offset="100%" stopColor="#606060" />
              </radialGradient>
            </defs>
            <circle cx="9" cy="9" r="8" fill="url(#screwGradPin)" />
            <rect x="6.5" y="3" width="5" height="12" rx="1" fill="#101010" />
            <rect x="3" y="6.5" width="12" height="5" rx="1" fill="#101010" />
          </svg>
        </div>
      );
    case "tape":
      return (
        <div className="absolute left-1/2 z-10" style={{ top: -10, transform: "translateX(-50%)", width: 52, height: 18, background: "rgba(210,198,175,0.55)", borderRadius: 2 }} />
      );
    case "stitch":
      return (
        <div className="absolute left-1/2 z-10" style={{ top: -14, transform: "translateX(-50%)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="2" x2="14" y2="14" stroke="#8b1a1a" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="#8b1a1a" strokeWidth="2" strokeLinecap="round" />
            <circle cx="2" cy="2" r="1.5" fill="#3d0c0c" />
            <circle cx="14" cy="2" r="1.5" fill="#3d0c0c" />
            <circle cx="2" cy="14" r="1.5" fill="#3d0c0c" />
            <circle cx="14" cy="14" r="1.5" fill="#3d0c0c" />
          </svg>
        </div>
      );
  }
}

function SectionDecorationOverlay({
  sectionId,
  decorations,
  pendingTape,
  stickyRef,
  decoConfig,
}: {
  sectionId: string;
  decorations: Decoration[];
  pendingTape: { x: number; y: number; sectionId: string } | null;
  stickyRef: React.RefObject<HTMLDivElement | null>;
  decoConfig: DecorationConfig;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {decorations.map((d) => (
        <DecorationSVG key={d.id} decoration={d} decoConfig={decoConfig} />
      ))}
      {pendingTape?.sectionId === sectionId && (
        <TapePreview anchor={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wooden frame + discovery mosaic
// ---------------------------------------------------------------------------

function TapedImage({ label, src }: { label: string; src?: string }) {
  const cfg = DEFAULT_TAPE_CONFIG; // height=28, fillColor="#e0e0e0", fillOpacity=0.5
  const tapeW = 80;
  const pad = (cfg.height - 16) / 2; // = 6
  const svgH = cfg.height + 4; // = 32
  const yTop = 2 - pad; // = -4 (matches TapeStrip exactly)
  return (
    <div className="relative">
      {/* Tape. identical rendering to TapeStrip */}
      <div className="absolute left-1/2 z-10" style={{ top: -(svgH / 2), transform: "translateX(-50%)", filter: `drop-shadow(${cfg.shadowX}px ${cfg.shadowY}px ${cfg.shadowBlur}px rgba(0,0,0,${cfg.shadowOpacity}))` }}>
        <svg width={tapeW} height={svgH} viewBox={`0 0 ${tapeW} ${svgH}`}>
          <path d={buildSerratedPath(tapeW, cfg.height, yTop, 3)} fill={cfg.fillColor} fillOpacity={cfg.fillOpacity} />
        </svg>
      </div>
      <div style={{ filter: "drop-shadow(2px 4px 5px rgba(0,0,0,0.15)) drop-shadow(0px 1px 2px rgba(0,0,0,0.08))" }}>
        {src
          ? <img src={src} alt={label} className="w-full h-auto block" style={{ borderRadius: 6 }} />
          : <div className="w-full aspect-[4/3] bg-foreground/5 border border-dashed border-foreground/15 flex items-end p-3" style={{ borderRadius: 6 }}>
              <p className="italic font-[family-name:var(--font-fanwood-text)] text-foreground/40" style={{ fontSize: 12 }}>{label}</p>
            </div>
        }
      </div>
    </div>
  );
}

function FeedbackMosaic() {
  return (
    <div className="relative w-full flex flex-col gap-3">
    <div className="flex px-12" style={{ gap: 32 }}>
      {/* Left column */}
      <div className="flex flex-col gap-12" style={{ flex: "0 0 51%", paddingTop: "13%" }}>
        <TapedImage label="OutschoolMetrics" src="/building-images/feedback-1.png" />
        <div style={{ paddingLeft: "6%", paddingRight: "6%" }}>
          <TapedImage label="QualFeedback" src="/building-images/feedback-3.png" />
        </div>
      </div>
      {/* Right column */}
      <div className="flex flex-col gap-10" style={{ flex: "1" }}>
        <TapedImage label="SocraticaSurvey" src="/building-images/feedback-2.png" />
        <TapedImage label="QuantFeedback" src="/building-images/feedback-4.png" />
      </div>
    </div>
    <p className="px-12 font-[family-name:var(--font-fanwood-text)]" style={{ fontSize: 11, opacity: 0.9, fontStyle: "italic" }}>
      * all data was recreated with fake placeholders
    </p>
    </div>
  );
}

const SCREW_SIZE = 20;
const SCREW_INSET = 26; // distance from edge to screw center

function CornerScrew({ uid }: { uid: string }) {
  const s = SCREW_SIZE;
  const safeUid = uid.replace(/\s+/g, "-");
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <defs>
        <radialGradient id={`screwGradCorner-${safeUid}`} cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#d0d0d0" />
          <stop offset="60%" stopColor="#a0a0a0" />
          <stop offset="100%" stopColor="#606060" />
        </radialGradient>
      </defs>
      <circle cx={s / 2} cy={s / 2} r={s / 2 - 0.5} fill={`url(#screwGradCorner-${safeUid})`} />
      <rect x={(s - 4) / 2} y={(s - 10) / 2} width={4} height={10} rx={0.5} fill="#101010" />
      <rect x={(s - 10) / 2} y={(s - 4) / 2} width={10} height={4} rx={0.5} fill="#101010" />
    </svg>
  );
}

function ScrewedImage({ label, src }: { label: string; src?: string }) {
  const o = SCREW_INSET - SCREW_SIZE / 2; // positions screw center at SCREW_INSET from edge
  return (
    <div className="relative" style={{ filter: "drop-shadow(2px 4px 5px rgba(0,0,0,0.18)) drop-shadow(0px 1px 2px rgba(0,0,0,0.10))" }}>
      <div style={{ borderRadius: 6, overflow: "hidden" }}>
        {src
          ? <img src={src} alt={label} className="w-full h-auto block" />
          : <div className="w-full aspect-[4/3] bg-foreground/5 border border-dashed border-foreground/15 flex items-end p-3">
              <p className="italic font-[family-name:var(--font-fanwood-text)] text-foreground/40" style={{ fontSize: 12 }}>{label}</p>
            </div>
        }
      </div>
      <div className="absolute z-10" style={{ top: o, left: o }}><CornerScrew uid={`${label}-tl`} /></div>
      <div className="absolute z-10" style={{ top: o, right: o }}><CornerScrew uid={`${label}-tr`} /></div>
      <div className="absolute z-10" style={{ bottom: o, left: o }}><CornerScrew uid={`${label}-bl`} /></div>
      <div className="absolute z-10" style={{ bottom: o, right: o }}><CornerScrew uid={`${label}-br`} /></div>
    </div>
  );
}

function EngineeringMosaic() {
  return (
    <div className="relative w-full flex flex-col px-10" style={{ gap: 38 }}>
      <div style={{ paddingRight: "25%" }}>
        <ScrewedImage label="KindredMVP" src="/building-images/engineering-1.png" />
      </div>
      <div style={{ paddingLeft: "37%" }}>
        <ScrewedImage label="ArchDiagram" src="/building-images/engineering-2.png" />
      </div>
    </div>
  );
}

function PinnedImage({ label, aspectRatio = "4/3", src, rotate = 0 }: { label: string; aspectRatio?: string; src?: string; rotate?: number }) {
  return (
    <div className="relative pt-5" style={{ transform: `rotate(${rotate}deg)` }}>
      {/* Nail. sits on top of image */}
      <div className="absolute left-1/2 z-10" style={{ top: 10, transform: "translateX(-50%)" }}>
        <svg width="14" height="20" viewBox="0 0 14 20">
          <circle cx="7" cy="5" r="4" fill="#888" stroke="#666" strokeWidth="1" />
          <line x1="7" y1="9" x2="7" y2="19" stroke="#666" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {/* Image */}
      <div style={{ filter: "drop-shadow(2px 4px 5px rgba(0,0,0,0.18)) drop-shadow(0px 1px 2px rgba(0,0,0,0.10))" }}>
        {src
          ? <img src={src} alt={label} className="w-full h-auto block" style={{ borderRadius: 6 }} />
          : <div className="w-full aspect-[4/3] bg-foreground/5 border border-dashed border-foreground/15 flex items-end p-3">
              <p className="italic font-[family-name:var(--font-fanwood-text)] text-foreground/40" style={{ fontSize: 12 }}>{label}</p>
            </div>
        }
      </div>
    </div>
  );
}


function StapledImage({ label, src, staplePositions = [0.5] }: {
  label: string;
  src?: string;
  staplePositions?: number[];
}) {
  const safeId = label.replace(/\s+/g, "-");
  return (
    <div className="relative">
      {staplePositions.map((pos, i) => (
        <div key={i} className="absolute z-10" style={{ top: 10, left: `${pos * 100}%`, transform: "translateX(-50%)" }}>
          <svg width="32" height="3" viewBox="0 0 32 3">
            <defs>
              <linearGradient id={`stapleGradDM-${safeId}-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2B2B2B" />
                <stop offset="53%" stopColor="#919191" />
                <stop offset="100%" stopColor="#2B2B2B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="32" height="3" rx="0.5" fill={`url(#stapleGradDM-${safeId}-${i})`} />
          </svg>
        </div>
      ))}
      <div style={{ filter: "drop-shadow(2px 4px 5px rgba(0,0,0,0.18)) drop-shadow(0px 1px 2px rgba(0,0,0,0.10))" }}>
        {src
          ? <img src={src} alt={label} className="w-full h-auto block" style={{ borderRadius: 6 }} />
          : <div className="w-full aspect-[4/3] bg-foreground/5 border border-dashed border-foreground/15 flex items-end p-3">
              <p className="italic font-[family-name:var(--font-fanwood-text)] text-foreground/40" style={{ fontSize: 12 }}>{label}</p>
            </div>
        }
      </div>
    </div>
  );
}

function DesignMosaic() {
  return (
    <div className="relative w-full flex flex-col px-2" style={{ gap: 30 }}>
      {/* Top row */}
      <div className="flex items-end" style={{ gap: 30, paddingLeft: "6%", paddingRight: "6%" }}>
        <div style={{ flex: "0 0 65%" }}>
          <StapledImage label="KindredCarePlan" src="/building-images/design-1.png" staplePositions={[0.28, 0.72]} />
        </div>
        <div style={{ flex: "1" }}>
          <StapledImage label="EventPoster" src="/building-images/design-2.png" staplePositions={[0.5]} />
        </div>
      </div>
      {/* Bottom row */}
      <div className="flex items-start" style={{ gap: 30 }}>
        <div style={{ flex: "0 0 21%" }}>
          <StapledImage label="DesignWork3" src="/building-images/design-3.png" staplePositions={[0.5]} />
        </div>
        <div style={{ flex: "0 0 30%" }}>
          <StapledImage label="DesignWork4" src="/building-images/design-4.png" staplePositions={[0.5]} />
        </div>
        <div style={{ flex: "1" }}>
          <StapledImage label="DesignWork5" src="/building-images/design-5.png" staplePositions={[0.28, 0.72]} />
        </div>
      </div>
    </div>
  );
}

// Deterministic jitter. no random(), stays stable across renders
function jitter(seed: number, amp: number) {
  return (Math.sin(seed * 3.7 + 1.3) * 0.5 + Math.sin(seed * 1.1 + 0.7) * 0.5) * amp;
}

function buildBorderStitches(w: number, h: number, spacing: number, inset: number) {
  const stitches: { x: number; y: number; rot: number }[] = [];
  const hCount = Math.max(2, Math.round((w - 2 * inset) / spacing) + 1);
  const vCount = Math.max(2, Math.round((h - 2 * inset) / spacing) + 1);
  const hStep = (w - 2 * inset) / (hCount - 1);
  const vStep = (h - 2 * inset) / (vCount - 1);
  let idx = 0;
  for (let i = 0; i < hCount; i++, idx++) stitches.push({ x: inset + i * hStep + jitter(idx, 1.5), y: inset + jitter(idx + 0.5, 1.5), rot: 0 });
  for (let i = 1; i < vCount; i++, idx++) stitches.push({ x: w - inset + jitter(idx, 1.5), y: inset + i * vStep + jitter(idx + 0.5, 1.5), rot: 0 });
  for (let i = hCount - 2; i >= 0; i--, idx++) stitches.push({ x: inset + i * hStep + jitter(idx, 1.5), y: h - inset + jitter(idx + 0.5, 1.5), rot: 0 });
  for (let i = vCount - 2; i >= 1; i--, idx++) stitches.push({ x: inset + jitter(idx, 1.5), y: inset + i * vStep + jitter(idx + 0.5, 1.5), rot: 0 });
  return stitches;
}

function StitchedImage({ label, src }: { label: string; src?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const STITCH_SIZE = 9;
  const stitches = dims ? buildBorderStitches(dims.w, dims.h, 18, 0) : [];

  return (
    <div ref={wrapRef} className="relative">
      <div style={{ borderRadius: 6, overflow: "hidden" }}>
        {src
          ? <img src={src} alt={label} className="w-full h-auto block" />
          : <div className="w-full aspect-[4/3] bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
              <span className="text-sm text-foreground/30">Image / Collage</span>
            </div>
        }
      </div>
      {dims && (
        <svg className="absolute inset-0 pointer-events-none" width={dims.w} height={dims.h} style={{ zIndex: 10, overflow: "visible" }}>
          {stitches.map((pt, i) => {
            const s = STITCH_SIZE / 2;
            return (
              <g key={i}>
                <line x1={pt.x - s} y1={pt.y - s} x2={pt.x + s} y2={pt.y + s} stroke="#8b1a1a" strokeWidth="1.5" strokeLinecap="round" />
                <line x1={pt.x + s} y1={pt.y - s} x2={pt.x - s} y2={pt.y + s} stroke="#8b1a1a" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx={pt.x - s} cy={pt.y - s} r="1.2" fill="#3d0c0c" />
                <circle cx={pt.x + s} cy={pt.y - s} r="1.2" fill="#3d0c0c" />
                <circle cx={pt.x - s} cy={pt.y + s} r="1.2" fill="#3d0c0c" />
                <circle cx={pt.x + s} cy={pt.y + s} r="1.2" fill="#3d0c0c" />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

function BusinessMosaic() {
  return (
    <div className="relative w-full flex flex-col gap-3" style={{ paddingLeft: 32, paddingRight: 32 }}>
      <StitchedImage label="Outschool Positioning" src="/building-images/business-1.png" />
      <p className="font-[family-name:var(--font-fanwood-text)]" style={{ fontSize: 11, opacity: 0.9, fontStyle: "italic", marginTop: 8 }}>
        * all data was recreated with fake placeholders
      </p>
    </div>
  );
}

function ScrappinessMosaic() {
  return (
    <div className="relative w-full flex flex-col gap-6 px-4">
      {/* Row 1: taped */}
      <div style={{ paddingLeft: "10%", paddingRight: "10%" }}>
        <TapedImage label="HudZah shoutout" src="/building-images/scrappy-1.png" />
      </div>
      {/* Row 2: pinned (left) + screwed (right) */}
      <div className="flex gap-6 items-start">
        <div style={{ flex: "0 0 63%", transform: "rotate(-3.5deg)" }}>
          <PinnedImage label="Socratica review" src="/building-images/scrappy-2.png" rotate={0} />
        </div>
        <div style={{ flex: "1", paddingTop: "8%", transform: "rotate(4deg)" }}>
          <ScrewedImage label="Rachel beast mode" src="/building-images/scrappy-3.png" />
        </div>
      </div>
      {/* Row 3: stapled */}
      <div style={{ paddingLeft: "11%", paddingRight: "11%" }}>
        <StapledImage label="Farewell messages" src="/building-images/scrappy-4.png" staplePositions={[0.3, 0.7]} />
      </div>
    </div>
  );
}

function DiscoveryMosaic() {
  return (
    <div className="relative w-full px-4" style={{ display: "grid", gridTemplateColumns: "59fr 41fr", columnGap: 36, rowGap: 20 }}>
      {/* discovery-1: large anchor, top-left */}
      <PinnedImage label="Sun Life Interviews" src="/building-images/discovery-1.png" rotate={0} />
      {/* discovery-3: small, top-right. bottom-aligned */}
      <div style={{ alignSelf: "end", width: "92%" }}>
        <PinnedImage label="Wygo interviews" src="/building-images/discovery-3.png" rotate={0} />
      </div>
      {/* discovery-2: small, bottom-left. right-justified */}
      <div style={{ alignSelf: "start", width: "87%", marginLeft: "auto" }}>
        <PinnedImage label="Outschool research" src="/building-images/discovery-2.png" rotate={0} />
      </div>
      {/* discovery-4: large anchor, bottom-right */}
      <PinnedImage label="Alma Care workflows" src="/building-images/discovery-4.png" rotate={0} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section panel component
// ---------------------------------------------------------------------------

function SectionPanel({
  section,
  cursorOverride,
  onAfterDecoration,
  stickyRef,
  addDecoration,
  layoutConfig,
  imageContent,
}: {
  section: SectionData;
  cursorOverride?: string;
  onAfterDecoration?: (tool: ToolType, x: number, y: number, result: "started" | "completed" | "placed") => void;
  stickyRef?: React.RefObject<HTMLDivElement | null>;
  addDecoration?: (tool: ToolType, x: number, y: number, sectionId: string) => "started" | "completed" | "placed";
  imageContent?: React.ReactNode;
  layoutConfig?: LayoutConfig["section"];
}) {
  const isTextLeft = section.layout === "text-left";
  const cursorSvg = cursorOverride ?? section.cursor;
  const lc = layoutConfig ?? DEFAULT_LAYOUT_CONFIG.section;

  const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (stickyRef?.current && addDecoration) {
      const rect = stickyRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const tool = TOOL_FOR_CURSOR[cursorSvg];
      if (tool) {
        const result = addDecoration(tool, x, y, section.id);
        onAfterDecoration?.(tool, x, y, result);
      }
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col justify-center px-8 sm:px-12 md:px-16"
      style={{
        backgroundColor: section.bgColor,
        cursor: `url('${cursorSvg}') 24 24, auto`,
      }}
      onClick={handleClick}
    >
      <div
        className={`flex flex-col md:flex-row items-center mx-auto w-full ${isTextLeft ? "" : "md:flex-row-reverse"}`}
        style={{ gap: lc.gapX, maxWidth: lc.maxWidth }}
      >
        {/* Text column */}
        <div className="flex-1 min-w-0">
          <h2
            className="font-normal mb-1 font-[family-name:var(--font-fanwood-text)]"
            style={{ fontSize: lc.titleSize, lineHeight: 1.1 }}
          >
            {section.title}
          </h2>
          <p
            className="italic text-foreground/80 mb-8 font-[family-name:var(--font-fanwood-text)]"
            style={{ fontSize: lc.subtitleSize }}
          >
            {section.subtitle}
          </p>
          <p className="leading-relaxed mb-6 font-[family-name:var(--font-lora)]" style={{ fontSize: lc.bodySize }}>
            {section.description}
          </p>

          {/* Project callouts */}
          {section.projects.length > 0 && (
            <div>
              {section.projects.map((project, i) => (
                <div key={`${project.name}-${i}`} className="flex items-start gap-4 py-4 border-t border-foreground/10 first:border-t-0">
                  {/* Image */}
                  {project.icon
                    ? <img src={project.icon} alt="" className="shrink-0 object-contain" style={{ width: 56, height: 56, filter: "drop-shadow(0px 2px 1px rgba(0,0,0,0.25))" }} />
                    : <div className="shrink-0 rounded bg-foreground/8 border border-foreground/10" style={{ width: 56, height: 56 }} />
                  }
                  <div>
                    <p
                      className="font-semibold font-[family-name:var(--font-lora)] mb-1"
                      style={{ fontSize: lc.bodySize }}
                    >
                      {project.name}{project.company && <span className="font-normal"> | {project.company}</span>}
                    </p>
                    <p
                      className="font-[family-name:var(--font-lora)] text-foreground/75 leading-snug"
                      style={{ fontSize: lc.bodySize }}
                    >
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="flex-1 min-w-0 hidden md:flex items-center justify-center">
          {imageContent ?? (
            <div className="w-full max-w-md aspect-[4/3] rounded-lg bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
              <span className="text-sm text-foreground/30">Image / Collage</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function BuildingPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);

  // Scrappiness cursor cycles through all cursors on click
  const [scrappyCursorIdx, setScrappyCursorIdx] = useState(0);

  const decoConfig = DEFAULT_DECO_CONFIG;
  const layoutConfig = DEFAULT_LAYOUT_CONFIG;

  // Decoration state. keyed by section ID so decorations stay with their section
  const [decorations, setDecorations] = useState<Record<string, Decoration[]>>({});
  const [pendingTape, setPendingTape] = useState<{ x: number; y: number; sectionId: string } | null>(null);
  // Ref so addDecoration can read current pendingTape synchronously and return a result
  const pendingTapeRef = useRef(pendingTape);
  pendingTapeRef.current = pendingTape;

  const addDecoration = useCallback((tool: ToolType, x: number, y: number, sectionId: string): "started" | "completed" | "placed" => {
    if (tool === "tape") {
      const prev = pendingTapeRef.current;
      if (prev && prev.sectionId === sectionId) {
        setDecorations((d) => ({
          ...d,
          [sectionId]: [
            ...(d[sectionId] ?? []),
            { id: nextDecorationId++, type: "tape", x1: prev.x, y1: prev.y, x2: x, y2: y },
          ],
        }));
        setPendingTape(null);
        return "completed";
      } else {
        setPendingTape({ x, y, sectionId });
        return "started";
      }
    } else {
      const rotation = (Math.random() - 0.5) * 30; // ±15°
      setDecorations((d) => ({
        ...d,
        [sectionId]: [
          ...(d[sectionId] ?? []),
          { id: nextDecorationId++, type: tool, x, y, rotation },
        ],
      }));
      return "placed";
    }
  }, []);

  const handleAfterDecoration = useCallback((_tool: ToolType, _x: number, _y: number, _result: "started" | "completed" | "placed") => {
    // no-op. placeholder for per-tool callbacks
  }, []);

  const handleScrappyAfterDecoration = useCallback((tool: ToolType, x: number, y: number, result: "started" | "completed" | "placed") => {
    handleAfterDecoration(tool, x, y, result);
    if (result !== "started") {
      setScrappyCursorIdx((prev) => (prev + 1) % ALL_CURSORS.length);
    }
  }, [handleAfterDecoration]);

  // Cancel pending tape on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingTape(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Store transforms in refs to avoid re-renders. apply directly to DOM
  const discoveryRef = useRef<HTMLDivElement>(null);
  const engineeringRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const scrappinessRef = useRef<HTMLDivElement>(null);

  const updateTransforms = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollRoom = container.offsetHeight - window.innerHeight;
    if (scrollRoom <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollRoom));

    // --- Slider transforms ---

    // Discovery: slides LEFT
    const discoveryT = easeInOutCubic(segmentProgress(progress, "discovery-exit"));
    if (discoveryRef.current) {
      discoveryRef.current.style.transform = `translateX(${-100 * discoveryT}%)`;
    }

    // Engineering: slides in from LEFT, then slides out RIGHT
    const engEnterT = easeInOutCubic(segmentProgress(progress, "eng-enter"));
    const engExitT = easeInOutCubic(segmentProgress(progress, "eng-exit"));
    if (engineeringRef.current) {
      if (engExitT > 0) {
        engineeringRef.current.style.transform = `translateX(${100 * engExitT}%)`;
      } else {
        engineeringRef.current.style.transform = `translateX(${-100 + 100 * engEnterT}%)`;
      }
    }

    // Business Sense: slides in from BOTTOM, then exits TOP
    const bizEnterT = easeInOutCubic(segmentProgress(progress, "biz-enter"));
    const bizExitT = easeInOutCubic(segmentProgress(progress, "biz-exit"));
    if (businessRef.current) {
      if (bizExitT > 0) {
        businessRef.current.style.transform = `translateY(${-100 * bizExitT}%)`;
      } else {
        businessRef.current.style.transform = `translateY(${100 - 100 * bizEnterT}%)`;
      }
    }

    // --- Base layer visibility ---
    // Only the relevant "reveal" section should be visible at a given time.
    // Design: visible while Discovery is exiting and before Engineering covers it
    // Feedback: visible while Engineering is exiting and before Business covers it
    // Scrappiness: visible after Business exits

    const showDesign = progress < ENG_PAUSE_END;
    const showFeedback = progress >= ENG_PAUSE_END && progress < BIZ_PAUSE_END;
    const showScrappiness = progress >= BIZ_PAUSE_END;

    if (designRef.current) designRef.current.style.visibility = showDesign ? "visible" : "hidden";
    if (feedbackRef.current) feedbackRef.current.style.visibility = showFeedback ? "visible" : "hidden";
    if (scrappinessRef.current) scrappinessRef.current.style.visibility = showScrappiness ? "visible" : "hidden";
  }, []);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateTransforms);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial position
    updateTransforms();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [updateTransforms]);

  return (
    <FaceLayout faceId="building" className="bg-[#F8FAFF]">
      {/* Hero with slanted bottom section */}
      <div
        className="relative overflow-hidden"
        style={{ height: `calc(var(--real-vh, 1vh) * ${layoutConfig.hero.height})`, marginBottom: -3 }}
      >
        {/* Slanted background. full-hero SVG so height is inherited from parent, not recalculated */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="0,58 100,78 100,103 0,103" fill="#F2B188" />
        </svg>

        {/* Content. centered over both backgrounds */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4" style={{ lineHeight: 1.15 }}>
          <p
            className="font-[family-name:var(--font-fanwood-text)]"
            style={{ fontSize: layoutConfig.hero.titleSize }}
          >
            I figure out what&apos;s valuable, then build it
          </p>
          <p
            className="italic font-[family-name:var(--font-fanwood-text)]"
            style={{ fontSize: layoutConfig.hero.titleSize }}
          >
            using whatever tools it takes.
          </p>

          {/* Toolbox. straddles the slant boundary */}
          <img
            src="/building-hero.svg"
            alt="Toolbox"
            className="mx-auto object-contain drop-shadow-[1px_4px_4px_rgba(0,0,0,0.25)]"
            style={{
              width: layoutConfig.hero.imgWidth * 1.3,
              height: layoutConfig.hero.imgHeight * 1.3,
              marginTop: layoutConfig.hero.imgMarginTop,
            }}
          />
        </div>
      </div>

      {/* Scroll-driven sections */}
      <div
        ref={scrollContainerRef}
        style={{ height: `calc(var(--real-vh, 1vh) * ${(TOTAL_VH + 1) * 100})` }}
      >
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen overflow-hidden"
        >
          {/* Base layers (revealed underneath sliders). only one visible at a time */}
          <div ref={designRef} className="absolute inset-0" style={{ zIndex: 10, visibility: "hidden" }}>
            <SectionPanel section={SECTIONS[1]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} imageContent={<DesignMosaic />} />
            <SectionDecorationOverlay sectionId="design" decorations={decorations["design"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={feedbackRef} className="absolute inset-0" style={{ zIndex: 10, visibility: "hidden" }}>
            <SectionPanel section={SECTIONS[3]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} imageContent={<FeedbackMosaic />} />
            <SectionDecorationOverlay sectionId="feedback-systems" decorations={decorations["feedback-systems"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={scrappinessRef} className="absolute inset-0" style={{ zIndex: 10, visibility: "hidden" }}>
            <SectionPanel
              section={SECTIONS[5]}
              cursorOverride={ALL_CURSORS[scrappyCursorIdx]}
              onAfterDecoration={handleScrappyAfterDecoration}
              stickyRef={stickyRef}
              addDecoration={addDecoration}
              layoutConfig={layoutConfig.section}
              imageContent={<ScrappinessMosaic />}
            />
            <SectionDecorationOverlay sectionId="scrappiness" decorations={decorations["scrappiness"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>

          {/* Slider layers. animate over the base layers */}
          <div ref={discoveryRef} className="absolute inset-0" style={{ zIndex: 30 }}>
            <SectionPanel section={SECTIONS[0]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} imageContent={<DiscoveryMosaic />} />
            <SectionDecorationOverlay sectionId="discovery" decorations={decorations["discovery"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={engineeringRef} className="absolute inset-0" style={{ zIndex: 20, transform: "translateX(-100%)" }}>
            <SectionPanel section={SECTIONS[2]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} imageContent={<EngineeringMosaic />} />
            <SectionDecorationOverlay sectionId="engineering" decorations={decorations["engineering"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={businessRef} className="absolute inset-0" style={{ zIndex: 20, transform: "translateY(100%)" }}>
            <SectionPanel section={SECTIONS[4]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} imageContent={<BusinessMosaic />} />
            <SectionDecorationOverlay sectionId="business-sense" decorations={decorations["business-sense"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>

        </div>
      </div>

    </FaceLayout>
  );
}
