import { describe, expect, it } from "vitest";
import {
  DEFAULT_GAZE_CONFIG,
  advanceGazeWander,
  applyGazeTravel,
  clampUnit,
  computePointerGazeVector,
  createGazeWanderState,
  isPointerWithinProximity,
  makeSeededRandom
} from "../lib/gaze";

describe("makeSeededRandom", () => {
  it("is deterministic for a given seed", () => {
    const a = makeSeededRandom(42);
    const b = makeSeededRandom(42);
    const sequenceA = Array.from({ length: 20 }, () => a());
    const sequenceB = Array.from({ length: 20 }, () => b());
    expect(sequenceA).toEqual(sequenceB);
  });

  it("produces values in [0, 1)", () => {
    const random = makeSeededRandom(7);
    for (let i = 0; i < 200; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("clampUnit", () => {
  it("clamps to [-1, 1]", () => {
    expect(clampUnit(5)).toBe(1);
    expect(clampUnit(-5)).toBe(-1);
    expect(clampUnit(0.3)).toBe(0.3);
  });
});

describe("computePointerGazeVector", () => {
  const rect = { left: 100, top: 100, width: 40, height: 40 }; // center (120, 120)

  it("returns neutral for a pointer at the element center", () => {
    expect(computePointerGazeVector(rect, { x: 120, y: 120 })).toEqual({ x: 0, y: 0 });
  });

  it("points right for a pointer to the right of center", () => {
    const vector = computePointerGazeVector(rect, { x: 140, y: 120 });
    expect(vector.x).toBeCloseTo(1, 5);
    expect(vector.y).toBeCloseTo(0, 5);
  });

  it("points left for a pointer to the left of center", () => {
    const vector = computePointerGazeVector(rect, { x: 100, y: 120 });
    expect(vector.x).toBeCloseTo(-1, 5);
  });

  it("points up (negative y) for a pointer above center", () => {
    const vector = computePointerGazeVector(rect, { x: 120, y: 100 });
    expect(vector.y).toBeCloseTo(-1, 5);
  });

  it("points down (positive y) for a pointer below center", () => {
    const vector = computePointerGazeVector(rect, { x: 120, y: 140 });
    expect(vector.y).toBeCloseTo(1, 5);
  });

  it("clamps far-away pointers to the unit range", () => {
    const vector = computePointerGazeVector(rect, { x: 10_000, y: -10_000 });
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(-1);
  });

  it("returns neutral for a degenerate (zero-size) rect", () => {
    expect(computePointerGazeVector({ left: 0, top: 0, width: 0, height: 0 }, { x: 5, y: 5 })).toEqual({
      x: 0,
      y: 0
    });
  });
});

describe("isPointerWithinProximity", () => {
  const rect = { left: 100, top: 100, width: 20, height: 20 };

  it("is true when the pointer is inside the rect", () => {
    expect(isPointerWithinProximity(rect, { x: 110, y: 110 }, 0)).toBe(true);
  });

  it("is true within the radius of an edge", () => {
    expect(isPointerWithinProximity(rect, { x: 130, y: 110 }, 20)).toBe(true);
  });

  it("is false outside the radius", () => {
    expect(isPointerWithinProximity(rect, { x: 500, y: 500 }, 20)).toBe(false);
  });
});

describe("applyGazeTravel", () => {
  const travel = { left: 2.4, right: 1.5, up: 1.2, down: 1.0 };

  it("scales rightward vectors by the right budget", () => {
    expect(applyGazeTravel({ x: 1, y: 0 }, travel)).toEqual({ dx: 1.5, dy: 0 });
  });

  it("scales leftward vectors by the left budget", () => {
    expect(applyGazeTravel({ x: -1, y: 0 }, travel)).toEqual({ dx: -2.4, dy: 0 });
  });

  it("scales downward vectors by the down budget", () => {
    expect(applyGazeTravel({ x: 0, y: 1 }, travel)).toEqual({ dx: 0, dy: 1.0 });
  });

  it("scales upward vectors by the up budget", () => {
    expect(applyGazeTravel({ x: 0, y: -1 }, travel)).toEqual({ dx: 0, dy: -1.2 });
  });

  it("is proportional, not just clamped, for partial vectors", () => {
    expect(applyGazeTravel({ x: 0.5, y: -0.5 }, travel)).toEqual({ dx: 0.75, dy: -0.6 });
  });
});

describe("gaze wander state machine", () => {
  it("starts at rest, with a randomized initial gap before the first glance", () => {
    const random = makeSeededRandom(5);
    const state = createGazeWanderState(1000, random);
    expect(state.phase).toBe("resting");
    expect(state.vector).toEqual({ x: 0, y: 0 });
    // Must NOT be due immediately (nextChangeAt === now) — a freshly
    // (re)started wander should sit still for a natural gap first,
    // exactly like the mid-cycle rest-then-glance transition below.
    expect(state.nextChangeAt).toBeGreaterThanOrEqual(1000 + DEFAULT_GAZE_CONFIG.wanderMinMs);
    expect(state.nextChangeAt).toBeLessThanOrEqual(1000 + DEFAULT_GAZE_CONFIG.wanderMaxMs);
  });

  it("does not change before nextChangeAt", () => {
    const random = makeSeededRandom(1);
    const state = createGazeWanderState(1000, random);
    const advanced = advanceGazeWander(state, state.nextChangeAt - 1, random);
    expect(advanced).toBe(state);
  });

  it("moves rest -> glance -> rest, staying within the configured hold/gap windows", () => {
    const random = makeSeededRandom(3);
    let state = createGazeWanderState(0, random);
    const firstRestEnd = state.nextChangeAt;

    state = advanceGazeWander(state, firstRestEnd, random);
    expect(state.phase).toBe("glancing");
    expect(state.vector).not.toEqual({ x: 0, y: 0 });
    expect(state.nextChangeAt).toBe(firstRestEnd + DEFAULT_GAZE_CONFIG.wanderHoldMs);

    state = advanceGazeWander(state, state.nextChangeAt, random);
    expect(state.phase).toBe("resting");
    expect(state.vector).toEqual({ x: 0, y: 0 });
    const secondRestDuration = state.nextChangeAt - (firstRestEnd + DEFAULT_GAZE_CONFIG.wanderHoldMs);
    expect(secondRestDuration).toBeGreaterThanOrEqual(DEFAULT_GAZE_CONFIG.wanderMinMs);
    expect(secondRestDuration).toBeLessThanOrEqual(DEFAULT_GAZE_CONFIG.wanderMaxMs);
  });

  it("keeps glance magnitude within [0.5, 1] of wanderMagnitude", () => {
    const random = makeSeededRandom(99);
    let state = createGazeWanderState(0, random);
    for (let i = 0; i < 50; i += 1) {
      state = advanceGazeWander(state, state.nextChangeAt, random);
      if (state.phase === "glancing") {
        const magnitude = Math.sqrt(state.vector.x ** 2 + state.vector.y ** 2);
        expect(magnitude).toBeGreaterThanOrEqual(DEFAULT_GAZE_CONFIG.wanderMagnitude * 0.5 - 1e-9);
        expect(magnitude).toBeLessThanOrEqual(DEFAULT_GAZE_CONFIG.wanderMagnitude + 1e-9);
      }
    }
  });

  it("is deterministic for a fixed seed", () => {
    const runOnce = () => {
      const random = makeSeededRandom(2024);
      let state = createGazeWanderState(0, random);
      const phases: string[] = [];
      for (let i = 0; i < 10; i += 1) {
        state = advanceGazeWander(state, state.nextChangeAt, random);
        phases.push(`${state.phase}:${state.vector.x.toFixed(4)}:${state.vector.y.toFixed(4)}`);
      }
      return phases;
    };
    expect(runOnce()).toEqual(runOnce());
  });
});
