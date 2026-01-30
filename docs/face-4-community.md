# Face 4: Community

**Route:** `/community`
**Design language:** Light cream background, polaroid pinboard aesthetic, tactile and warm

---

## Purpose

A visual celebration of seven years of building and leading communities. Mostly Socratica, but includes other communities. The design mimics a physical photo wall — polaroids pinned to strings with meaningful artifacts scattered between them. Minimal text; the photos tell the story.

---

## Layout

### Navigation

- **Top-left:** Face navigation icons. Current face icon (community) is visually distinct.
- **Top-right:** "zoom out" button (lowercase in design)

### Header

- **Title:** "jake's hosting wall" (lowercase, casual)
- **Subtitle:** "a polaroid collection of the communities i've built and lead over the past 7 years."
- Centered, understated

### Photo Wall

The wall is structured as **horizontal rows**, each representing a different community.

#### Row Structure

- **Horizontal strings/wires** run across the page (rendered as thin lines)
- **Polaroid photos** are "pinned" to the strings:
  - White border (polaroid frame)
  - Slightly rotated at varied angles (each photo has a random or intentional rotation)
  - Pinned with a small dot/pin at the top
  - Photos show community events, group shots, activities
- **SVG artifacts** are scattered between the polaroids in each row:
  - Each artifact is **meaningful to the community in that row**
  - Examples from design: trophy, ice cream cone, pumpkin, hockey jersey (Team Canada), traffic cone, guitar, "HOT GXRL WALK CLUB" note
  - Artifacts break up the photo grid and add personality
- **Organic placement** — not a rigid grid. Photos overlap slightly, vary in size, sit at different angles. Feels like a real bedroom wall.

#### Number of Rows

TBD — depends on number of communities. Each row = one community. The page scrolls vertically through rows.

---

## Interactivity

### SVG Artifact Hover States

- On hover (desktop), SVG artifacts animate subtly:
  - Examples: pumpkin eyes glow, trophy sparkles, guitar string vibrates
  - Adds life to the page without requiring complex interaction
  - CSS animations or lightweight JS — no heavy libraries needed
- On mobile: hover states don't apply (no cursor). These are static on mobile for now; can revisit later.

### Photos

- **Not interactive** in this iteration — purely visual
- Future consideration: click to enlarge, hover for caption/date, etc.

---

## Design Details

- **Background:** Light cream/off-white with faint horizontal ruled lines (like notebook paper or a pinboard)
- **Strings:** Thin horizontal lines spanning the page width, evenly spaced vertically
- **Polaroid frames:** White border (~8-10px equivalent), slight drop shadow, varied rotation (-5deg to +5deg range)
- **SVG artifacts:** Flat illustration style, colorful, sized to sit naturally among the polaroids
- **Typography:** Minimal — just the header. No captions on photos (in this iteration).
- **Overall feel:** Walking into someone's room and looking at their photo wall. Warm, personal, curated but not polished.

---

## Mobile

### Horizontal Scroll per Row

On mobile, the layout shifts:

- **Each community row scrolls horizontally** (overflow-x: scroll)
- Polaroids and artifacts within a row are laid out in a horizontal strip
- **Vertical scroll** moves between rows
- This preserves the "row = community" structure without cramming photos into a narrow column
- Scroll indicators (dots, fade edges, or subtle arrows) may help discoverability
- Snap scrolling (CSS scroll-snap) could feel nice but is optional

### Other Mobile Notes

- Polaroid rotation angles may need to be reduced on small screens for readability
- SVG artifacts remain static (no hover states on mobile)
- Header text sizes down proportionally
