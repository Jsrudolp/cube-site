/**
 * Tests for drag-tracking logic used in useCubeRotation and useFaceNavigation.
 *
 * The key behavior:
 *   - hasDragged resets to false on pointerdown
 *   - hasDragged is set to true when the pointer moves more than 5px from the press point
 *   - useFaceNavigation blocks navigation when hasDragged is true
 */
import { describe, it, expect } from "vitest";

/** Mirrors the threshold used in useCubeRotation.onPointerMove */
const DRAG_THRESHOLD_SQUARED = 25; // 5px²

/** Pure function mirroring the drag-detection logic in useCubeRotation */
function shouldSetHasDragged(
  pointerDownX: number,
  pointerDownY: number,
  currentX: number,
  currentY: number
): boolean {
  const dx = currentX - pointerDownX;
  const dy = currentY - pointerDownY;
  return dx * dx + dy * dy > DRAG_THRESHOLD_SQUARED;
}

describe("drag distance threshold", () => {
  it("does not flag a drag for zero movement", () => {
    expect(shouldSetHasDragged(100, 100, 100, 100)).toBe(false);
  });

  it("does not flag a drag for movement exactly at threshold (5px diagonal ≈ 3.5+3.5)", () => {
    // 3² + 4² = 25 = threshold, NOT greater than, so should NOT trigger
    expect(shouldSetHasDragged(0, 0, 3, 4)).toBe(false);
  });

  it("flags a drag for movement just over the threshold", () => {
    // 3² + 4² + epsilon > 25
    expect(shouldSetHasDragged(0, 0, 3.01, 4.01)).toBe(true);
  });

  it("flags a drag for 6px horizontal movement", () => {
    expect(shouldSetHasDragged(0, 0, 6, 0)).toBe(true);
  });

  it("flags a drag for 6px vertical movement", () => {
    expect(shouldSetHasDragged(0, 0, 0, 6)).toBe(true);
  });

  it("does not flag a drag for 4px horizontal movement", () => {
    expect(shouldSetHasDragged(0, 0, 4, 0)).toBe(false); // 16 < 25
  });

  it("handles negative movement correctly", () => {
    // Moving left by 6px
    expect(shouldSetHasDragged(100, 100, 94, 100)).toBe(true);
    // Moving up by 4px
    expect(shouldSetHasDragged(100, 100, 100, 96)).toBe(false);
  });

  it("computes from pointerdown position, not previous position", () => {
    // Simulate: down at (0,0), moves to (2,2), then to (4,4)
    // At (2,2): 4+4=8 < 25 → no drag
    expect(shouldSetHasDragged(0, 0, 2, 2)).toBe(false);
    // At (4,4): 16+16=32 > 25 → drag
    expect(shouldSetHasDragged(0, 0, 4, 4)).toBe(true);
  });
});

describe("hasDragged lifecycle (simulated state machine)", () => {
  /**
   * Simulate the full lifecycle:
   *   pointerDown → resets hasDragged to false
   *   pointerMove → may set hasDragged to true if distance > threshold
   *   click → checks hasDragged; blocks navigation if true
   */

  interface State {
    hasDragged: boolean;
    downX: number;
    downY: number;
  }

  function pointerDown(x: number, y: number): State {
    return { hasDragged: false, downX: x, downY: y };
  }

  function pointerMove(state: State, x: number, y: number): State {
    if (shouldSetHasDragged(state.downX, state.downY, x, y)) {
      return { ...state, hasDragged: true };
    }
    return state;
  }

  function shouldNavigate(state: State): boolean {
    return !state.hasDragged;
  }

  it("clean click (no movement) → navigation allowed", () => {
    let state = pointerDown(200, 300);
    state = pointerMove(state, 200, 300); // no movement
    expect(shouldNavigate(state)).toBe(true);
  });

  it("tiny movement (<5px) → navigation still allowed", () => {
    let state = pointerDown(200, 300);
    state = pointerMove(state, 202, 301); // 2px right, 1px down → 5 < 25
    expect(shouldNavigate(state)).toBe(true);
  });

  it("significant drag → navigation blocked", () => {
    let state = pointerDown(200, 300);
    state = pointerMove(state, 210, 300); // 10px → 100 > 25
    expect(shouldNavigate(state)).toBe(false);
  });

  it("once hasDragged is set, further small moves don't reset it", () => {
    let state = pointerDown(200, 300);
    state = pointerMove(state, 210, 300); // drag flagged
    state = pointerMove(state, 200, 300); // back to start, but hasDragged stays true
    expect(state.hasDragged).toBe(true);
    expect(shouldNavigate(state)).toBe(false);
  });

  it("new pointerDown resets hasDragged, allowing navigation again", () => {
    // First press+drag
    let state = pointerDown(200, 300);
    state = pointerMove(state, 230, 300); // drag
    expect(shouldNavigate(state)).toBe(false);

    // New press at the current position (user lifts and re-presses)
    state = pointerDown(230, 300); // fresh press resets hasDragged
    state = pointerMove(state, 231, 300); // tiny move (1px → 1 < 25)
    expect(shouldNavigate(state)).toBe(true);
  });

  it("slow drag across many small moves accumulates to flag hasDragged", () => {
    let state = pointerDown(0, 0);
    // Move 1px at a time — individually each is below threshold, but total grows
    for (let x = 1; x <= 6; x++) {
      state = pointerMove(state, x, 0);
    }
    // After 6 total pixels, should be flagged
    expect(state.hasDragged).toBe(true);
  });
});
