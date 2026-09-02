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
  /**
   * Whether clicking the mark triggers a whole-body flinch (see
   * buildBodyFlinchSteps). Applied to the model's root rig group — the
   * same element the classic model's GSAP idle animations (breathing,
   * happy bounce) animate for non-neutral states, so this must stay
   * `false` for any model that runs those concurrently with gaze, to
   * avoid two systems fighting over the same transform. Safe to enable
   * for any model using `neutralIdleMode="static"` (no GSAP idle at all).
   */
  bodyFlinch: boolean;
  /**
   * How far the flinch recoils away from the click point, in the model's
   * own viewBox units. Only meaningful when bodyFlinch is true.
   */
  bodyFlinchRecoilDistance: number;
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
  /**
   * Idle blink: an independent, always-running rhythm (like a person's),
   * decoupled from wander's glance timing so it can't get "crowded out"
   * by a run of glances. blinkMinMs/MaxMs governs only the very first
   * blink after mount (kept snappy — the initial "waking up" beat);
   * every blink after that uses blinkSubsequentMinMs/MaxMs instead,
   * which is deliberately slower on average *and* wider (more variance)
   * so the rhythm doesn't read as a metronome.
   */
  blinkMinMs: number;
  blinkMaxMs: number;
  blinkSubsequentMinMs: number;
  blinkSubsequentMaxMs: number;
  /** Blink close/hold/open durations (the motion itself, not the gap). */
  blinkCloseMs: number;
  blinkHoldMs: number;
  blinkOpenMs: number;
  /**
   * Defensive squint: a sustained, protective partial-close while the
   * pointer is directly over the mark — not a full blink (that would
   * look like the idle blink), and not a one-shot animation: it holds
   * for as long as the pointer stays, and releases when it leaves.
   */
  defensiveSquintEyelid: number; // 0..1, partial closure
  defensiveSquintInMs: number; // transition into the squint on rollover
  defensiveSquintOutMs: number; // transition back to open on rollout
  /**
   * Body flinch: a whole-body recoil-and-spring-back reaction triggered
   * by clicking the mark. Recoils away from the click point, overshoots
   * back past center/1 scale, then settles — a quick "startled" bounce.
   * The rotation wobble (full away, then a smaller twist back the other
   * way before settling flat) is what makes it read as asymmetric and a
   * little awkward rather than a clean, mechanical bounce.
   */
  bodyFlinchSquashScale: number;
  bodyFlinchOvershootScale: number;
  /** Max rotation (degrees) at the peak of the recoil; signed by click side. */
  bodyFlinchRotationDeg: number;
  bodyFlinchInMs: number;
  bodyFlinchOvershootMs: number;
  bodyFlinchSettleMs: number;
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
  blinkMinMs: 2500,
  blinkMaxMs: 6500,
  blinkSubsequentMinMs: 3500,
  blinkSubsequentMaxMs: 11000,
  blinkCloseMs: 90,
  blinkHoldMs: 40,
  blinkOpenMs: 130,
  defensiveSquintEyelid: 0.6,
  defensiveSquintInMs: 90,
  defensiveSquintOutMs: 160,
  bodyFlinchSquashScale: 0.85,
  bodyFlinchOvershootScale: 1.06,
  bodyFlinchRotationDeg: 7,
  bodyFlinchInMs: 70,
  bodyFlinchOvershootMs: 140,
  bodyFlinchSettleMs: 120,
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

export type BlinkPhase = "open" | "closing" | "opening";

export type BlinkState = {
  phase: BlinkPhase;
  /** 0 = open, 1 = fully closed. Normalized; see applyBlinkScale. */
  eyelid: number;
  /** Absolute timestamp (same clock as `now`) when this phase ends. */
  nextChangeAt: number;
};

const randomInitialBlinkGapMs = (random: () => number, config: GazeConfig): number =>
  config.blinkMinMs + random() * (config.blinkMaxMs - config.blinkMinMs);

/** Slower and wider-spread than the initial gap, so the rhythm doesn't feel metronomic. */
const randomSubsequentBlinkGapMs = (random: () => number, config: GazeConfig): number =>
  config.blinkSubsequentMinMs + random() * (config.blinkSubsequentMaxMs - config.blinkSubsequentMinMs);

/**
 * Independent blink rhythm — deliberately NOT tied to wander's glance
 * timer, so a run of glances (or a long stretch of pointer tracking)
 * can never crowd out blinking the way a person's eyes wouldn't stop
 * blinking just because they're looking around or watching something.
 * The very first gap (created here) is snappier than every gap after
 * it (scheduled by advanceBlinkState's "opening" -> "open" transition)
 * — a quick first blink reads as "waking up"; a uniform cadence after
 * that reads as mechanical.
 */
export function createBlinkState(
  now: number,
  random: () => number,
  config: GazeConfig = DEFAULT_GAZE_CONFIG
): BlinkState {
  return { phase: "open", eyelid: 0, nextChangeAt: now + randomInitialBlinkGapMs(random, config) };
}

export function advanceBlinkState(
  state: BlinkState,
  now: number,
  random: () => number,
  config: GazeConfig = DEFAULT_GAZE_CONFIG
): BlinkState {
  if (now < state.nextChangeAt) {
    return state;
  }
  if (state.phase === "open") {
    return { phase: "closing", eyelid: 1, nextChangeAt: now + config.blinkCloseMs + config.blinkHoldMs };
  }
  if (state.phase === "closing") {
    return { phase: "opening", eyelid: 0, nextChangeAt: now + config.blinkOpenMs };
  }
  return { phase: "open", eyelid: 0, nextChangeAt: now + randomSubsequentBlinkGapMs(random, config) };
}

export type BodyFlinchStep = {
  scale: number;
  /**
   * How much of the full away-from-click recoil distance/rotation this
   * step applies: 1 = full recoil away, negative = a small wobble back
   * past center the *other* way (what makes it read as asymmetric/
   * awkward rather than a clean, mechanical bounce), 0 = centered.
   */
  recoilFactor: number;
  /** CSS transition duration to reach this scale/recoil. */
  durationMs: number;
  /** Total time from this step firing until the next one fires. */
  waitMs: number;
};

/**
 * A whole-body "startled" reaction to being clicked: recoils away from
 * the click point (scale squash + translate + rotate), overshoots back
 * past center with a small counter-wobble, then settles flat. Pure data
 * — the hook resolves recoilFactor against the actual click direction at
 * trigger time, since that's runtime information this function can't know.
 */
export function buildBodyFlinchSteps(config: GazeConfig = DEFAULT_GAZE_CONFIG): BodyFlinchStep[] {
  return [
    {
      scale: config.bodyFlinchSquashScale,
      recoilFactor: 1,
      durationMs: config.bodyFlinchInMs,
      waitMs: config.bodyFlinchInMs
    },
    {
      scale: config.bodyFlinchOvershootScale,
      recoilFactor: -0.35,
      durationMs: config.bodyFlinchOvershootMs,
      waitMs: config.bodyFlinchOvershootMs
    },
    { scale: 1, recoilFactor: 0, durationMs: config.bodyFlinchSettleMs, waitMs: config.bodyFlinchSettleMs }
  ];
}

/**
 * Resolves a flinch step's abstract recoilFactor into an actual
 * translate + rotation, given the real direction away from the click
 * (already the direction *away*, e.g. -clickVector) and the model's
 * recoil distance / configured max rotation.
 */
export function applyBodyFlinchRecoil(
  recoilFactor: number,
  awayFromClick: GazeVector,
  recoilDistance: number,
  rotationDeg: number
): { dx: number; dy: number; rotation: number } {
  return {
    dx: awayFromClick.x * recoilDistance * recoilFactor,
    dy: awayFromClick.y * recoilDistance * recoilFactor,
    rotation: awayFromClick.x * rotationDeg * recoilFactor
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
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    nextChangeAt: now + randomRestGapMs(random, config)
  };
}

/**
 * Pure step function for autonomous "bored, looks around" wander (eye
 * *position* only — blinking is a fully independent rhythm, see
 * advanceBlinkState). Returns the same state (by value) when
 * `now < state.nextChangeAt`. Alternates a long neutral rest with a
 * brief glance to a random small offset.
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
  return {
    phase: "resting",
    vector: { ...NEUTRAL_GAZE_VECTOR },
    nextChangeAt: now + randomRestGapMs(random, config)
  };
}
