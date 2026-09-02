/**
 * Pure gaze/pointer-following math and scheduling. No DOM, no timers, no
 * randomness owned here — everything that varies is a parameter, so this
 * is deterministically testable. See useGazeBehavior.ts for the React/DOM
 * wiring that drives these functions from real time and real events.
 */
/** Normalized gaze offset; each component in [-1, 1]. */
export type GazeVector = {
    x: number;
    y: number;
};
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
    travel: {
        left: number;
        right: number;
        up: number;
        down: number;
    };
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
    defensiveSquintEyelid: number;
    defensiveSquintInMs: number;
    defensiveSquintOutMs: number;
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
export declare const DEFAULT_GAZE_CONFIG: GazeConfig;
export declare const NEUTRAL_GAZE_VECTOR: GazeVector;
export declare const clampUnit: (value: number) => number;
/** mulberry32 — deterministic, seedable, dependency-free. For tests only. */
export declare function makeSeededRandom(seed: number): () => number;
type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
};
type Point = {
    x: number;
    y: number;
};
/** Normalizes a viewport-space pointer into a [-1,1] vector relative to the element's center. */
export declare function computePointerGazeVector(rect: Rect, pointer: Point): GazeVector;
/** True when the pointer is inside the rect or within proximityPx of its edge. */
export declare function isPointerWithinProximity(rect: Rect, pointer: Point, proximityPx: number): boolean;
/**
 * Scales a normalized gaze vector by a model's asymmetric travel geometry,
 * producing a translate offset in the model's own coordinate units.
 */
export declare function applyGazeTravel(vector: GazeVector, travel: GazeGeometry["travel"]): {
    dx: number;
    dy: number;
};
/**
 * Maps a normalized eyelid position (0 = open, 1 = fully closed) to an
 * actual vertical scale factor, given a model's blink geometry. Kept
 * separate from the state machine so the state machine itself stays
 * model-agnostic (it works in normalized 0..1 terms, the same way
 * `vector` is normalized to [-1,1] and only scaled to real units by
 * applyGazeTravel) — the same split `applyGazeTravel` already uses.
 */
export declare function applyBlinkScale(eyelid: number, blinkClosedScaleY: number): number;
export type BlinkPhase = "open" | "closing" | "opening";
export type BlinkState = {
    phase: BlinkPhase;
    /** 0 = open, 1 = fully closed. Normalized; see applyBlinkScale. */
    eyelid: number;
    /** Absolute timestamp (same clock as `now`) when this phase ends. */
    nextChangeAt: number;
};
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
export declare function createBlinkState(now: number, random: () => number, config?: GazeConfig): BlinkState;
export declare function advanceBlinkState(state: BlinkState, now: number, random: () => number, config?: GazeConfig): BlinkState;
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
export declare function buildBodyFlinchSteps(config?: GazeConfig): BodyFlinchStep[];
/**
 * Resolves a flinch step's abstract recoilFactor into an actual
 * translate + rotation, given the real direction away from the click
 * (already the direction *away*, e.g. -clickVector) and the model's
 * recoil distance / configured max rotation.
 */
export declare function applyBodyFlinchRecoil(recoilFactor: number, awayFromClick: GazeVector, recoilDistance: number, rotationDeg: number): {
    dx: number;
    dy: number;
    rotation: number;
};
export type GazeWanderPhase = "resting" | "glancing";
export type GazeWanderState = {
    phase: GazeWanderPhase;
    vector: GazeVector;
    /** Absolute timestamp (same clock as `now`) when this phase ends. */
    nextChangeAt: number;
};
export declare function createGazeWanderState(now: number, random: () => number, config?: GazeConfig): GazeWanderState;
/**
 * Pure step function for autonomous "bored, looks around" wander (eye
 * *position* only — blinking is a fully independent rhythm, see
 * advanceBlinkState). Returns the same state (by value) when
 * `now < state.nextChangeAt`. Alternates a long neutral rest with a
 * brief glance to a random small offset.
 */
export declare function advanceGazeWander(state: GazeWanderState, now: number, random: () => number, config?: GazeConfig): GazeWanderState;
export {};
