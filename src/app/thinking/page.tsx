"use client";

import Image from "next/image";
import FaceLayout from "@/components/FaceLayout";
import AlternatingSection, { type TunerStyles } from "@/components/AlternatingSection";
import DesignTuner, { useDesignTuner, type TunerProperty } from "@/components/DesignTuner";

const TITLE_SIZE = 28;
const TEXT_SIZE = 20;
const LINE_HEIGHT = 1.6;
const PAGE_MAX_WIDTH = 1200;

interface ThinkingTool {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  layout?: "alternating" | "three-column" | "three-column-with-intro";
  introText?: string;
  outroText?: string;
  columns?: {
    title?: string;
    description: string;
    imageSrc?: string;
    imageWidth?: number;
    imageScale?: number;
    imageOffsetY?: number;
    gap?: number;
  }[];
  styles?: {
    sectionPy?: number;
    gap?: number;
    textWidth?: number;
    imageScale?: number;
    imageOffsetY?: number;
  };
}

const THINKING_TOOLS: ThinkingTool[] = [
  {
    id: "systems-thinking",
    title: "Systems Thinking",
    description:
      "Complex problems are fun to solve. Systems thinking, which models how interconnected elements behave, helps me understand them and identify opportunities for outsized impact.",
    imageSrc: "/thinking-diagrams/systems-thinking.png",
    imageWidth: 400,
    styles: { sectionPy: 40, gap: 52, imageScale: 120 },
  },
  {
    id: "divergent-goals",
    title: "Divergent Goals",
    description:
      "Divergent goals are broad directions that allow for many pathways and end-states. They can't be failed, only pursued. It rewards me for making progress now instead of overprescribing the future.",
    imageSrc: "/thinking-diagrams/divergent-goals.png",
    imageWidth: 350,
    styles: { sectionPy: 32, gap: 44, imageScale: 120, imageOffsetY: -10 },
  },
  {
    id: "mapping",
    title: "Mapping",
    description:
      "Mapping starts with clearly articulating the fundamental goals. Then, every decision is measured against these goals. If it aligns, keep it. If not, cut it. As the decision tree grows, continue comparing alignment all the way back up the hierarchy. Mapping enforces my focus.",
    imageSrc: "/thinking-diagrams/mapping.png",
    imageWidth: 400,
    styles: { textWidth: 56, imageScale: 90, imageOffsetY: -20 },
  },
  {
    id: "deduction-and-induction",
    title: "Deduction and Induction",
    description:
      "Deduction and induction are two fundamental types of reasoning.\n\nDeduction takes a top-down idea and through hypothesis-led experiments, tests its validity. I use deduction when I have conviction. It lets me push out what I believe should be true and see if it really is.\n\nInduction gathers raw evidence and pulls out patterns to form a broader theory. I use induction when I need inspiration. I'm pulling in what is already true at a small scale, and using that to springboard my thinking in new directions.",
    imageSrc: "/thinking-diagrams/deduction-and-induction.png",
    imageWidth: 380,
    styles: { gap: 56, textWidth: 56 },
  },
  {
    id: "triangulation",
    title: "Triangulation",
    description:
      "Triangulation uses multiple forms of diverse evidence to increase confidence in a conclusion. The variation can be in what data we gather, where it comes from, how we analyze it, and who analyzes it. I also use triangulation in the inverse: stress testing conclusions by questioning what we would see if it's true.",
    imageSrc: "/thinking-diagrams/triangulation.png",
    imageWidth: 350,
    styles: { textWidth: 64, imageScale: 75, imageOffsetY: 20 },
  },
  {
    id: "cognitive-biases",
    title: "Cognitive Biases",
    description: "",
    layout: "three-column",
    columns: [
      {
        title: "Order Effects",
        description:
          "The order in which we experience events influences our perception.\n\nFor example, the order which you view the pages of my cube impacts how you perceive me :)",
        imageSrc: "/thinking-diagrams/order-effects.png",
        imageWidth: 150,
      },
      {
        title: "The Pygmalion Effect",
        description:
          "We are more likely to improve when there are high expectations of us.\n\nI practice this by believing in myself, believing in others, and surrounding myself with people who believe in me.",
        imageSrc: "/thinking-diagrams/pygmalion-effects.png",
        imageWidth: 150,
        imageScale: 190,
        gap: 38,
      },
      {
        title: "IKEA Effect",
        description:
          "We place greater value in things we helped create.\n\nI'm drawn to emergence, multiplayer experiences, and interactivity as expressions of this.",
        imageSrc: "/thinking-diagrams/ikea-effect.png",
        imageWidth: 150,
        imageScale: 110,
      },
    ],
  },
  {
    id: "information-foraging-theory",
    title: "Information Foraging Theory",
    description:
      "In early hunter-gatherer societies, humans decided which bushes to forage by comparing how many berries they could gather to how much energy it would take.\n\nInformation Foraging Theory proposes that we show similar foraging behaviour when hunting for answers to our questions, new movies to watch, and problems to solve.\n\nWe judge value by whether the perceived outcome (berries) is greater than the perceived cost (thorns). Value perception can be increased by improving the outcome or reducing the cost. We can also measure value perception by observing how people navigate.\n\nI've used Information Foraging Theory in designing search and marketplace products, leading change management for new internal processes, and building my internal value compass.",
    imageSrc: "/thinking-diagrams/information-foraging-theory.png",
    imageWidth: 300,
    styles: { gap: 60, textWidth: 68, imageScale: 65 },
  },
  {
    id: "discernability",
    title: "Discernability",
    description:
      "Simple similarity amplifies difference, while complex similarity obscures it. To improve discriminability, either simplify similar features, remove similar features or add distinct features.\n\nAt the micro, discriminability has helped me design icons, status and navigation for complex systems. At the macro, it's why I strive to build diverse communities built on complex similarities, like shared values and rituals.",
    imageSrc: "/thinking-diagrams/discernability.png",
    imageWidth: 350,
    styles: { gap: 80, textWidth: 62, imageScale: 85 },
  },
  {
    id: "emergence-through-play",
    title: "Emergence Through Play",
    description: "",
    layout: "three-column-with-intro",
    introText: "A learning technique based in first-principles discovery and creative improvisation.",
    outroText: "Most of my songwriting starts with a chord progression (building blocks), and I improvise melodies until I like one. I've done similar in design and photography.",
    columns: [
      {
        description: "Gather the fundamental building blocks of the activity.",
        imageSrc: "/thinking-diagrams/emergence1.png",
        imageWidth: 200,
      },
      {
        description: "With no end-artifact in mind, use and combine the blocks in new ways. Be curious.",
        imageSrc: "/thinking-diagrams/emergence2.png",
        imageWidth: 200,
      },
      {
        description: "As new insights emerge, follow them and build upon them.",
        imageSrc: "/thinking-diagrams/emergence3.png",
        imageWidth: 200,
      },
    ],
  },
];

const TUNER_PROPERTIES: TunerProperty[] = [
  // Per-column tuners for emergence through play
  ...["step-1", "step-2", "step-3"].flatMap((step) => [
    { key: `etp-${step}-image-scale`, label: "Image Scale", type: "slider" as const, value: 100, min: 50, max: 200, step: 5, unit: "%", group: `emerge-${step}` },
    { key: `etp-${step}-image-offset-y`, label: "Image Offset Y", type: "slider" as const, value: 0, min: -60, max: 60, step: 5, unit: "px", group: `emerge-${step}` },
  ]),
  // Arrow tuners for emergence
  ...["arrow-1", "arrow-2"].flatMap((arrow) => [
    { key: `etp-${arrow}-scale`, label: "Arrow Scale", type: "slider" as const, value: 100, min: 30, max: 200, step: 5, unit: "%", group: `emerge-${arrow}` },
    { key: `etp-${arrow}-offset-y`, label: "Arrow Offset Y", type: "slider" as const, value: 0, min: -60, max: 60, step: 5, unit: "px", group: `emerge-${arrow}` },
  ]),
];

function getStyles(tool: ThinkingTool): TunerStyles & { sectionPy: number; gap: number; imageScale: number; imageOffsetY: number } {
  return {
    sectionPadding: tool.styles?.sectionPy ?? 48,
    gap: tool.styles?.gap ?? 48,
    titleSize: TITLE_SIZE,
    textSize: TEXT_SIZE,
    lineHeight: LINE_HEIGHT,
    textWidth: tool.styles?.textWidth ?? 50,
    imageScale: tool.styles?.imageScale ?? 100,
    imageOffsetY: tool.styles?.imageOffsetY ?? 0,
    sectionPy: tool.styles?.sectionPy ?? 48,
  };
}

export default function ThinkingPage() {
  const { values: v, onChange, onReset } = useDesignTuner(TUNER_PROPERTIES);

  return (
    <FaceLayout
      faceId="thinking"
      className="bg-[#F5F5F5] font-[family-name:var(--font-dm-sans)]"
      style={{
        backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="mx-auto px-6 pb-16" style={{ maxWidth: PAGE_MAX_WIDTH }}>
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/my-thinking-tools.png"
            alt="My Thinking Tools"
            width={480}
            height={96}
            className="mx-auto"
          />
          <p className="text-foreground/60 mt-3 text-[20px]">
            A whiteboard gallery of my favourite frameworks, philosophies and
            principles
          </p>
        </div>

        {/* Thinking tool sections */}
        <div>
          {THINKING_TOOLS.map((tool, index) => {
            const t = getStyles(tool);

            // Cognitive biases — per-column tuner
            if (tool.id === "cognitive-biases" && tool.columns) {
              return (
                <section
                  key={tool.id}
                  id={tool.id}
                  style={{ paddingTop: t.sectionPy, paddingBottom: t.sectionPy }}
                >
                  <h2 className="text-2xl font-normal mb-8 text-center font-[family-name:var(--font-merriweather)]" style={{ fontSize: TITLE_SIZE }}>
                    <span className="relative inline-block">
                      <span
                        className="absolute inset-0 -z-0"
                        style={{
                          backgroundColor: "rgba(255, 241, 0, 0.5)",
                          transform: "skewX(-8deg)",
                          margin: "-4px -12px",
                          padding: "4px 12px",
                          width: "calc(100% + 24px)",
                          height: "calc(100% + 8px)",
                        }}
                        aria-hidden
                      />
                      <span className="relative z-10">{tool.title}</span>
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: t.gap }}>
                    {tool.columns.map((col, colIndex) => {
                      const colScale = col.imageScale ?? 100;
                      const colOffsetY = col.imageOffsetY ?? 0;
                      const colGap = col.gap ?? 16;
                      return (
                        <div key={col.title || colIndex} className="text-center" style={{ gap: colGap, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          {/* Title above image */}
                          {col.title && (
                            <h3 className="font-semibold italic mb-2 font-[family-name:var(--font-merriweather)]" style={{ fontSize: TEXT_SIZE }}>{col.title}</h3>
                          )}
                          {/* Image */}
                          {col.imageSrc && (
                            <img
                              src={col.imageSrc}
                              alt={col.title || ""}
                              className="mx-auto max-w-full h-auto"
                              style={{
                                width: (col.imageWidth || 150) * (colScale / 100),
                                transform: colOffsetY ? `translateY(${colOffsetY}px)` : undefined,
                              }}
                            />
                          )}
                          {/* Description */}
                          <div className="leading-relaxed space-y-2" style={{ fontSize: TEXT_SIZE, lineHeight: LINE_HEIGHT }}>
                            {col.description.split("\n\n").map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            // Emergence through play — three columns with per-column images + arrows
            if (tool.id === "emergence-through-play" && tool.columns) {
              return (
                <section
                  key={tool.id}
                  id={tool.id}
                  style={{ paddingTop: t.sectionPy, paddingBottom: t.sectionPy }}
                >
                  <h2 className="text-2xl font-normal mb-4 text-center font-[family-name:var(--font-merriweather)]" style={{ fontSize: TITLE_SIZE }}>
                    <span className="relative inline-block">
                      <span
                        className="absolute inset-0 -z-0"
                        style={{
                          backgroundColor: "rgba(255, 241, 0, 0.5)",
                          transform: "skewX(-8deg)",
                          margin: "-4px -12px",
                          padding: "4px 12px",
                          width: "calc(100% + 24px)",
                          height: "calc(100% + 8px)",
                        }}
                        aria-hidden
                      />
                      <span className="relative z-10">{tool.title}</span>
                    </span>
                  </h2>

                  {tool.introText && (
                    <p className="text-center text-foreground/70 mb-8" style={{ fontSize: TEXT_SIZE, lineHeight: LINE_HEIGHT }}>{tool.introText}</p>
                  )}

                  {/* Three columns with arrows between them */}
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 mb-8">
                    {tool.columns.map((col, colIndex) => {
                      const stepKey = `step-${colIndex + 1}`;
                      const stepScale = v[`etp-${stepKey}-image-scale`] as number;
                      const stepOffsetY = v[`etp-${stepKey}-image-offset-y`] as number;
                      return (
                        <div key={colIndex} className="contents">
                          {/* Column */}
                          <div className="flex-1 text-center max-w-[280px]">
                            {col.imageSrc && (
                              <div className="flex justify-center mb-4">
                                <img
                                  src={col.imageSrc}
                                  alt={`Step ${colIndex + 1}`}
                                  className="max-w-full h-auto"
                                  style={{
                                    width: (col.imageWidth || 200) * (stepScale / 100),
                                    transform: stepOffsetY ? `translateY(${stepOffsetY}px)` : undefined,
                                  }}
                                />
                              </div>
                            )}
                            <div className="leading-relaxed" style={{ fontSize: TEXT_SIZE, lineHeight: LINE_HEIGHT }}>
                              {col.description}
                            </div>
                          </div>

                          {/* Arrow between columns (desktop only) */}
                          {colIndex < tool.columns!.length - 1 && (
                            <div
                              className="hidden md:flex items-center justify-center flex-shrink-0 w-12"
                              style={{
                                transform: (v[`etp-arrow-${colIndex + 1}-offset-y`] as number) ? `translateY(${v[`etp-arrow-${colIndex + 1}-offset-y`] as number}px)` : undefined,
                              }}
                            >
                              <img
                                src={`/thinking-diagrams/arrow${colIndex + 1}.png`}
                                alt=""
                                className="h-auto"
                                style={{
                                  width: 48 * ((v[`etp-arrow-${colIndex + 1}-scale`] as number) / 100),
                                }}
                                onError={(e) => {
                                  // Fallback to CSS arrow if image not found
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-foreground/30 text-2xl">→</span>';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {tool.outroText && (
                    <p className="text-center text-foreground/70" style={{ fontSize: TEXT_SIZE, lineHeight: LINE_HEIGHT }}>{tool.outroText}</p>
                  )}
                </section>
              );
            }

            // Other three-column sections (generic)
            if (tool.layout === "three-column" && tool.columns) {
              return (
                <section
                  key={tool.id}
                  id={tool.id}
                  style={{ paddingTop: t.sectionPy, paddingBottom: t.sectionPy }}
                >
                  <h2 className="text-2xl font-normal mb-8 text-center font-[family-name:var(--font-merriweather)]" style={{ fontSize: TITLE_SIZE }}>
                    <span className="relative inline-block">
                      <span
                        className="absolute inset-0 -z-0"
                        style={{
                          backgroundColor: "rgba(255, 241, 0, 0.5)",
                          transform: "skewX(-8deg)",
                          margin: "-4px -12px",
                          padding: "4px 12px",
                          width: "calc(100% + 24px)",
                          height: "calc(100% + 8px)",
                        }}
                        aria-hidden
                      />
                      <span className="relative z-10">{tool.title}</span>
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: t.gap }}>
                    {tool.columns.map((col, colIndex) => (
                      <div key={col.title || colIndex} className="text-center">
                        {col.imageSrc ? (
                          <img
                            src={col.imageSrc}
                            alt={col.title || ""}
                            className="mx-auto mb-4 max-w-full h-auto"
                            style={{ width: (col.imageWidth || 150) * (t.imageScale / 100), transform: t.imageOffsetY ? `translateY(${t.imageOffsetY}px)` : undefined }}
                          />
                        ) : (
                          <div className="w-32 h-24 mx-auto mb-4 rounded-lg bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
                            <span className="text-xs text-foreground/30">Diagram</span>
                          </div>
                        )}
                        {col.title && (
                          <h3 className="font-semibold italic mb-2 font-[family-name:var(--font-merriweather)]" style={{ fontSize: TEXT_SIZE }}>{col.title}</h3>
                        )}
                        <div className="leading-relaxed space-y-2" style={{ fontSize: TEXT_SIZE, lineHeight: LINE_HEIGHT }}>
                          {col.description.split("\n\n").map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // Default: alternating section
            return (
              <AlternatingSection
                key={tool.id}
                id={tool.id}
                index={index}
                title={tool.title}
                titleHighlight="yellow"
                description={tool.description}
                imageSrc={tool.imageSrc}
                imageAlt={tool.imageAlt}
                imageWidth={tool.imageWidth}
                imageHeight={tool.imageHeight}
                tunerStyles={t}
              />
            );
          })}
        </div>
      </div>

      <DesignTuner
        properties={TUNER_PROPERTIES}
        values={v}
        onChange={onChange}
        onReset={onReset}
      />
    </FaceLayout>
  );
}
