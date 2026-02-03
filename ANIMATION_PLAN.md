# Cube Animation Plan

## Overview

The cube sits at the origin, tilted so 3 faces are visible. The camera is positioned at an angle (e.g., `[3, 2, 4]`) looking at the origin.

When a user double-clicks a face, a 3-phase animation plays to transition into that face's page.

**Key insight**: "Squared" means the face edges are perfectly horizontal and vertical on screen. This requires the camera to be along a principal axis (X, Y, or Z), not at an arbitrary angle.

---

## Phase 1: Rotate to Face

**Goal**: Rotate the cube so the selected face ends up aligned with its natural axis (pointing along +X, -X, +Y, -Y, +Z, or -Z).

**What happens**:
- The cube rotates around its center
- The selected face's normal vector rotates to point along its canonical axis direction
- Camera stays stationary at its default position `[3, 2, 4]`, watching the rotation
- At the end, the cube is in a canonical orientation where the target face points along a principal axis

**Example**: If clicking the "front" face:
- Cube rotates so the front face points along +Z axis
- The cube essentially "untwists" to show that face straight-on relative to world axes
- Camera is still at `[3, 2, 4]`, so you see the face at an angle

**Note**: After this phase, the face is in a "canonical" orientation - its edges align with world X/Y/Z axes. This is what enables the next phase to produce a squared view.

---

## Phase 2: Square (Camera Move)

**Goal**: Camera moves to view the face head-on, making it appear as a perfect square with edges aligned to screen edges.

**What happens**:
- Camera moves from its angled position `[3, 2, 4]` to be directly along the face's normal axis
- Camera ends up at a position like `[0, 0, distance]` for front face, `[distance, 0, 0]` for right face, etc.
- Camera looks at the face center
- Cube does NOT move during this phase
- At the end, you're looking straight at the face - edges are horizontal and vertical

**Why this works**:
- The face is now aligned with world axes (from Phase 1)
- The camera is along one of those axes
- The camera's up vector is world Y `[0, 1, 0]`
- Result: face edges align with screen horizontal/vertical

**Example**: For front face:
- Camera moves from `[3, 2, 4]` to `[0, 0, 5.4]`
- Camera looks at `[0, 0, 1]` (center of front face)
- Front face now appears as a perfect square

---

## Phase 3: Zoom In

**Goal**: Camera moves closer until the face fills the entire screen.

**What happens**:
- Camera moves straight toward the face along the normal axis
- Camera continues looking at face center
- Movement stops when face fills the viewport
- Screen fades/transitions to the face's page

**Example**: For front face:
- Camera moves from `[0, 0, 5.4]` toward `[0, 0, 1]`
- Stops at `[0, 0, 1 + fillDistance]` where fillDistance is calculated from FOV

---

## Zoom Out Animation (Reverse)

When leaving a face page back to the homepage:

### Phase 1: Zoom Out
- Start with camera close to face, looking straight at it
- Camera moves back along the face normal axis
- Face gets smaller on screen
- End position: camera at squared position (e.g., `[0, 0, 5.4]` for front face)

### Phase 2: Unsquare
- Camera moves from the squared position back to the default angled position `[3, 2, 4]`
- Camera gradually shifts look-at from face center to origin
- Cube stays in its canonical orientation (face still pointing along axis)

### Phase 3: Navigate
- Navigate to homepage with `?from=<faceId>` query param
- Homepage loads with cube in canonical orientation for that face

---

## Face Switch Animation

When switching from one face to another face's page:

### Phase 1: Zoom Out
- Same as zoom-out Phase 1

### Phase 2: Unsquare
- Same as zoom-out Phase 2
- Camera returns to default position `[3, 2, 4]`

### Phase 3: Rotate to New Face
- Cube rotates from current canonical orientation to new face's canonical orientation
- Camera stays at default position `[3, 2, 4]`

### Phase 4: Square to New Face
- Camera moves from `[3, 2, 4]` to new face's squared position
- Same as zoom-in Phase 2

### Phase 5: Zoom In
- Camera moves close to new face
- Same as zoom-in Phase 3

---

## Key Geometry

### Canonical Orientations
Each face has a "canonical" cube orientation where that face points along its natural axis:

| Face | Normal Direction | Face Center | Cube Quaternion |
|------|------------------|-------------|-----------------|
| Front | +Z | `[0, 0, 1]` | Identity (no rotation) |
| Back | -Z | `[0, 0, -1]` | 180° around Y |
| Right | +X | `[1, 0, 0]` | 90° around Y |
| Left | -X | `[-1, 0, 0]` | -90° around Y |
| Top | +Y | `[0, 1, 0]` | -90° around X |
| Bottom | -Y | `[0, -1, 0]` | 90° around X |

### Squared Camera Positions
Camera positions for viewing each face head-on:

```
distance = length([3, 2, 4]) ≈ 5.4

Front:  [0, 0, 5.4]   → looks at [0, 0, 1]
Back:   [0, 0, -5.4]  → looks at [0, 0, -1]
Right:  [5.4, 0, 0]   → looks at [1, 0, 0]
Left:   [-5.4, 0, 0]  → looks at [-1, 0, 0]
Top:    [0, 5.4, 0]   → looks at [0, 1, 0]
Bottom: [0, -5.4, 0]  → looks at [0, -1, 0]
```

### Fill Distance Calculation
```
fillDistance = faceSize / (2 * tan(fov / 2))
```
This positions the camera so the face exactly fills the viewport height.

---

## Easing

All phases use smooth easing (ease-in-out quintic) for a polished feel.

Each phase completes fully before the next begins - no blending or overlap.

---

## Implementation Notes

### Quaternion for Canonical Orientations
Instead of calculating arbitrary quaternions, use predefined quaternions for each face's canonical orientation. This ensures consistency and avoids floating-point drift.

### Camera Up Vector
The camera's up vector should always be world Y `[0, 1, 0]` except when viewing top/bottom faces, where it needs adjustment to avoid gimbal issues:
- Top face: camera up = `[0, 0, -1]`
- Bottom face: camera up = `[0, 0, 1]`

### Initial Cube Rotation
The cube's initial rotation (when homepage loads fresh) should be a slight tilt showing 3 faces. When returning from a face page, the cube should start in the canonical orientation for that face.

---

## Summary

| Phase | Cube | Camera Position | Camera Look-At |
|-------|------|-----------------|----------------|
| 1. Rotate | Rotates to canonical | Stationary at `[3,2,4]` | Origin |
| 2. Square | Stationary | Moves to axis-aligned | Face center |
| 3. Zoom | Stationary | Moves toward face | Face center |
