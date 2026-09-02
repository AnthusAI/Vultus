import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  DEFAULT_GAZE_CONFIG,
  NEUTRAL_GAZE_VECTOR,
  advanceGazeWander,
  applyBlinkScale,
  applyGazeTravel,
  computePointerGazeVector,
  createGazeWanderState
} from "./gaze";
import type { GazeConfig, GazeGeometry, GazeSource, GazeVector, GazeWanderPhase } from "./gaze";

export type UseGazeBehaviorOptions = {
  svgElementRef: RefObject<SVGSVGElement>;
  gazeGroupElementRef: RefObject<SVGGElement>;
  gaze: GazeSource;
  geometry?: GazeGeometry;
  config?: Partial<GazeConfig>;
};

const browserPrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const browserHasFinePointer = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(pointer: fine)").matches;
};

const isFixedVector = (gaze: GazeSource): gaze is GazeVector => typeof gaze === "object";

/**
 * Drives a model's gaze from real time, real pointer events, and real
 * media queries. All the actual behavior (what vector to show, when to
 * transition) is the pure, tested logic in gaze.ts — this hook is just
 * the event/timer/DOM plumbing around it. Applies a `transform:
 * translate(...)` + `transition` directly on `gazeGroupElementRef`
 * (SVG's `transform-box` defaults to the element's own coordinate space,
 * so these translate values are in the model's own viewBox units).
 */
export function useGazeBehavior({
  svgElementRef,
  gazeGroupElementRef,
  gaze,
  geometry,
  config
}: UseGazeBehaviorOptions): void {
  const configRef = useRef<GazeConfig>({ ...DEFAULT_GAZE_CONFIG, ...config });
  configRef.current = { ...DEFAULT_GAZE_CONFIG, ...config };

  const fixedVectorKey = isFixedVector(gaze) ? `${gaze.x}:${gaze.y}` : null;

  useEffect(() => {
    const gazeGroupElement = gazeGroupElementRef.current;
    const svgElement = svgElementRef.current;
    if (gaze === "none" || !geometry || !gazeGroupElement || !svgElement) {
      return undefined;
    }

    let disposed = false;
    let reducedMotion = browserPrefersReducedMotion();
    let hasFinePointer = browserHasFinePointer();
    let pointerPosition: { x: number; y: number } | null = null;
    // True only while actively tracking a moving pointer (i.e. within
    // pointerRestMs of the last move). Once the pointer rests and drifts
    // back to neutral, this goes false and autonomous "bored" wander
    // takes over — on any device, not just ones without a pointer at all.
    let pointerEngaged = false;
    let intersecting = true;
    let documentHidden = typeof document !== "undefined" && document.hidden;
    let restTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let wanderTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let pendingFrameId: number | null = null;
    let wanderState = createGazeWanderState(Date.now(), Math.random, configRef.current);

    const applyPose = (vector: GazeVector, eyelid: number, durationMs: number) => {
      if (!geometry) {
        return;
      }
      const { dx, dy } = applyGazeTravel(vector, geometry.travel);
      const scaleY = applyBlinkScale(eyelid, geometry.blinkClosedScaleY);
      gazeGroupElement.style.transition = reducedMotion ? "none" : `transform ${durationMs}ms ${configRef.current.easing}`;
      gazeGroupElement.style.transform = `translate(${dx}px, ${dy}px) scaleY(${scaleY})`;
    };

    // Pointer tracking and fixed vectors never blink in this pass — a
    // blink is one of the *autonomous bored* variants, not something that
    // happens while actively engaged with the pointer — so eyelid is
    // always 0 (open) outside of runWanderTick.
    const goNeutral = (durationMs: number) => applyPose(NEUTRAL_GAZE_VECTOR, 0, durationMs);

    const clearRestTimeout = () => {
      if (restTimeoutId !== null) {
        clearTimeout(restTimeoutId);
        restTimeoutId = null;
      }
    };

    const clearWanderTimeout = () => {
      if (wanderTimeoutId !== null) {
        clearTimeout(wanderTimeoutId);
        wanderTimeoutId = null;
      }
    };

    const isSuspended = () => disposed || reducedMotion || documentHidden || !intersecting;

    const scheduleDriftBack = () => {
      clearRestTimeout();
      restTimeoutId = setTimeout(() => {
        restTimeoutId = null;
        pointerEngaged = false;
        if (!isSuspended()) {
          goNeutral(configRef.current.driftBackMs);
        }
        // The pointer has been idle for a while now — let it get bored.
        startOrStopWander();
      }, configRef.current.pointerRestMs);
    };

    const applyPointerNow = () => {
      pendingFrameId = null;
      if (isSuspended() || gaze !== "pointer" || !hasFinePointer || !pointerPosition) {
        return;
      }
      const rect = svgElement.getBoundingClientRect();
      applyPose(computePointerGazeVector(rect, pointerPosition), 0, configRef.current.trackMs);
      pointerEngaged = true;
      scheduleDriftBack();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }
      hasFinePointer = true;
      pointerPosition = { x: event.clientX, y: event.clientY };
      // A real pointer just moved; autonomous wander stands down in favor
      // of tracking (applyPointerNow re-arms it once the pointer rests).
      clearWanderTimeout();
      if (pendingFrameId === null) {
        pendingFrameId =
          typeof requestAnimationFrame === "function" ? requestAnimationFrame(applyPointerNow) : setTimeout(applyPointerNow, 16) as unknown as number;
      }
    };

    const handlePointerLeaveDocument = () => {
      pointerPosition = null;
      pointerEngaged = false;
      clearRestTimeout();
      if (!isSuspended() && gaze === "pointer") {
        goNeutral(configRef.current.driftBackMs);
        startOrStopWander();
      }
    };

    const wanderTransitionMsForPhase = (phase: GazeWanderPhase): number => {
      switch (phase) {
        case "eyesClosing":
          return configRef.current.blinkCloseMs;
        case "eyesOpening":
          return configRef.current.blinkOpenMs;
        case "glancing":
        case "resting":
        default:
          return configRef.current.wanderHoldMs;
      }
    };

    const runWanderTick = () => {
      const now = Date.now();
      wanderState = advanceGazeWander(wanderState, now, Math.random, configRef.current);
      if (!isSuspended()) {
        applyPose(wanderState.vector, wanderState.eyelid, wanderTransitionMsForPhase(wanderState.phase));
      }
      const delay = Math.max(16, wanderState.nextChangeAt - now);
      wanderTimeoutId = setTimeout(runWanderTick, delay);
    };

    function startOrStopWander() {
      clearWanderTimeout();
      if (isFixedVector(gaze) || isSuspended()) {
        return;
      }
      // "pointer" mode wanders whenever it isn't actively tracking a
      // moving pointer right now — whether that's because no fine
      // pointer exists, or because one exists but has gone idle.
      const shouldWander = gaze === "auto" || (gaze === "pointer" && !pointerEngaged);
      if (shouldWander) {
        wanderState = createGazeWanderState(Date.now(), Math.random, configRef.current);
        runWanderTick();
      }
    }

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        clearRestTimeout();
        clearWanderTimeout();
        gazeGroupElement.style.transition = "none";
        gazeGroupElement.style.transform = "translate(0px, 0px) scaleY(1)";
      } else {
        startOrStopWander();
      }
    };

    const handlePointerFineChange = (event: MediaQueryListEvent) => {
      hasFinePointer = event.matches;
      startOrStopWander();
    };

    const handleVisibilityChange = () => {
      documentHidden = typeof document !== "undefined" && document.hidden;
      if (documentHidden) {
        clearRestTimeout();
        clearWanderTimeout();
      } else {
        startOrStopWander();
      }
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          intersecting = entry?.isIntersecting ?? true;
          if (!intersecting) {
            clearRestTimeout();
            clearWanderTimeout();
          } else {
            startOrStopWander();
          }
        },
        { threshold: 0 }
      );
      intersectionObserver.observe(svgElement);
    }

    const reducedMotionMedia = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const pointerFineMedia = typeof window.matchMedia === "function" ? window.matchMedia("(pointer: fine)") : null;
    reducedMotionMedia?.addEventListener("change", handleReducedMotionChange);
    pointerFineMedia?.addEventListener("change", handlePointerFineChange);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeaveDocument);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (isFixedVector(gaze)) {
      applyPose(gaze, 0, configRef.current.trackMs);
    } else if (reducedMotion) {
      goNeutral(0);
    } else {
      startOrStopWander();
    }

    return () => {
      disposed = true;
      clearRestTimeout();
      clearWanderTimeout();
      if (pendingFrameId !== null) {
        if (typeof cancelAnimationFrame === "function") {
          cancelAnimationFrame(pendingFrameId);
        } else {
          clearTimeout(pendingFrameId);
        }
      }
      intersectionObserver?.disconnect();
      reducedMotionMedia?.removeEventListener("change", handleReducedMotionChange);
      pointerFineMedia?.removeEventListener("change", handlePointerFineChange);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeaveDocument);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixedVectorKey stands in for gaze's object identity
  }, [gaze === "none" ? "none" : gaze === "auto" ? "auto" : gaze === "pointer" ? "pointer" : fixedVectorKey, geometry, gazeGroupElementRef, svgElementRef]);
}
