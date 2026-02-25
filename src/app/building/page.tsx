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
  tags: { discipline: string; labels: string[] }[];
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
    subtitle: "the secret weapon of doing great work",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
    bgColor: "#F2B188",
    layout: "text-left",
    cursor: CURSORS.hammer,
  },
  {
    id: "design",
    title: "Design",
    subtitle: "the sum of hundreds of small decisions",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
    bgColor: "#F8FAFF",
    layout: "text-right",
    cursor: CURSORS.tapeRoll,
  },
  {
    id: "engineering",
    title: "Engineering",
    subtitle: "AI-native development from technical foundations",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
    bgColor: "#D7D9DC",
    layout: "text-left",
    cursor: CURSORS.screwdriver,
  },
  {
    id: "feedback-systems",
    title: "Feedback Systems",
    subtitle: "compounding what works, sunsetting what doesn\u2019t",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
    bgColor: "#F8FAFF",
    layout: "text-right",
    cursor: CURSORS.staples,
  },
  {
    id: "business-sense",
    title: "Business Sense",
    subtitle: "creating value, not just products",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
    bgColor: "#F2BDB4",
    layout: "text-left",
    cursor: CURSORS.string,
  },
  {
    id: "scrappiness",
    title: "Scrappiness",
    subtitle: "everything else that it takes",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
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
  section: { titleSize: 52, subtitleSize: 20, bodySize: 18, tagSize: 14, gapX: 64, maxWidth: 1332 },
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
// Section panel component
// ---------------------------------------------------------------------------

function SectionPanel({
  section,
  cursorOverride,
  onAfterDecoration,
  stickyRef,
  addDecoration,
  layoutConfig,
}: {
  section: SectionData;
  cursorOverride?: string;
  onAfterDecoration?: (tool: ToolType, x: number, y: number, result: "started" | "completed" | "placed") => void;
  stickyRef?: React.RefObject<HTMLDivElement | null>;
  addDecoration?: (tool: ToolType, x: number, y: number, sectionId: string) => "started" | "completed" | "placed";
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
      className="h-full w-full flex flex-col justify-center px-6 sm:px-12 md:px-20"
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
            className="font-normal mb-2 font-[family-name:var(--font-fanwood-text)]"
            style={{ fontSize: lc.titleSize }}
          >
            {section.title}
          </h2>
          <p
            className="italic text-foreground/60 mb-6 font-[family-name:var(--font-metal)]"
            style={{ fontSize: lc.subtitleSize }}
          >
            {section.subtitle}
          </p>
          <p className="leading-relaxed mb-6" style={{ fontSize: lc.bodySize }}>
            {section.description}
          </p>
          {section.tags.length > 0 && (
            <div className="space-y-2">
              {section.tags.map((group) => (
                <div key={group.discipline} className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold uppercase tracking-wide" style={{ fontSize: lc.tagSize }}>
                    {group.discipline}
                  </span>
                  {group.labels.map((label, i) => (
                    <span
                      key={`${label}-${i}`}
                      className="px-2 py-0.5 rounded-full border border-foreground/20 bg-foreground/5"
                      style={{ fontSize: lc.tagSize }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image placeholder */}
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="w-full max-w-md aspect-[4/3] rounded-lg bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
            <span className="text-sm text-foreground/30">Image / Collage</span>
          </div>
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

  // Decoration state — keyed by section ID so decorations stay with their section
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
    // no-op — placeholder for per-tool callbacks
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

  // Store transforms in refs to avoid re-renders — apply directly to DOM
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
        {/* Slanted background — full-hero SVG so height is inherited from parent, not recalculated */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon points="0,62 100,73 100,103 0,103" fill="#F2B188" />
        </svg>

        {/* Content — centered over both backgrounds */}
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

          {/* Toolbox — straddles the slant boundary */}
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
          {/* Base layers (revealed underneath sliders) — only one visible at a time */}
          <div ref={designRef} className="absolute inset-0" style={{ zIndex: 10, visibility: "hidden" }}>
            <SectionPanel section={SECTIONS[1]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} />
            <SectionDecorationOverlay sectionId="design" decorations={decorations["design"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={feedbackRef} className="absolute inset-0" style={{ zIndex: 10, visibility: "hidden" }}>
            <SectionPanel section={SECTIONS[3]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} />
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
            />
            <SectionDecorationOverlay sectionId="scrappiness" decorations={decorations["scrappiness"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>

          {/* Slider layers — animate over the base layers */}
          <div ref={discoveryRef} className="absolute inset-0" style={{ zIndex: 30 }}>
            <SectionPanel section={SECTIONS[0]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} />
            <SectionDecorationOverlay sectionId="discovery" decorations={decorations["discovery"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={engineeringRef} className="absolute inset-0" style={{ zIndex: 20, transform: "translateX(-100%)" }}>
            <SectionPanel section={SECTIONS[2]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} />
            <SectionDecorationOverlay sectionId="engineering" decorations={decorations["engineering"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>
          <div ref={businessRef} className="absolute inset-0" style={{ zIndex: 20, transform: "translateY(100%)" }}>
            <SectionPanel section={SECTIONS[4]} onAfterDecoration={handleAfterDecoration} stickyRef={stickyRef} addDecoration={addDecoration} layoutConfig={layoutConfig.section} />
            <SectionDecorationOverlay sectionId="business-sense" decorations={decorations["business-sense"] ?? []} pendingTape={pendingTape} stickyRef={stickyRef} decoConfig={decoConfig} />
          </div>

        </div>
      </div>
    </FaceLayout>
  );
}
