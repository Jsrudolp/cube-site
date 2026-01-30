import FaceLayout from "@/components/FaceLayout";
import AlternatingSection from "@/components/AlternatingSection";

const CAPABILITIES = [
  {
    id: "discovery",
    title: "Discovery",
    metadata: "Fall 2025 | Product Builder",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
  },
  {
    id: "design",
    title: "Design",
    metadata: "Fall 2025 | Product Builder",
    description:
      "At Simple Ventures, we\u2019ve traditionally skewed towards stringing together low/no-code tools to build MVPs and validate quickly. But, with significant advancements in AI code generation, and a product with high security-compliance needs, we chose to build.",
    tags: [
      { discipline: "PRODUCT", labels: ["Long-Term Vision", "Long-Term Vision"] },
      { discipline: "ENGINEERING", labels: ["Long-Term Vision"] },
      { discipline: "DESIGN", labels: ["Long-Term Vision"] },
    ],
  },
  {
    id: "ai-native-engineering",
    title: "AI-Native Engineering",
    metadata: "Fall 2025 | Product Builder",
    description:
      "Content coming soon. This section will detail the approach to building AI-native products from the ground up.",
    tags: [
      { discipline: "PRODUCT", labels: ["Coming Soon"] },
      { discipline: "ENGINEERING", labels: ["Coming Soon"] },
    ],
  },
  {
    id: "feedback-loops",
    title: "Feedback Loops",
    metadata: "Fall 2025 | Product Builder",
    description:
      "Content coming soon. This section will cover how tight feedback loops accelerate product quality and iteration speed.",
    tags: [
      { discipline: "PRODUCT", labels: ["Coming Soon"] },
    ],
  },
  {
    id: "commercialization",
    title: "Commercialization",
    metadata: "Fall 2025 | Product Builder",
    description:
      "Content coming soon. This section will explore the path from prototype to paying customers.",
    tags: [
      { discipline: "PRODUCT", labels: ["Coming Soon"] },
    ],
  },
  {
    id: "scrappiness",
    title: "Scrappiness",
    metadata: "Fall 2025 | Product Builder",
    description:
      "Content coming soon. This section will highlight doing more with less and the resourcefulness needed in early-stage building.",
    tags: [
      { discipline: "PRODUCT", labels: ["Coming Soon"] },
    ],
  },
];

export default function BuildingPage() {
  return (
    <FaceLayout faceId="building" className="bg-[#f5e6d3]">
      {/* Hero */}
      <div className="text-center pb-8">
        <p className="text-2xl md:text-3xl italic">
          I figure out what&apos;s valuable, then build it
        </p>
        <p className="text-2xl md:text-3xl italic">
          <em>using whatever tools it takes.</em>
        </p>

        {/* Toolbox placeholder */}
        <div className="mt-10 mx-auto w-64 h-48 rounded-lg bg-[#e8c9a8] border border-dashed border-foreground/15 flex items-center justify-center">
          <span className="text-sm text-foreground/40">Toolbox illustration</span>
        </div>
      </div>

      {/* Capability sections */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="divide-y divide-foreground/10">
          {CAPABILITIES.map((cap, index) => (
            <AlternatingSection
              key={cap.id}
              id={cap.id}
              index={index}
              title={cap.title}
              metadata={cap.metadata}
              description={cap.description}
              tags={cap.tags}
            />
          ))}
        </div>
      </div>
    </FaceLayout>
  );
}
