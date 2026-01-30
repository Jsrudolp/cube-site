# Face 2: Music

**Route:** `/music`
**Design language:** Dark purple/navy background, concert-poster energy

---

## Purpose

Showcases Jake's music — original songs written and recorded, album artwork, and performance photography. The tonal shift from Face 1 is immediate: dark background, full-bleed imagery, no bullet points. This is a creative space.

---

## Layout

### Navigation

- **Top-left:** Face navigation icons (on dark background — adjusted for contrast). Current face icon (music) is visually distinct.
- **Top-right:** "Zoom Out" button (light text on dark)

### Hero Section

- **Full-bleed performance photo** — Jake on stage, silhouette with purple stage lighting and haze
- **Overlay text (centered on the image):**
  - "NEW DEMO" (small, uppercase, regular weight)
  - "SUPERMAGNETIC" (large, bold, uppercase — the latest release)
  - "LISTEN NOW" button (outlined/bordered, white text, centered below title)
- "LISTEN NOW" triggers the inline audio player for the SUPERMAGNETIC album

### Section Header

- "MUSIC" in bold uppercase with an underline/rule beneath

### Album Grid

3-column grid, 2 rows (6 albums total):

| Row 1 | Row 2 |
|-------|-------|
| Suffocating | Lab Rat |
| Already Warned | Falling Down |
| SUPERMAGNETIC | Friendship Cemetery |

Each album card:
- **Album cover art** (square image)
- **Title** below the cover (uppercase, centered)
- **Clickable** — clicking the cover opens/expands an inline audio player

### Inline Audio Player

When an album cover is clicked:
- An audio player appears inline (below the album grid, or expanding from the clicked album — TBD)
- Custom-styled player matching the dark aesthetic
- Controls: play/pause, scrubber/progress bar, track name
- If the album has multiple tracks, show a tracklist
- Audio is **self-hosted** (files served from the site's own CDN/static assets)
- Only one player active at a time — clicking a different album swaps the player content

### Footer Note

- "Raw demos of songs I've written and recorded + album artwork and photography + code."
- "Click or press on an album cover to listen."
- Centered, smaller text, muted color

---

## Design Details

- **Background:** Dark purple/navy (#1a1a2e or similar — exact color TBD from designs)
- **Text:** White/light for contrast
- **Album covers:** Square aspect ratio, slight rounded corners or no rounding (TBD)
- **Hero image:** Full viewport width, roughly 50-60% viewport height
- **Typography:** Bold, uppercase headers. Clean body text.
- **Overall feel:** Concert poster meets music portfolio. Visual-first, minimal text.

---

## Audio Implementation

- Self-hosted audio files (MP3 or similar)
- Custom HTML5 audio player styled to match the dark theme
- Lazy-load audio — don't load files until an album is clicked
- Consider preloading the hero album (SUPERMAGNETIC) since "LISTEN NOW" is the primary CTA

---

## Mobile

- Hero image scales to full width, maintains aspect ratio
- Album grid becomes 2-column or 1-column depending on screen width
- Inline audio player appears below the grid (full-width)
- Touch to select an album
