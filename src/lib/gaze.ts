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

export type GazeWanderPhase = "resting" | "glancing";

export type GazeWanderState = {
  phase: GazeWanderPhase;
  vector: GazeVector;
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
  return { phase: "resting", vector: { ...NEUTRAL_GAZE_VECTOR }, nextChangeAt: now + randomRestGapMs(random, config) };
}

/**
 * Pure step function for autonomous "bored, looks around" wander. Returns
 * the same state (by value) when `now < state.nextChangeAt`. Alternates a
 * long neutral rest with a brief glance to a random small offset — the
 * gaze-channel analog of the classic model's bored-idle scheduler, but
 * operating on eye *position* rather than canned path morphs.
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
    const angle = random() * Math.PI * 2;
    const magnitude = config.wanderMagnitude * (0.5 + random() * 0.5);
    return {
      phase: "glancing",
      vector: { x: clampUnit(Math.cos(angle) * magnitude), y: clampUnit(Math.sin(angle) * magnitude) },
      nextChangeAt: now + config.wanderHoldMs
    };
  }
  return { phase: "resting", vector: { ...NEUTRAL_GAZE_VECTOR }, nextChangeAt: now + randomRestGapMs(random, config) };
}
