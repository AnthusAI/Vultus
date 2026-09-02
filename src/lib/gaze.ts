/**
 * Pure gaze/pointer-following math and scheduling. No DOM, no timers, no
 * randomness owned here — everything that varies is a parameter, so this
 * is deterministically testable. See useGazeBehavior.ts for the React/DOM
 * wiring that drives these functions from real time and real events.
 */

/** Normalized gaze offset; each component in [-1, 1]. */
export type GazeVector = { x: number; y: number };

/**
 * What drives a model's gaze:
 * - "none": no gaze behavior at all (default; existing consumers unaffected).
 * - "pointer": track the mouse/pen when one exists; autonomous wander otherwise.
 * - "auto": autonomous wander only, regardless of pointer presence.
 * - a fixed GazeVector: fully host-controlled, applied as-is.
 */
export type GazeSource = "none" | "pointer" | "auto" | GazeVector;

/** A model's eye-travel budget, in the model's own viewBox units. */
export type GazeGeometry = {
  travel: { left: number; right: number; up: number; down: number };
  /**
   * Vertical scale applied to the eyes at full blink closure, e.g. 0.15 =
   * squashed to 15% of open height. 1 disables the *visual* effect of
   * blinking (the timing still runs, it's just invisible) without
   * special-casing it elsewhere.
   */
  blinkClosedScaleY: number;
};

export type GazeConfig = {
  /** Ease duration when tracking toward a new pointer position. */
  trackMs: number;
  /** Ease duration when drifting back to neutral after the pointer rests. */
  driftBackMs: number;
  /** How long the pointer must be still before drift-back starts. */
  pointerRestMs: number;
  /** Proximity (px) within which an out-of-band "provoke" counts as relevant. */
  proximityPx: number;
  /** Autonomous wander: gap between glances, min/max. */
  wanderMinMs: number;
  wanderMaxMs: number;
  /** Autonomous wander: how long a glance is held before returning to rest. */
  wanderHoldMs: number;
  /** Autonomous wander: glance magnitude as a fraction of full travel, (0, 1]. */
  wanderMagnitude: number;
  /** Autonomous wander: chance of glancing (vs. blinking) each time it wakes from rest. */
  wanderGlanceChance: number;
  /** Autonomous wander: blink close/hold/open durations. */
  blinkCloseMs: number;
  blinkHoldMs: number;
  blinkOpenMs: number;
  easing: string;
};

export const DEFAULT_GAZE_CONFIG: GazeConfig = {
  trackMs: 220,
  driftBackMs: 480,
  pointerRestMs: 900,
  proximityPx: 240,
  wanderMinMs: 4000,
  wanderMaxMs: 9000,
  wanderHoldMs: 900,
  wanderMagnitude: 0.55,
  wanderGlanceChance: 0.6,
  blinkCloseMs: 90,
  blinkHoldMs: 40,
  blinkOpenMs: 130,
  easing: "cubic-bezier(0.22, 0.75, 0.18, 1)"
};

export const NEUTRAL_GAZE_VECTOR: GazeVector = { x: 0, y: 0 };

export const clampUnit = (value: number): number => Math.max(-1, Math.min(1, value));

/** mulberry32 — deterministic, seedable, dependency-free. For tests only. */
export function makeSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rect = { left: number; top: number; width: number; height: number };
type Point = { x: number; y: number };

/** Normalizes a viewport-space pointer into a [-1,1] vector relative to the element's center. */
export function computePointerGazeVector(rect: Rect, pointer: Point): GazeVector {
  if (rect.width <= 0 || rect.height <= 0) {
    return { ...NEUTRAL_GAZE_VECTOR };
  }
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    x: clampUnit((pointer.x - centerX) / (rect.width / 2)),
    y: clampUnit((pointer.y - centerY) / (rect.height / 2))
  };
}

/** True when the pointer is inside the rect or within proximityPx of its edge. */
export function isPointerWithinProximity(rect: Rect, pointer: Point, proximityPx: number): boolean {
  const nearestX = Math.max(rect.left, Math.min(pointer.x, rect.left + rect.width));
  const nearestY = Math.max(rect.top, Math.min(pointer.y, rect.top + rect.height));
  const dx = pointer.x - nearestX;
  const dy = pointer.y - nearestY;
  return Math.sqrt(dx * dx + dy * dy) <= proximityPx;
}

/**
 * Scales a normalized gaze vector by a model's asymmetric travel geometry,
 * producing a translate offset in the model's own coordinate units.
 */
export function applyGazeTravel(
  vector: GazeVector,
  travel: GazeGeometry["travel"]
): { dx: number; dy: number } {
  return {
    dx: vector.x >= 0 ? vector.x * travel.right : vector.x * travel.left,
    dy: vector.y >= 0 ? vector.y * travel.down : vector.y * travel.up
  };
}

/**
 * Maps a normalized eyelid position (0 = open, 1 = fully closed) to an
 * actual vertical scale factor, given a model's blink geometry. Kept
 * separate from the state machine so the state machine itself stays
 * model-agnostic (it works in normalized 0..1 terms, the same way
 * `vector` is normalized to [-1,1] and only scaled to real units by
 * applyGazeTravel) — the same split `applyGazeTravel` already uses.
 */
export function applyBlinkScale(eyelid: number, blinkClosedScaleY: number): number {
  return 1 - eyelid * (1 - blinkClosedScaleY);
}

export type GazeWanderPhase = "resting" | "glancing" | "eyesClosing" | "eyesOpening";

export type GazeWanderState = {
  phase: GazeWanderPhase;
  vector: GazeVector;
  /** 0 = open, 1 = fully closed. Normalized; see applyBlinkScale. */
  eyelid: number;
  /** Absolute timestamp (same clock as `now`) when this phase ends. */
  nextChangeAt: number;
};

/**
 * Starts "resting" with a randomized initial gap before the first glance
 * — the same wanderMinMs..wanderMaxMs window used between every later
 * glance — so a freshly (re)started wander sits still like a plain
 * logo for a while before it first looks around, rather than glancing
 * immediately.
 */
const randomRestGapMs = (random: () => number, config: GazeConfig): number =>
  config.wanderMinMs + random() * (config.wanderMaxMs - config.wanderMinMs);

export function createGazeWanderState(
  now: number,
  random: () => number,
  config: GazeConfig = DEFAULT_GAZE_CONFIG
): GazeWanderState {
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    eyelid: 0,
    nextChangeAt: now + randomRestGapMs(random, config)
  };
}

/**
 * Pure step function for autonomous "bored, looks around" wander. Returns
 * the same state (by value) when `now < state.nextChangeAt`. From rest,
 * randomly picks one of two bored actions — glance to a small random
 * offset, or blink — then returns to a long neutral rest. The gaze-channel
 * analog of the classic model's bored-idle scheduler (which randomly
 * picks among blink/glance/antenna-fidget), but operating on eye
 * *position and lid state* rather than canned path morphs.
 */
export function advanceGazeWander(
  state: GazeWanderState,
  now: number,
  random: () => number,
  config: GazeConfig = DEFAULT_GAZE_CONFIG
): GazeWanderState {
  if (now < state.nextChangeAt) {
    return state;
  }
  if (state.phase === "resting") {
    if (random() < config.wanderGlanceChance) {
      const angle = random() * Math.PI * 2;
      const magnitude = config.wanderMagnitude * (0.5 + random() * 0.5);
      return {
        phase: "glancing",
        vector: { x: clampUnit(Math.cos(angle) * magnitude), y: clampUnit(Math.sin(angle) * magnitude) },
        eyelid: 0,
        nextChangeAt: now + config.wanderHoldMs
      };
    }
    return {
      phase: "eyesClosing",
      vector: { ...NEUTRAL_GAZE_VECTOR },
      eyelid: 1,
      nextChangeAt: now + config.blinkCloseMs + config.blinkHoldMs
    };
  }
  if (state.phase === "eyesClosing") {
    return {
      phase: "eyesOpening",
      vector: { ...NEUTRAL_GAZE_VECTOR },
      eyelid: 0,
      nextChangeAt: now + config.blinkOpenMs
    };
  }
  // "glancing" or "eyesOpening" -> back to a long neutral rest.
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    eyelid: 0,
    nextChangeAt: now + randomRestGapMs(random, config)
  };
}
