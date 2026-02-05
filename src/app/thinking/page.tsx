"use client";

import { useState } from "react";
import Image from "next/image";
import FaceLayout from "@/components/FaceLayout";
import AlternatingSection from "@/components/AlternatingSection";

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
  }[];
}

const THINKING_TOOLS: ThinkingTool[] = [
  {
    id: "systems-thinking",
    title: "Systems Thinking",
    description:
      "Complex problems are fun to solve. Systems thinking, which models how interconnected elements behave, helps me understand them and identify opportunities for outsized impact.",
    imageSrc: "/thinking-diagrams/systems-thinking.png",
    imageWidth: 400,
  },
  {
    id: "divergent-goals",
    title: "Divergent Goals",
    description:
      "Divergent goals are broad directions that allow for many pathways and end-states. They can't be failed, only pursued. It rewards me for making progress now instead of overprescribing the future.",
    imageSrc: "/thinking-diagrams/divergent-goals.png",
    imageWidth: 350,
  },
  {
    id: "mapping",
    title: "Mapping",
    description:
      "Mapping starts with clearly articulating the fundamental goals. Then, every decision is measured against these goals. If it aligns, keep it. If not, cut it. As the decision tree grows, continue comparing alignment all the way back up the hierarchy. Mapping enforces my focus.",
    imageSrc: "/thinking-diagrams/mapping.png",
    imageWidth: 400,
  },
  {
    id: "deduction-and-induction",
    title: "Deduction and Induction",
    description:
      "Deduction and induction are two fundamental types of reasoning.\n\nDeduction takes a top-down idea and through hypothesis-led experiments, tests its validity. I use deduction when I have conviction. It lets me push out what I believe should be true and see if it really is.\n\nInduction gathers raw evidence and pulls out patterns to form a broader theory. I use induction when I need inspiration. I'm pulling in what is already true at a small scale, and using that to springboard my thinking in new directions.",
    imageSrc: "/thinking-diagrams/deduction-and-induction.png",
    imageWidth: 380,
  },
  {
    id: "triangulation",
    title: "Triangulation",
    description:
      "Triangulation uses multiple forms of diverse evidence to increase confidence in a conclusion. The variation can be in what data we gather, where it comes from, how we analyze it, and who analyzes it. I also use triangulation in the inverse: stress testing conclusions by questioning what we would see if it's true.",
    imageSrc: "/thinking-diagrams/triangulation.png",
    imageWidth: 350,
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
      },
      {
        title: "IKEA Effect",
        description:
          "We place greater value in things we helped create.\n\nI'm drawn to emergence, multiplayer experiences, and interactivity as expressions of this.",
        imageSrc: "/thinking-diagrams/ikea-effect.png",
        imageWidth: 150,
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
  },
  {
    id: "discernability",
    title: "Discernability",
    description:
      "Simple similarity amplifies difference, while complex similarity obscures it. To improve discriminability, either simplify similar features, remove similar features or add distinct features.\n\nAt the micro, discriminability has helped me design icons, status and navigation for complex systems. At the macro, it's why I strive to build diverse communities built on complex similarities, like shared values and rituals.",
    imageSrc: "/thinking-diagrams/discernability.png",
    imageWidth: 350,
  },
  {
    id: "emergence-through-play",
    title: "Emergence Through Play",
    description: "",
    layout: "three-column-with-intro",
    introText: "A learning technique based in first-principles discovery and creative improvisation.",
    outroText: "Most of my songwriting starts with a chord progression (building blocks), and I improvise melodies until I like one. I've done similar in design and photography.",
    imageSrc: "/thinking-diagrams/emergence through play.png",
    columns: [
      {
        description: "Gather the fundamental building blocks of the activity.",
      },
      {
        description: "With no end-artifact in mind, use and combine the blocks in new ways. Be curious.",
      },
      {
        description: "As new insights emerge, follow them and build upon them.",
      },
    ],
  },
];

export default function ThinkingPage() {
  const [showSliders, setShowSliders] = useState(true);
  const [imageWidths, setImageWidths] = useState<Record<string, number>>({
    "systems-thinking": 400,
    "divergent-goals": 350,
    "mapping": 400,
    "deduction-and-induction": 380,
    "triangulation": 350,
    "order-effects": 150,
    "pygmalion-effects": 150,
    "ikea-effect": 150,
    "information-foraging-theory": 300,
    "discernability": 350,
    "emergence-through-play": 500,
  });

  const updateWidth = (id: string, width: number) => {
    setImageWidths((prev) => ({ ...prev, [id]: width }));
  };

  return (
    <FaceLayout
      faceId="thinking"
      className="bg-[#F5F5F5]"
      style={{
        backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Image width sliders */}
      {showSliders && (
        <div className="fixed top-20 right-4 z-50 bg-black/90 text-white px-4 py-3 rounded-lg max-h-[80vh] overflow-y-auto w-72">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Image Widths</span>
            <button
              onClick={() => setShowSliders(false)}
              className="text-white/60 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          {Object.entries(imageWidths).map(([id, width]) => (
            <div key={id} className="flex items-center gap-2 mb-2">
              <span className="text-xs w-28 truncate" title={id}>{id}</span>
              <input
                type="range"
                min="100"
                max="600"
                step="10"
                value={width}
                onChange={(e) => updateWidth(id, parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-mono w-10">{width}</span>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/my-thinking-tools.png"
            alt="My Thinking Tools"
            width={400}
            height={80}
            className="mx-auto"
          />
          <p className="text-foreground/60 mt-3">
            A whiteboard gallery of my favourite frameworks, philosophies and
            principles
          </p>
        </div>

        {/* Thinking tool sections */}
        <div className="divide-y divide-foreground/10">
          {THINKING_TOOLS.map((tool, index) =>
            tool.layout === "three-column" && tool.columns ? (
              <section
                key={tool.id}
                id={tool.id}
                className="py-12"
              >
                {/* Section title with yellow highlight */}
                <h2 className="text-2xl font-bold mb-8 text-center">
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

                {/* Three columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {tool.columns.map((col, colIndex) => {
                    const colId = col.title?.toLowerCase().replace(/ /g, "-").replace("the-", "") || `col-${colIndex}`;
                    return (
                    <div key={col.title || colIndex} className="text-center">
                      {/* Column image */}
                      {col.imageSrc ? (
                        <img
                          src={col.imageSrc}
                          alt={col.title || ""}
                          className="mx-auto mb-4 max-w-full h-auto"
                          style={{ width: imageWidths[colId] || col.imageWidth }}
                        />
                      ) : (
                        <div className="w-32 h-24 mx-auto mb-4 rounded-lg bg-foreground/5 border border-dashed border-foreground/15 flex items-center justify-center">
                          <span className="text-xs text-foreground/30">Diagram</span>
                        </div>
                      )}
                      {/* Column title */}
                      {col.title && (
                        <h3 className="font-semibold text-sm italic mb-2">{col.title}</h3>
                      )}
                      {/* Column description */}
                      <div className="text-sm leading-relaxed space-y-2">
                        {col.description.split("\n\n").map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </section>
            ) : tool.layout === "three-column-with-intro" && tool.columns ? (
              <section
                key={tool.id}
                id={tool.id}
                className="py-12"
              >
                {/* Section title with yellow highlight */}
                <h2 className="text-2xl font-bold mb-4 text-center">
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

                {/* Intro text */}
                {tool.introText && (
                  <p className="text-center text-foreground/70 mb-8">{tool.introText}</p>
                )}

                {/* Full-width image if provided at tool level */}
                {tool.imageSrc && (
                  <div className="flex justify-center mb-8">
                    <img
                      src={tool.imageSrc}
                      alt={tool.title}
                      className="max-w-full h-auto"
                      style={{ width: imageWidths[tool.id] || tool.imageWidth }}
                    />
                  </div>
                )}

                {/* Three columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {tool.columns.map((col, colIndex) => (
                    <div key={colIndex} className="text-center">
                      {/* Column image (if per-column images exist) */}
                      {col.imageSrc && (
                        <img
                          src={col.imageSrc}
                          alt=""
                          className="mx-auto mb-4 max-w-full h-auto"
                          style={col.imageWidth ? { width: col.imageWidth } : undefined}
                        />
                      )}
                      {/* Column description */}
                      <div className="text-sm leading-relaxed">
                        {col.description}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Outro text */}
                {tool.outroText && (
                  <p className="text-center text-foreground/70">{tool.outroText}</p>
                )}
              </section>
            ) : (
              <AlternatingSection
                key={tool.id}
                id={tool.id}
                index={index}
                title={tool.title}
                titleHighlight="yellow"
                description={tool.description}
                imageSrc={tool.imageSrc}
                imageAlt={tool.imageAlt}
                imageWidth={imageWidths[tool.id] || tool.imageWidth}
                imageHeight={tool.imageHeight}
              />
            )
          )}
        </div>
      </div>
    </FaceLayout>
  );
}
