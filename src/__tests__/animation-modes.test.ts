import { describe, it, expect } from "vitest";
import {
  easeInOutQuint,
  easeInOutSine,
  organicEase,
  springEase,
  updateMomentum,
  initMomentumState,
  updateSmooth,
  getSmoothRotationProgress,
  getSmoothZoomProgress,
} from "@/lib/animation-modes";

describe("easeInOutQuint", () => {
  it("returns 0 at t=0", () => {
    expect(easeInOutQuint(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeInOutQuint(1)).toBe(1);
  });

  it("returns 0.5 at t=0.5 (symmetric midpoint)", () => {
    expect(easeInOutQuint(0.5)).toBeCloseTo(0.5, 10);
  });

  it("is slow at the start (slow acceleration)", () => {
    // Very small t should give a very small output (quintic = tiny at start)
    expect(easeInOutQuint(0.1)).toBeLessThan(0.05);
  });

  it("is slow at the end (slow deceleration)", () => {
    // Close to 1, the remaining distance is tiny
    expect(easeInOutQuint(0.9)).toBeGreaterThan(0.95);
  });

  it("is monotonically increasing", () => {
    const samples = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    for (let i = 1; i < samples.length; i++) {
      expect(easeInOutQuint(samples[i])).toBeGreaterThan(easeInOutQuint(samples[i - 1]));
    }
  });

  it("output is always between 0 and 1", () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const v = easeInOutQuint(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe("easeInOutSine", () => {
  it("returns 0 at t=0", () => {
    expect(easeInOutSine(0)).toBeCloseTo(0, 10);
  });

  it("returns 1 at t=1", () => {
    expect(easeInOutSine(1)).toBeCloseTo(1, 10);
  });

  it("returns 0.5 at t=0.5", () => {
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 10);
  });

  it("is monotonically increasing", () => {
    for (let t = 0.1; t <= 1; t += 0.1) {
      expect(easeInOutSine(t)).toBeGreaterThan(easeInOutSine(t - 0.1));
    }
  });
});

describe("organicEase", () => {
  it("returns 0 at t=0", () => {
    expect(organicEase(0)).toBeCloseTo(0, 10);
  });

  it("returns 1 at t=1", () => {
    expect(organicEase(1)).toBeCloseTo(1, 10);
  });

  it("returns 0.5 at t=0.5", () => {
    expect(organicEase(0.5)).toBeCloseTo(0.5, 5);
  });

  it("is monotonically increasing", () => {
    for (let t = 0.1; t <= 1; t += 0.1) {
      expect(organicEase(t)).toBeGreaterThan(organicEase(t - 0.1));
    }
  });
});

describe("springEase", () => {
  it("starts near 0 at t=0", () => {
    expect(springEase(0)).toBeCloseTo(0, 1);
  });

  it("approaches 1 at t=1", () => {
    expect(springEase(1)).toBeGreaterThan(0.9);
  });

  it("underdamped can overshoot past 1", () => {
    // Default damping=0.7 is underdamped — may overshoot
    let maxVal = 0;
    for (let t = 0; t <= 1; t += 0.01) {
      maxVal = Math.max(maxVal, springEase(t));
    }
    // An underdamped spring can go above 1
    expect(maxVal).toBeGreaterThan(1);
  });

  it("critically damped (zeta >= 1) never overshoots", () => {
    for (let t = 0; t <= 1; t += 0.05) {
      expect(springEase(t, 1.0, 0.5)).toBeLessThanOrEqual(1.0 + 1e-10);
    }
  });
});

describe("updateMomentum", () => {
  it("moves position toward target over time", () => {
    let state = initMomentumState();
    const dt = 16; // ~60fps frame
    for (let i = 0; i < 100; i++) {
      state = updateMomentum(state, dt);
    }
    expect(state.position).toBeGreaterThan(0);
  });

  it("eventually reaches target and sets targetReached", () => {
    let state = initMomentumState();
    let iterations = 0;
    while (!state.targetReached && iterations < 10000) {
      state = updateMomentum(state, 16);
      iterations++;
    }
    expect(state.targetReached).toBe(true);
    expect(state.position).toBeCloseTo(1, 3);
  });

  it("does not update once targetReached", () => {
    const doneState = { position: 1, velocity: 0, targetReached: true };
    const next = updateMomentum(doneState, 16);
    expect(next).toBe(doneState); // same reference — no update
  });

  it("clamps position between 0 and 1", () => {
    let state = initMomentumState();
    for (let i = 0; i < 200; i++) {
      state = updateMomentum(state, 16);
      expect(state.position).toBeGreaterThanOrEqual(0);
      expect(state.position).toBeLessThanOrEqual(1);
    }
  });
});

describe("updateSmooth / getSmoothRotationProgress / getSmoothZoomProgress", () => {
  it("progress is 0 at elapsed=0", () => {
    const state = updateSmooth(0, 1000);
    expect(state.progress).toBeCloseTo(0, 10);
  });

  it("progress is 1 at elapsed >= totalDuration", () => {
    const state = updateSmooth(1000, 1000);
    expect(state.progress).toBeCloseTo(1, 10);
  });

  it("rotation progress is slightly ahead of zoom progress at midpoint", () => {
    const state = updateSmooth(500, 1000);
    expect(getSmoothRotationProgress(state)).toBeGreaterThanOrEqual(getSmoothZoomProgress(state));
  });

  it("rotation progress is clamped to 1", () => {
    const state = updateSmooth(1000, 1000);
    expect(getSmoothRotationProgress(state)).toBe(1);
  });
});
