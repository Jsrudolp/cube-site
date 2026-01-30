import FaceLayout from "@/components/FaceLayout";
import AlternatingSection from "@/components/AlternatingSection";

const THINKING_TOOLS = [
  {
    id: "systems-thinking",
    title: "Systems Thinking",
    description:
      "Complex problems are fun to solve. Systems thinking, which models how interconnected elements behave, helps me understand them and identify opportunities for outsized impact.",
  },
  {
    id: "divergent-goals",
    title: "Divergent Goals",
    description:
      "Divergent goals are broad directions that allow for many pathways and end-states. They can\u2019t be failed, only pursued. It rewards me for making progress now instead of overprescribing the future.",
  },
  {
    id: "mapping",
    title: "Mapping",
    description:
      "Mapping starts with clearly articulating the fundamental goals. Then, every decision is measured against these goals. If it aligns, keep it. If not, cut it. As the decision tree grows, continue comparing alignment all the way back up the hierarchy. Mapping enforces my focus.",
  },
  {
    id: "deduction-and-induction",
    title: "Deduction and Induction",
    description:
      "Deduction and induction are two fundamental reasoning approaches. Deduction starts from general principles to reach specific conclusions. Induction builds general principles from specific observations. I use both to validate thinking from multiple directions.",
  },
  {
    id: "tool-5",
    title: "Tool 5",
    description: "Content coming soon.",
  },
  {
    id: "tool-6",
    title: "Tool 6",
    description: "Content coming soon.",
  },
  {
    id: "tool-7",
    title: "Tool 7",
    description: "Content coming soon.",
  },
  {
    id: "tool-8",
    title: "Tool 8",
    description: "Content coming soon.",
  },
  {
    id: "tool-9",
    title: "Tool 9",
    description: "Content coming soon.",
  },
];

export default function ThinkingPage() {
  return (
    <FaceLayout faceId="thinking" className="bg-[#ececec]">
      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-bold"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            My Thinking Tools
          </h1>
          <p className="text-foreground/60 mt-3">
            A whiteboard gallery of my favourite frameworks, philosophies and
            principles
          </p>
        </div>

        {/* Thinking tool sections */}
        <div className="divide-y divide-foreground/10">
          {THINKING_TOOLS.map((tool, index) => (
            <AlternatingSection
              key={tool.id}
              id={tool.id}
              index={index}
              title={tool.title}
              titleHighlight="yellow"
              description={tool.description}
            />
          ))}
        </div>
      </div>
    </FaceLayout>
  );
}
