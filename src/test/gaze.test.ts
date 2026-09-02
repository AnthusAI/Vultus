import { describe, expect, it } from "vitest";
import {
  DEFAULT_GAZE_CONFIG,
  advanceBlinkState,
  advanceGazeWander,
  applyBlinkScale,
  applyBodyFlinchRecoil,
  applyGazeTravel,
  buildBodyFlinchSteps,
  clampUnit,
  computePointerGazeVector,
  createBlinkState,
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

describe("applyBlinkScale", () => {
  it("is 1 (open) when eyelid is 0", () => {
    expect(applyBlinkScale(0, 0.15)).toBe(1);
  });

  it("equals blinkClosedScaleY when eyelid is 1 (fully closed)", () => {
    expect(applyBlinkScale(1, 0.15)).toBeCloseTo(0.15, 10);
  });

  it("interpolates linearly in between", () => {
    expect(applyBlinkScale(0.5, 0.2)).toBeCloseTo(0.6, 10);
  });

  it("is a no-op (always 1) when blinkClosedScaleY is 1", () => {
    expect(applyBlinkScale(0, 1)).toBe(1);
    expect(applyBlinkScale(1, 1)).toBe(1);
  });
});

describe("blink state machine (independent of wander)", () => {
  it("starts open, with a randomized initial gap before the first blink", () => {
    const random = makeSeededRandom(5);
    const state = createBlinkState(1000, random);
    expect(state.phase).toBe("open");
    expect(state.eyelid).toBe(0);
    expect(state.nextChangeAt).toBeGreaterThanOrEqual(1000 + DEFAULT_GAZE_CONFIG.blinkMinMs);
    expect(state.nextChangeAt).toBeLessThanOrEqual(1000 + DEFAULT_GAZE_CONFIG.blinkMaxMs);
  });

  it("does not change before nextChangeAt", () => {
    const random = makeSeededRandom(1);
    const state = createBlinkState(1000, random);
    const advanced = advanceBlinkState(state, state.nextChangeAt - 1, random);
    expect(advanced).toBe(state);
  });

  it("cycles open -> closing -> opening -> open", () => {
    const random = makeSeededRandom(9);
    let state = createBlinkState(0, random);
    const openEnds = state.nextChangeAt;

    state = advanceBlinkState(state, openEnds, random);
    expect(state.phase).toBe("closing");
    expect(state.eyelid).toBe(1);
    expect(state.nextChangeAt).toBe(openEnds + DEFAULT_GAZE_CONFIG.blinkCloseMs + DEFAULT_GAZE_CONFIG.blinkHoldMs);

    const closingEnds = state.nextChangeAt;
    state = advanceBlinkState(state, closingEnds, random);
    expect(state.phase).toBe("opening");
    expect(state.eyelid).toBe(0);
    expect(state.nextChangeAt).toBe(closingEnds + DEFAULT_GAZE_CONFIG.blinkOpenMs);

    // The gap scheduled *after* the first blink uses the slower,
    // wider "subsequent" range, not the initial one.
    const openingEnds = state.nextChangeAt;
    state = advanceBlinkState(state, openingEnds, random);
    expect(state.phase).toBe("open");
    expect(state.eyelid).toBe(0);
    expect(state.nextChangeAt).toBeGreaterThanOrEqual(openingEnds + DEFAULT_GAZE_CONFIG.blinkSubsequentMinMs);
    expect(state.nextChangeAt).toBeLessThanOrEqual(openingEnds + DEFAULT_GAZE_CONFIG.blinkSubsequentMaxMs);
  });

  it("blinks at a human-like cadence (a few seconds, not tens of seconds)", () => {
    // Directly guards the "it never blinked" regression: the gap between
    // blinks must be short enough that a person watching for even a
    // fairly short stretch sees one, unlike the old shared wander gap
    // (4-9s) which was further diluted by a coin-flip against glancing.
    expect(DEFAULT_GAZE_CONFIG.blinkMinMs).toBeLessThanOrEqual(3000);
    expect(DEFAULT_GAZE_CONFIG.blinkMaxMs).toBeLessThanOrEqual(7000);
  });

  it("is slower on average and more spread out after the first blink (less regular)", () => {
    const initialAvg = (DEFAULT_GAZE_CONFIG.blinkMinMs + DEFAULT_GAZE_CONFIG.blinkMaxMs) / 2;
    const initialRange = DEFAULT_GAZE_CONFIG.blinkMaxMs - DEFAULT_GAZE_CONFIG.blinkMinMs;
    const subsequentAvg = (DEFAULT_GAZE_CONFIG.blinkSubsequentMinMs + DEFAULT_GAZE_CONFIG.blinkSubsequentMaxMs) / 2;
    const subsequentRange = DEFAULT_GAZE_CONFIG.blinkSubsequentMaxMs - DEFAULT_GAZE_CONFIG.blinkSubsequentMinMs;
    expect(subsequentAvg).toBeGreaterThan(initialAvg);
    expect(subsequentRange).toBeGreaterThan(initialRange);
  });

  it("is deterministic for a fixed seed", () => {
    const runOnce = () => {
      const random = makeSeededRandom(4242);
      let state = createBlinkState(0, random);
      const phases: string[] = [];
      for (let i = 0; i < 12; i += 1) {
        state = advanceBlinkState(state, state.nextChangeAt, random);
        phases.push(`${state.phase}:${state.eyelid}`);
      }
      return phases;
    };
    expect(runOnce()).toEqual(runOnce());
  });
});

describe("buildBodyFlinchSteps", () => {
  it("squashes in, overshoots past 1, then settles exactly at 1", () => {
    const steps = buildBodyFlinchSteps(DEFAULT_GAZE_CONFIG);
    expect(steps).toHaveLength(3);
    expect(steps[0].scale).toBe(DEFAULT_GAZE_CONFIG.bodyFlinchSquashScale);
    expect(steps[0].scale).toBeLessThan(1);
    expect(steps[1].scale).toBe(DEFAULT_GAZE_CONFIG.bodyFlinchOvershootScale);
    expect(steps[1].scale).toBeGreaterThan(1);
    expect(steps[2].scale).toBe(1);
  });

  it("recoils fully away on the squash, wobbles back past center, then settles centered", () => {
    const steps = buildBodyFlinchSteps(DEFAULT_GAZE_CONFIG);
    expect(steps[0].recoilFactor).toBe(1);
    expect(steps[1].recoilFactor).toBeLessThan(0); // the asymmetric counter-wobble
    expect(steps[2].recoilFactor).toBe(0);
  });

  it("uses the configured durations for each step", () => {
    const steps = buildBodyFlinchSteps(DEFAULT_GAZE_CONFIG);
    expect(steps[0].durationMs).toBe(DEFAULT_GAZE_CONFIG.bodyFlinchInMs);
    expect(steps[1].durationMs).toBe(DEFAULT_GAZE_CONFIG.bodyFlinchOvershootMs);
    expect(steps[2].durationMs).toBe(DEFAULT_GAZE_CONFIG.bodyFlinchSettleMs);
  });

  it("total duration matches the sum of all step waits", () => {
    const config = DEFAULT_GAZE_CONFIG;
    const steps = buildBodyFlinchSteps(config);
    const total = steps.reduce((sum, s) => sum + s.waitMs, 0);
    expect(total).toBe(config.bodyFlinchInMs + config.bodyFlinchOvershootMs + config.bodyFlinchSettleMs);
  });

  it("is quick overall (under half a second) so it reads as a snappy reaction", () => {
    const config = DEFAULT_GAZE_CONFIG;
    const total = config.bodyFlinchInMs + config.bodyFlinchOvershootMs + config.bodyFlinchSettleMs;
    expect(total).toBeLessThan(500);
  });
});

describe("applyBodyFlinchRecoil", () => {
  const awayFromClick = { x: 1, y: 0 }; // clicked on the left, recoils right

  it("scales translate by recoilFactor and recoilDistance", () => {
    expect(applyBodyFlinchRecoil(1, awayFromClick, 3, 8)).toEqual({ dx: 3, dy: 0, rotation: 8 });
    expect(applyBodyFlinchRecoil(0.5, awayFromClick, 3, 8)).toEqual({ dx: 1.5, dy: 0, rotation: 4 });
  });

  it("is centered (zero translate/rotation) at recoilFactor 0", () => {
    expect(applyBodyFlinchRecoil(0, awayFromClick, 3, 8)).toEqual({ dx: 0, dy: 0, rotation: 0 });
  });

  it("flips sign for a negative recoilFactor (the counter-wobble)", () => {
    const result = applyBodyFlinchRecoil(-0.35, awayFromClick, 3, 8);
    expect(result.dx).toBeCloseTo(-1.05, 10);
    expect(result.dy).toBeCloseTo(0, 10);
    expect(result.rotation).toBeCloseTo(-2.8, 10);
  });

  it("resolves diagonal directions proportionally on both axes", () => {
    const diagonal = { x: 0.6, y: -0.8 };
    const result = applyBodyFlinchRecoil(1, diagonal, 10, 8);
    expect(result.dx).toBeCloseTo(6, 10);
    expect(result.dy).toBeCloseTo(-8, 10);
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
