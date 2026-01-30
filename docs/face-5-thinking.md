# Face 5: Thinking Tools

**Route:** `/thinking`
**Design language:** Light gray textured background, hand-drawn whiteboard aesthetic

---

## Purpose

A gallery of Jake's favourite frameworks, philosophies, and mental models. This is the most unusual face — most people don't put their thinking tools on a portfolio. The hand-drawn aesthetic keeps it feeling personal rather than like a consulting deck.

---

## Layout

### Navigation

- **Top-left:** Face navigation icons. Current face icon (thinking) is visually distinct.
- **Top-right:** "Zoom Out" button

### Header

- **Title:** "My Thinking Tools" — rendered in a **hand-drawn/marker-style font**
- **Subtitle:** "A whiteboard gallery of my favourite frameworks, philosophies and principles"

### Thinking Tool Sections

Nine sections total, each following the same component structure with alternating left/right layout.

**The nine thinking tools:**
1. Systems Thinking
2. Divergent Goals
3. Mapping
4. Deduction and Induction
5. *[Tool 5 — TBD]*
6. *[Tool 6 — TBD]*
7. *[Tool 7 — TBD]*
8. *[Tool 8 — TBD]*
9. *[Tool 9 — TBD]*

*(Tools 5-9 content to be provided — structure is the same.)*

Each section supports a **hash anchor** (e.g., `/thinking#systems-thinking`, `/thinking#divergent-goals`).

### Section Component

Each thinking tool section contains:

- **Title** with a **yellow highlighter stroke** behind it (like a marker highlight on a whiteboard)
- **Description paragraph** — explains the framework, what it is, and why Jake uses it. Written in first person, conversational.
- **Hand-drawn diagram** — an abstract visual representation of the concept:
  - Uses colored squares/rectangles (pink, blue, yellow) as abstract elements
  - Hand-drawn arrows and connections between elements
  - Not detailed illustrations — more like quick whiteboard sketches
  - Each diagram is unique to its concept (feedback loops for Systems Thinking, branching trees for Divergent Goals, decision trees with X marks for Mapping, etc.)

### Alternating Layout

- **Odd sections (1, 3, 5, 7, 9):** Text + title on left, diagram on right
- **Even sections (2, 4, 6, 8):** Diagram on left, text + title on right

Same zigzag rhythm as Face 3 (Building).

---

## Design Details

- **Background:** Light gray with subtle paper/whiteboard texture
- **Title font:** Hand-drawn/marker style (Google Fonts options: Caveat, Kalam, Patrick Hand, or a custom hand-drawn font)
- **Yellow highlights:** Behind each section title — not a background color, but a marker-stroke shape (slightly irregular, like a real highlighter swipe). Could be an SVG shape or a CSS pseudo-element with a hand-drawn feel.
- **Diagrams:**
  - Colored squares: pink (#f4a0a0 range), blue (#7eb8da range), yellow/gold (#f0d060 range) — exact colors TBD
  - Arrows: thin, hand-drawn style (slightly wobbly lines, not perfectly straight)
  - Can be implemented as SVGs or canvas drawings
  - Each diagram is a standalone illustration — not interactive
- **Body text:** Clean, readable font (contrast with the hand-drawn title)
- **Spacing:** Generous whitespace between sections
- **Overall feel:** Like peeking at someone's whiteboard during a brainstorming session. Intellectual but approachable.

---

## Known Thinking Tools (Content)

### 1. Systems Thinking
**Diagram:** Circular feedback loop — squares connected by arrows in a cycle, with small circles at connection points.
**Description:** "Complex problems are fun to solve. Systems thinking, which models how interconnected elements behave, helps me understand them and identify opportunities for outsized impact."

### 2. Divergent Goals
**Diagram:** Linear path that branches into a tree (one path in, many paths out). Pink squares connected by arrows.
**Description:** "Divergent goals are broad directions that allow for many pathways and end-states. They can't be failed, only pursued. It rewards me for making progress now instead of overprescribing the future."

### 3. Mapping
**Diagram:** Decision tree — squares branching with arrows, some paths marked with X (eliminated). Blue, pink, and yellow squares.
**Description:** "Mapping starts with clearly articulating the fundamental goals. Then, every decision is measured against these goals. If it aligns, keep it. If not, cut it. As the decision tree grows, continue comparing alignment all the way back up the hierarchy. Mapping enforces my focus."

### 4. Deduction and Induction
**Diagram:** TBD (partially visible in design)
**Description:** "Deduction and induction are two fundamental..." *(content to be completed)*

### 5-9. TBD
Content and diagrams to be provided.

---

## Mobile

- Alternating layout collapses to single-column: title (with highlight), diagram, description (stacked vertically)
- Diagrams scale proportionally — may need to be slightly larger on mobile for readability
- Hand-drawn aesthetic translates well to mobile (no precision needed)
- Hash anchors work for deep linking on mobile
- Generous touch targets if any elements become interactive later
