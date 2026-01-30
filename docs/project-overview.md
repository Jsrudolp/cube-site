# Project Overview — Jake's Cube Site

## Concept

A personal portfolio site structured as a 3D cube. Each of the six faces represents a different dimension of Jake Rudolph — career, music, product work, community, mental models, and personal vulnerability.

The site challenges the flatness of a traditional portfolio. Visitors land on the Resume face (what everyone expects), realize they can rotate the cube, and discover the other dimensions. The contrast between Face 1 (polished resume) and Face 6 (fears, failures, childhood) is the thesis: people are more than their LinkedIn.

**Tagline:** "a multi-dimensional website, made by a multidimensional person"

---

## Tech Stack

- **Framework:** Next.js + React
- **3D:** Three.js (React Three Fiber likely) for the cube scene
- **Styling:** TBD (Tailwind, CSS Modules, or styled-components)
- **Audio:** Self-hosted audio files with custom inline player
- **Deployment:** TBD (Vercel is the natural fit for Next.js)

---

## Architecture

### Pages & Routes

| Route | Face | Description |
|-------|------|-------------|
| `/` | Home | 3D cube view — the entry point |
| `/front` | Face 1: Resume | Career overview, links, CTA to explore |
| `/music` | Face 2: Music | Albums, performance hero, inline audio |
| `/building` | Face 3: Building | Product capabilities, toolbox, case studies |
| `/community` | Face 4: Community | Polaroid wall of community photos |
| `/thinking` | Face 5: Thinking Tools | 9 mental models, whiteboard aesthetic |
| `/back` | Face 6: Personal | Vulnerable content, flashlight mechanic |

Each face page supports **hash anchors** for deep linking to specific sections (e.g., `/thinking#systems-thinking`).

### Navigation Flow

1. User lands on `/` — sees the 3D cube with auto-rotation
2. User drags to rotate, clicks a face to enter
3. Camera zooms into the face, transitions to the 2D page at that route
4. "Zoom Out" button (top-right) or browser back returns to `/` (cube view)

### Performance Strategy

The cube and face pages are **separate rendering contexts**:

- **Cube view (`/`):** Three.js scene renders a cube with **6 static image textures** (screenshots/previews of each face). No live DOM rendering on faces. Lightweight.
- **Face pages (`/front`, `/music`, etc.):** Standard Next.js pages with full content. Heavy assets (audio, images, SVGs, shaders) only load when the face route is active.
- **Transition:** During the zoom-into-face animation, swap from the 3D scene to the 2D page. On "Zoom Out," reverse the transition.

This separation ensures the cube view stays fast regardless of how heavy individual face content gets.

---

## Global Elements

### Navigation Bar

Present on all face pages (not the cube home view):

- **Top-left:** 6 face icons — brain icon (home/cube) + 5 face-specific icons
  - Clicking the brain icon returns to cube view (same as "Zoom Out")
  - Clicking any other icon navigates directly to that face
  - The current face's icon is visually distinct (highlighted, different style)
- **Top-right:** "Zoom Out" text button — returns to cube view

### HUD (Home/Cube View Only)

- **Bottom-left:** Live timestamp (user's local time) + "X/6 faces visited" counter
- **Bottom-right:** "a multi-dimensional website, made by a multidimensional person"

### Face Visit Tracking

- Stored in `localStorage` as an array of visited face IDs (e.g., `["front", "music", "community"]`)
- Persists across sessions indefinitely (per-browser, per-device)
- Read on page load to display the counter and determine Face 6's flashlight radius
- Updated when a user enters a face page

### Loading States

- Face icons can serve as loading indicators during page/route transitions

---

## Mobile Considerations

- **Cube interaction:** Drag to rotate (touch + drag), tap a face to enter
- **Face pages:** Standard responsive layouts, scrollable
- **Face 4 (Community):** Horizontal scroll per community row + vertical scroll between rows
- **Face 6 (Personal):** Flashlight follows touch position (touch + drag to reveal content)
- **Tooltip/onboarding:** Same as desktop — auto-rotation + discoverable prompt on first load

---

## Design Philosophy

Each face has a **completely different design language**:

| Face | Palette | Aesthetic |
|------|---------|-----------|
| Front (Resume) | Light/cream, clean | Traditional resume, minimal |
| Music | Dark purple/navy | Concert poster, media-rich |
| Building | Warm peach/salmon | Toolbox metaphor, case study |
| Community | Light cream, ruled lines | Polaroid pinboard, tactile |
| Thinking | Light gray, textured | Whiteboard, hand-drawn |
| Back (Personal) | Black | Flashlight in darkness, raw |

The variety is intentional — each face feels like a different dimension of the same person. Unity comes from the shared navigation bar, the cube as a container, and Jake's voice throughout.
