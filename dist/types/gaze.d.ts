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
export type GazeWanderPhase = "resting" | "glancing";
export type GazeWanderState = {
    phase: GazeWanderPhase;
    vector: GazeVector;
    /** Absolute timestamp (same clock as `now`) when this phase ends. */
    nextChangeAt: number;
};
export declare function createGazeWanderState(now: number): GazeWanderState;
/**
 * Pure step function for autonomous "bored, looks around" wander. Returns
 * the same state (by value) when `now < state.nextChangeAt`. Alternates a
 * long neutral rest with a brief glance to a random small offset — the
 * gaze-channel analog of the classic model's bored-idle scheduler, but
 * operating on eye *position* rather than canned path morphs.
 */
export declare function advanceGazeWander(state: GazeWanderState, now: number, random: () => number, config?: GazeConfig): GazeWanderState;
export {};
