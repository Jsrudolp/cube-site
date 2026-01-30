# Home — The Cube

**Route:** `/`

## Overview

The landing page is the 3D cube itself. No content pages load here — just a Three.js scene with the cube floating in space, angled to show approximately three faces at once. The Resume face (`/front`) is the default front-facing orientation.

---

## 3D Scene

### The Cube

- Rendered with Three.js (React Three Fiber)
- Six faces, each textured with a **static image** (screenshot/preview of that face's content)
- Face 6 (`/back`) texture starts as **fully black** — progressively reveals as other faces are visited (see Face 6 spec)
- Default orientation: Resume face front-left, angled to show 3 faces
- Soft shadow beneath the cube
- Light/neutral gray background

### Camera & Lighting

- Perspective camera, positioned to show the cube at a slight isometric-like angle
- Soft ambient lighting + directional light for shadow
- Camera is static until user interaction or face-enter animation

---

## Interaction

### Auto-Rotation

- On load, the cube slowly auto-rotates (gentle, continuous)
- Auto-rotation **stops** when the user interacts (mouse enter on desktop, first touch on mobile)
- Does **not** resume after interaction (user has control)

### Rotation Control

- **Desktop:** Click + drag to rotate the cube freely
- **Mobile:** Touch + drag to rotate
- Rotation should feel smooth with momentum/inertia (slight drift after release)

### Entering a Face

- **Desktop:** Click on a visible face
- **Mobile:** Tap on a visible face
- **Animation:** Camera zooms forward into the clicked face until it fills the viewport
- **Transition:** At the end of the zoom, swap to the 2D page route (e.g., `/music`)
- The transition should feel seamless — the static texture on the cube face aligns with the actual page content so the swap is invisible or near-invisible

### Discoverable Prompt

- If no interaction occurs within ~3 seconds of page load, fade in a subtle tooltip:
  - Something like "drag to explore" or "click a face to enter"
  - Disappears on first interaction
  - Does not reappear once dismissed (session-based, no need to persist)

---

## HUD Elements

Overlaid on the 3D scene (HTML layer on top of the canvas):

### Bottom-Left
- **Line 1:** Live timestamp — user's local time, formatted as `HH:MM AM/PM on MM/DD/YYYY`
- **Line 2:** `X/6 faces visited` — reads from `localStorage`, updates if the user returns from a face

### Bottom-Right
- `a multi-dimensional website, made by a multidimensional person`

### Styling
- Small, understated text — should not compete with the cube
- Light gray or muted color on the neutral background
- No navigation bar on this page (the nav bar only appears on face pages)

---

## Returning to the Cube

When a user navigates back from a face page (via "Zoom Out", nav brain icon, or browser back):

- Route changes to `/`
- The cube reappears, oriented to show the face the user just came from (so the transition feels continuous)
- No auto-rotation on return (user already knows how to interact)
- HUD updates with the new visited count

---

## Mobile

- Same 3D scene, same cube
- Touch + drag to rotate
- Tap to enter a face
- HUD elements reposition as needed for smaller viewports
- Tooltip prompt adapts: "tap a face to enter" or similar
- Performance consideration: may need to reduce texture resolution or simplify shadows on mobile devices
