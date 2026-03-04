import Image from "next/image";
import FaceLayout from "@/components/FaceLayout";
import AlternatingSection, { type TunerStyles } from "@/components/AlternatingSection";

const TITLE_SIZE = 28;
const TEXT_SIZE = 20;
const LINE_HEIGHT = 1.6;
const PAGE_MAX_WIDTH = 1200;

interface ThinkingTool {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageMobileSrc?: string;
  imageMobileWidth?: string;
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
      "Complex problems are fun to solve. Systems thinking, which models how interconnected elements affect each other, helps me understand complex problems and identify opportunities for leverage.\n\nFor example, approaching the challenge of building IRL communities. I start with a small seed group, make it a *truly enjoyable experience*, then get each person to bring 1-2 friends next time. This creates a *reinforcing feedback loop*.",
    imageSrc: "/thinking-diagrams/systems-thinking.png",
    imageWidth: 400,
    styles: { sectionPy: 40, gap: 52, imageScale: 120, imageOffsetY: 55 },
  },
  {
    id: "divergent-goals",
    title: "Divergent Goals",
    description:
      "Divergent goals are broad directions that allow for many pathways and end-states. They can't be failed, only pursued. They reward making progress now instead of overprescribing the future.\n\nMuch of how I think about career is in divergent goals. Instead of fixating on a *specific* role at a *specific* company, I know broadly that I want to work on *positive-sum problems* that enable human-human value exchange, as a *thinker-builder hybrid*.",
    imageSrc: "/thinking-diagrams/divergent-goals.png",
    imageWidth: 350,
    styles: { sectionPy: 32, gap: 44, imageScale: 120, imageOffsetY: 70 },
  },
  {
    id: "mapping",
    title: "Mapping",
    description:
      "Mapping starts with clearly articulating a set of fundamental goals. Then, every decision is measured against these goals. If it aligns, keep it. If not, cut it. As the decision tree grows, continue comparing alignment all the way back up the hierarchy. I use mapping to enforce focus.\n\nAn example of mapping you've probably experienced is essay writing. In an essay, each paragraph should tie back to the thesis. In a paragraph, each sentence should tie back not just to the paragraph's argument, but also the overall thesis.",
    imageSrc: "/thinking-diagrams/mapping.png",
    imageWidth: 400,
    styles: { textWidth: 56, imageScale: 90, imageOffsetY: 50 },
  },
  {
    id: "deduction-and-induction",
    title: "Deduction and Induction",
    description:
      "Deduction and induction are two fundamental types of reasoning.\n\nDeduction takes a top-down idea and through hypothesis-led experiments, tests its validity. I use deduction when I have conviction. It lets me push out what I believe should be true and see if it really is. For example, when working on business model validation, asking \"what needs to be true for this business to be profitable?\" and then designing experiments (i.e. landing page tests, financial modelling, expert calls) for each assumption.\n\nInduction gathers raw evidence and pulls out patterns to form a broader theory. I use induction when I need inspiration. I'm pulling in what is already true at a small scale, and using that to springboard my thinking in new directions. For example, interviewing a subset of churned users, and examining patterns to come up with new theories on how to increase retention.",
    imageSrc: "/thinking-diagrams/deduction-and-induction.png",
    imageMobileSrc: "/thinking-diagrams/deduction-induction-mobile.png",
    imageMobileWidth: "80vw",
    imageWidth: 380,
    styles: { gap: 56, textWidth: 56, imageOffsetY: 40 },
  },
  {
    id: "triangulation",
    title: "Triangulation",
    description:
      "Triangulation uses multiple forms of diverse evidence to increase confidence in a conclusion. The variation can be in what data we gather, where it comes from, how we analyze it, and who analyzes it. I also use triangulation in the inverse: stress testing conclusions by questioning what we would see if it's true.\n\nFor example, if this website gets a lot of traffic, I could conclude I did a good job. But if that's true, I'd expect visitors to send DMs or emails. If I see traffic but no messages, maybe it was just a bot influx instead.",
    imageSrc: "/thinking-diagrams/triangulation.png",
    imageWidth: 350,
    styles: { textWidth: 64, imageScale: 75, imageOffsetY: 95 },
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
      "In early hunter-gatherer societies, humans decided which bushes to forage by comparing how many berries they could gather to how much energy it would take.\n\nInformation Foraging Theory proposes that we show similar foraging behaviour when hunting for answers to our questions, new movies to watch, and problems to solve.\n\nWe judge value by whether the perceived outcome (berries) is greater than the perceived cost (thorns). Value perception can be increased by improving the outcome or reducing the cost. We can also measure value perception by observing how people navigate.\n\nI've used Information Foraging Theory in designing search and marketplace products, leading change management for new internal processes, and building my internal compass for which problems are valuable to spend my energy on.",
    imageSrc: "/thinking-diagrams/information-foraging-theory.png",
    imageMobileSrc: "/thinking-diagrams/info-foraging-mobile.png",
    imageMobileWidth: "80vw",
    imageWidth: 300,
    styles: { gap: 60, textWidth: 68, imageScale: 55, imageOffsetY: 15 },
  },
  {
    id: "discernability",
    title: "Discernability",
    description:
      "Simple similarity amplifies difference, while complex similarity obscures it. To improve discriminability, either simplify similar features, remove similar features or add distinct features.\n\nAt an attention-to-detail level, discriminability has helped me improve the design of icons and activity status within navigation for complex systems. At a more macroscopic scale, it's why I strive to build diverse communities built on complex similarities, like shared values and rituals.",
    imageSrc: "/thinking-diagrams/discernability.png",
    imageWidth: 350,
    styles: { gap: 80, textWidth: 62, imageScale: 85, imageOffsetY: 15 },
  },
  {
    id: "emergence-through-play",
    title: "Emergence Through Play",
    description: "",
    layout: "three-column-with-intro",
    introText: "A learning technique based in first-principles discovery and creative improvisation.",
    outroText: "Most of my songwriting starts with a chord progression (building blocks), and I improvise melodies and record. Then I listen back and pull out riffs and phrases that stick out, and begin constructing a song around that basis. I've done similar in design and photography.",
    columns: [
      {
        description: "Gather the fundamental building blocks of the activity.",
        imageSrc: "/thinking-diagrams/emergence1.png",
        imageWidth: 200,
        imageScale: 115,
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
        imageScale: 70,
      },
    ],
  },
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
  return (
    <FaceLayout
      faceId="thinking"
      className="bg-[#F5F5F5] font-[family-name:var(--font-dm-sans)]"
      style={{
        backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-16 pb-16" style={{ maxWidth: PAGE_MAX_WIDTH }}>
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/my-thinking-tools.png"
            alt="My Thinking Tools"
            width={480}
            height={96}
            className="mx-auto max-w-[280px] sm:max-w-[380px] md:max-w-[480px] h-auto"
          />
          <p className="mt-3 text-[18px] sm:text-[20px]">
            My favourite frameworks, philosophies and principles, in my favourite medium for thinking.
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
                  className="py-8 md:[padding-top:var(--section-py,3rem)] md:[padding-bottom:var(--section-py,3rem)]"
                  style={{ '--section-py': `${t.sectionPy}px` } as React.CSSProperties}
                >
                  <h2 className="text-[24px] md:text-[28px] font-normal mb-8 text-center font-[family-name:var(--font-merriweather)]">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:[gap:var(--col-gap,3rem)]" style={{ '--col-gap': `${t.gap}px` } as React.CSSProperties}>
                    {tool.columns.map((col, colIndex) => {
                      const colScale = col.imageScale ?? 100;
                      const colOffsetY = col.imageOffsetY ?? 0;
                      const colGap = col.gap ?? 16;
                      return (
                        <div key={col.title || colIndex} className="text-center" style={{ gap: colGap, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          {/* Title above image */}
                          {col.title && (
                            <h3 className="font-semibold italic mb-2 text-[18px] md:text-[20px] font-[family-name:var(--font-merriweather)]">{col.title}</h3>
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
                          <div className="leading-relaxed space-y-2 text-[18px] md:text-[20px]" style={{ lineHeight: LINE_HEIGHT }}>
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
                  className="py-8 md:[padding-top:var(--section-py,3rem)] md:[padding-bottom:var(--section-py,3rem)]"
                  style={{ '--section-py': `${t.sectionPy}px` } as React.CSSProperties}
                >
                  <h2 className="text-[24px] md:text-[28px] font-normal mb-8 text-center font-[family-name:var(--font-merriweather)]">
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
                    <p className="text-center mb-8 text-[18px] md:text-[20px]" style={{ lineHeight: LINE_HEIGHT }}>{tool.introText}</p>
                  )}

                  {/* Three columns with arrows between them */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8">
                    {tool.columns.map((col, colIndex) => {
                      const stepScale = col.imageScale ?? 100;
                      const stepOffsetY = col.imageOffsetY ?? 0;
                      return (
                        <div key={colIndex} className="contents">
                          {/* Column */}
                          <div className="flex-1 flex flex-col items-center text-center max-w-[280px]">
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
                            <div className="leading-relaxed text-[18px] md:text-[20px]" style={{ lineHeight: LINE_HEIGHT }}>
                              {col.description}
                            </div>
                          </div>

                          {/* Arrow between columns (desktop only) */}
                          {colIndex < tool.columns!.length - 1 && (
                            <div className="hidden md:flex items-center justify-center flex-shrink-0 w-12">
                              <img
                                src={`/thinking-diagrams/arrow${colIndex + 1}.png`}
                                alt=""
                                className="h-auto w-12"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {tool.outroText && (
                    <p className="text-center text-[18px] md:text-[20px]" style={{ lineHeight: LINE_HEIGHT }}>{tool.outroText}</p>
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
                  className="py-8 md:[padding-top:var(--section-py,3rem)] md:[padding-bottom:var(--section-py,3rem)]"
                  style={{ '--section-py': `${t.sectionPy}px` } as React.CSSProperties}
                >
                  <h2 className="text-[24px] md:text-[28px] font-normal mb-8 text-center font-[family-name:var(--font-merriweather)]">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:[gap:var(--col-gap,3rem)]" style={{ '--col-gap': `${t.gap}px` } as React.CSSProperties}>
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
                          <h3 className="font-semibold italic mb-2 text-[18px] md:text-[20px] font-[family-name:var(--font-merriweather)]">{col.title}</h3>
                        )}
                        <div className="leading-relaxed space-y-2 text-[18px] md:text-[20px]" style={{ lineHeight: LINE_HEIGHT }}>
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
                imageMobileSrc={tool.imageMobileSrc}
                imageMobileWidth={tool.imageMobileWidth}
                imageAlt={tool.imageAlt}
                imageWidth={tool.imageWidth}
                imageHeight={tool.imageHeight}
                tunerStyles={t}
              />
            );
          })}
        </div>
      </div>

    </FaceLayout>
  );
}
