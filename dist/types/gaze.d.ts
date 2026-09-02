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
export type GazeWanderPhase = "resting" | "glancing" | "eyesClosing" | "eyesOpening";
export type GazeWanderState = {
    phase: GazeWanderPhase;
    vector: GazeVector;
    /** 0 = open, 1 = fully closed. Normalized; see applyBlinkScale. */
    eyelid: number;
    /** Absolute timestamp (same clock as `now`) when this phase ends. */
    nextChangeAt: number;
};
export declare function createGazeWanderState(now: number, random: () => number, config?: GazeConfig): GazeWanderState;
/**
 * Pure step function for autonomous "bored, looks around" wander. Returns
 * the same state (by value) when `now < state.nextChangeAt`. From rest,
 * randomly picks one of two bored actions — glance to a small random
 * offset, or blink — then returns to a long neutral rest. The gaze-channel
 * analog of the classic model's bored-idle scheduler (which randomly
 * picks among blink/glance/antenna-fidget), but operating on eye
 * *position and lid state* rather than canned path morphs.
 */
export declare function advanceGazeWander(state: GazeWanderState, now: number, random: () => number, config?: GazeConfig): GazeWanderState;
export {};
