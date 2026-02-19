# Building Page Content

## Structure
Each section includes:
- Title
- One-liner (subtitle)
- Description
- Tags (sub-skills)
- Project callouts (1-2 max)
- Image

---

## 1. Discovery
**One-liner:** The secret weapon of doing great work

**Description:** TBD

**Tags:** User interviews · Workflow mapping · Ethnographic research · Problem framing · Stakeholder synthesis

**Projects:**
- **Wygo** — mapped the core friction points for community builders before a single feature was scoped
- **Alma Care** — embedded with the team, shadowing their workflows while building, so the product reflected what I observed rather than what was simply requested

---

## 2. Design
**One-liner:** The sum of hundreds of small decisions

**Description:** TBD

**Tags:** Visual hierarchy · Product design · Brand consistency · Figma · Design systems · Typography

**Projects:**
- **Care Plan (Kindred)** — designed a simple, coherent product from the ground up with design as a first-class concern, not an afterthought

---

## 3. Engineering
**One-liner:** AI-native development from technical foundations

**Description:** TBD

**Tags:** TBD

**Projects:** TBD

---

## 4. Feedback Systems
**One-liner:** Compounding what works, sunsetting what doesn't

**Description:** TBD

**Tags:** TBD

**Projects:** TBD

---

## 5. Business Sense
**One-liner:** Creating value, not just products

**Description:** TBD

**Tags:** TBD

**Projects:** TBD

---

## 6. Scrappiness
**One-liner:** Everything else that it takes

**Description:** TBD

**Tags:** TBD

**Projects:** TBD

---

## Interactive Mechanics
- Custom cursor per section (cursor: none + SVG follower)
- One tool per section, changes on scroll via Intersection Observer
- Scrappiness section: cursor cycles through ALL tools on click
- Click drops a decoration at cursor position (tool-specific SVG)
- Decorations persist via localStorage { tool, x, y, rotation }

## Cursor → Section Mapping
| Section | Cursor Tool |
|---|---|
| Discovery | Magnifying glass |
| Design | Pencil |
| Engineering | Hammer |
| Feedback Systems | Stapler |
| Business Sense | Tape measure |
| Scrappiness | Cycles all |

## Visual Framing
- Each image has a construction-aesthetic frame (screws, tape, wood slats, etc.)
- Torn-paper callout style for project examples
