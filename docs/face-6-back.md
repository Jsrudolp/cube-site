# Face 6: Personal

**Route:** `/back`
**Design language:** Fully black background, light text, raw and stripped-back

---

## Purpose

The most vulnerable face. Fears, failures, ADHD, childhood memories. The contrast with Face 1 (polished resume) is the entire point of the site. This face is deliberately last — both in emotional weight and through the progressive unlock mechanic.

---

## Flashlight Mechanic

### Core Concept

The page content exists but is hidden in complete darkness. A circular spotlight (centered on the cursor/touch position) reveals the content beneath. The user must actively explore the page by moving their cursor or finger — they can't passively scroll.

### Progressive Radius

The size of the flashlight radius is determined by **how many other faces the user has visited**:

| Faces Visited | Radius | Experience |
|---------------|--------|------------|
| 0 | Very small (~40-60px) | Nearly blind. Can barely read a word at a time. |
| 1 | Small (~80-100px) | Can see a phrase or two. |
| 2 | Medium-small (~120-150px) | Can read a sentence. |
| 3 | Medium (~180-220px) | Comfortable paragraph reading. |
| 4 | Large (~260-300px) | Can see most of a section. |
| 5 (all others) | Full or near-full (~400px+) | Can comfortably explore the whole page. |

*(Exact pixel values are approximate — will need tuning during implementation.)*

The radius is calculated on page load by reading the visited faces from `localStorage`. It does not change mid-session on this page (visiting another face and returning would update it, but that's an edge case).

### Implementation

- CSS `mask-image` with a radial gradient, or a canvas/WebGL overlay with a circular cutout
- The spotlight follows the cursor (desktop) or touch position (mobile) smoothly
- Slight easing/lag on the spotlight movement for a softer feel (not 1:1 with cursor)
- The area outside the spotlight is **fully opaque black** — not dimmed, not blurred, just black
- Content beneath is standard HTML — the flashlight is a visual layer on top

### Cube View (Home Page)

On the cube home view, Face 6's texture reflects the unlock state:
- If no faces visited: the face is **fully black** on the cube (no preview visible)
- As faces are visited: the cube texture could subtly hint at content (slight reveal, noise texture, etc.) — or remain black until entered. TBD on exact behavior.

---

## Layout

### Navigation

- **Top-left:** Face navigation icons (light on dark). Current face icon (personal) is visually distinct — design shows what appears to be a photo of Jake.
- **Top-right:** "Zoom Out" button (light text)

### Header

- **Name:** Jake Rudolph (bold, light text)
- **Subtitle:** "To be honest, still figuring it out"

### Divider

Horizontal rule.

### Body — Current

Bulleted list with nested sub-bullets. Bold on key emotional phrases.

- My biggest fears are:
  - 1) being a **boring** person
  - 2) building communities that are exclusive
  - 3) following a pre-defined pathway without thinking about why
- Most of the time, I feel like i'm both **too much** and **not enough**
- I believe that great things take a long time to build, often much longer than anyone would expect. Tenure is a value that I hold close, and feels contradictory to today's fashion.
- Projects i've worked on that never caught on include:
  - The Socratica theme song
  - Digital story-based escape rooms for studying
  - A skill-tree builder for self-development
- I was diagnosed with ADHD when I was a young child, but my parents **didn't tell me** until university. I've never taken medication, and often wonder what I'd be like if I could sit still for a minute. But in ways, I feel like its a superpower that I don't want to dampen.

### Body — Previously

Bold "Previously:" label, then bulleted list of childhood/formative memories:

- When I first moved to Canada from South Africa at 4 years old, I **scribbled** a treasure map all over my new bunk bed frame with permanent marker.
- I used to share a washroom with my sisters, because the en suite in my room was reserved as my **'science lab'**. Evaporation was a thrilling discovery.
- The only pizza I would eat as a child was thin-crust black olive pizza from Pizza Nova. Even kalamata olives wouldn't cut it. To this day, I'm still a **picky eater**, but have expanded my diet a lot. I credit friends that have peer pressured me into trying new foods, like blackened salmon, mushrooms and hot pot.
- When I played competitive basketball, I'd go games without scoring a basket. I learned how to be the person who **tries harder than everyone else**, dives for loose balls, sprints back on defence and is a good teammate.
- My inflection point to becoming a **\*leadership kid\*** was during my 8th grade student council, in which I was the VP of Eco, a position I've yet to see anywhere else.

### Divider

Horizontal rule.

### Footer

- "If you made it all the way here, let's be friends!"
- Instagram | Substack | jakesrudolph7@gmail.com

---

## Design Details

- **Background:** Black (#000 or near-black)
- **Text:** White/light gray
- **Bold phrases:** White, bold — stands out against the already-light text
- **Inline icons/emojis:** Small icons next to some items (Socratica icon, game controller, basketball, etc.) — same pattern as Face 1 with company favicons
- **Typography:** Same clean typeface as Face 1 (the Resume). This is intentional — the structure mirrors Face 1 (header, bullets, "Previously:", footer) but the content and tone are completely different. The parallel structure highlights the contrast.
- **Overall feel:** Honest, stripped back, intimate. No decorative elements. The darkness and flashlight do the emotional work.

---

## Mobile

### Touch-Follow Flashlight

- The spotlight follows the user's touch position
- Touch and drag to move the spotlight around the page
- The page scrolls vertically as normal — the flashlight position tracks the finger relative to the viewport
- Single-finger touch: moves flashlight and may scroll (need to handle this carefully)
- Consider: flashlight position could update on touch-move but scrolling happens normally, with the spotlight staying at the last touch position when the finger lifts

### Layout

- Same content layout as desktop — single column, standard responsive
- Progressive radius values may need adjustment for smaller screens (viewport-relative units like `vw` instead of `px`)
- Footer CTA and social links remain at the bottom
