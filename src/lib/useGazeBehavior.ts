import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  DEFAULT_GAZE_CONFIG,
  NEUTRAL_GAZE_VECTOR,
  advanceBlinkState,
  advanceGazeWander,
  applyBlinkScale,
  applyBodyFlinchRecoil,
  applyGazeTravel,
  buildBodyFlinchSteps,
  computePointerGazeVector,
  createBlinkState,
  createGazeWanderState
} from "./gaze";
import type { GazeConfig, GazeGeometry, GazeSource, GazeVector } from "./gaze";

export type UseGazeBehaviorOptions = {
  svgElementRef: RefObject<SVGSVGElement>;
  /** Carries position only (translate) — pointer tracking / autonomous wander. */
  gazeGroupElementRef: RefObject<SVGGElement>;
  /** Carries eyelid only (scaleY) — idle blink / defensive squint. Nested inside gazeGroupElementRef. */
  eyelidGroupElementRef: RefObject<SVGGElement>;
  /** The model's flinchable rig group; only used when geometry.bodyFlinch is true. */
  bodyElementRef?: RefObject<SVGGElement>;
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
 * media queries. All the actual behavior (what vector/eyelid to show,
 * when to transition) is the pure, tested logic in gaze.ts — this hook
 * is just the event/timer/DOM plumbing around it.
 *
 * Position (translate, on gazeGroupElementRef) and eyelid (scaleY, on
 * the nested eyelidGroupElementRef) are deliberately two separate CSS
 * transforms on two separate elements: they're driven by independent
 * schedulers (wander/tracking vs. blink/squint) that need independent
 * transition durations, which one shared `transform` property can't give
 * them — a fast 90ms blink and a slow 900ms glance can't both be "the"
 * duration of one combined translate+scaleY transition.
 */
export function useGazeBehavior({
  svgElementRef,
  gazeGroupElementRef,
  eyelidGroupElementRef,
  bodyElementRef,
  gaze,
  geometry,
  config
}: UseGazeBehaviorOptions): void {
  const configRef = useRef<GazeConfig>({ ...DEFAULT_GAZE_CONFIG, ...config });
  configRef.current = { ...DEFAULT_GAZE_CONFIG, ...config };

  const fixedVectorKey = isFixedVector(gaze) ? `${gaze.x}:${gaze.y}` : null;

  useEffect(() => {
    const gazeGroupElement = gazeGroupElementRef.current;
    const eyelidGroupElement = eyelidGroupElementRef.current;
    const svgElement = svgElementRef.current;
    if (gaze === "none" || !geometry || !gazeGroupElement || !eyelidGroupElement || !svgElement) {
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
    let isSquinting = false;
    let intersecting = true;
    let documentHidden = typeof document !== "undefined" && document.hidden;
    let restTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let wanderTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let blinkTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let bodyFlinchTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let bodyFlinchActive = false;
    let pendingFrameId: number | null = null;
    let wanderState = createGazeWanderState(Date.now(), Math.random, configRef.current);
    let blinkState = createBlinkState(Date.now(), Math.random, configRef.current);

    const isSuspended = () => disposed || reducedMotion || documentHidden || !intersecting;

    const applyVector = (vector: GazeVector, durationMs: number) => {
      if (!geometry) {
        return;
      }
      const { dx, dy } = applyGazeTravel(vector, geometry.travel);
      gazeGroupElement.style.transition = reducedMotion ? "none" : `transform ${durationMs}ms ${configRef.current.easing}`;
      gazeGroupElement.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const applyEyelid = (eyelid: number, durationMs: number) => {
      if (!geometry) {
        return;
      }
      const scaleY = applyBlinkScale(eyelid, geometry.blinkClosedScaleY);
      eyelidGroupElement.style.transition = reducedMotion ? "none" : `transform ${durationMs}ms ${configRef.current.easing}`;
      eyelidGroupElement.style.transform = `scaleY(${scaleY})`;
    };

    const goNeutralPosition = (durationMs: number) => applyVector(NEUTRAL_GAZE_VECTOR, durationMs);

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

    const clearBlinkTimeout = () => {
      if (blinkTimeoutId !== null) {
        clearTimeout(blinkTimeoutId);
        blinkTimeoutId = null;
      }
    };

    const clearBodyFlinchTimeout = () => {
      if (bodyFlinchTimeoutId !== null) {
        clearTimeout(bodyFlinchTimeoutId);
        bodyFlinchTimeoutId = null;
      }
    };

    // --- Position: pointer tracking + autonomous wander -------------------

    const scheduleDriftBack = () => {
      clearRestTimeout();
      restTimeoutId = setTimeout(() => {
        restTimeoutId = null;
        pointerEngaged = false;
        if (!isSuspended()) {
          goNeutralPosition(configRef.current.driftBackMs);
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
      applyVector(computePointerGazeVector(rect, pointerPosition), configRef.current.trackMs);
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
        goNeutralPosition(configRef.current.driftBackMs);
        startOrStopWander();
      }
    };

    const runWanderTick = () => {
      const now = Date.now();
      wanderState = advanceGazeWander(wanderState, now, Math.random, configRef.current);
      if (!isSuspended()) {
        applyVector(wanderState.vector, configRef.current.wanderHoldMs);
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
        const now = Date.now();
        wanderState = createGazeWanderState(now, Math.random, configRef.current);
        // Freshly created state is always "resting" (i.e. matches whatever
        // is already displayed), so just schedule the first real tick
        // rather than calling runWanderTick synchronously — that would
        // reapply the current value with an unrelated duration, clobbering
        // any transition another handler just set in this same call chain.
        wanderTimeoutId = setTimeout(runWanderTick, Math.max(16, wanderState.nextChangeAt - now));
      }
    }

    // --- Eyelid: independent idle-blink rhythm + defensive squint ---------

    const runBlinkTick = () => {
      const now = Date.now();
      blinkState = advanceBlinkState(blinkState, now, Math.random, configRef.current);
      if (!isSuspended()) {
        const durationMs =
          blinkState.phase === "closing"
            ? configRef.current.blinkCloseMs
            : blinkState.phase === "opening"
              ? configRef.current.blinkOpenMs
              : configRef.current.blinkCloseMs;
        applyEyelid(blinkState.eyelid, durationMs);
      }
      const delay = Math.max(16, blinkState.nextChangeAt - now);
      blinkTimeoutId = setTimeout(runBlinkTick, delay);
    };

    function startOrStopBlink() {
      clearBlinkTimeout();
      if (isSquinting || isSuspended()) {
        return;
      }
      const now = Date.now();
      blinkState = createBlinkState(now, Math.random, configRef.current);
      // Same reasoning as startOrStopWander: don't call runBlinkTick
      // synchronously here, just schedule it — a freshly created state is
      // always "open" (eyelid 0), matching what's already shown, so there's
      // nothing to apply yet, and doing so anyway would stomp whatever
      // transition another handler (e.g. squint release) just set.
      blinkTimeoutId = setTimeout(runBlinkTick, Math.max(16, blinkState.nextChangeAt - now));
    }

    /**
     * Squint is a sustained hover *state*, not a one-shot animation: it
     * holds for as long as the pointer stays over the mark and releases
     * the moment it leaves — distinct from the idle blink both in how
     * far it closes (partial, not full) and in that it's driven by hover
     * state rather than a timer.
     */
    const handlePointerEnterMark = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }
      if (isSquinting || isSuspended()) {
        return;
      }
      isSquinting = true;
      clearBlinkTimeout();
      applyEyelid(configRef.current.defensiveSquintEyelid, configRef.current.defensiveSquintInMs);
    };

    const handlePointerLeaveMark = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
        return;
      }
      if (!isSquinting) {
        return;
      }
      isSquinting = false;
      if (!isSuspended()) {
        applyEyelid(0, configRef.current.defensiveSquintOutMs);
      }
      startOrStopBlink();
    };

    // --- Whole-body click flinch -------------------------------------------

    const bodyElement = geometry.bodyFlinch ? bodyElementRef?.current ?? null : null;

    /**
     * A whole-body "startled" reaction to being clicked: recoils away
     * from the click point, overshoots back with a small counter-wobble,
     * settles flat. Listener lives on bodyElement itself (not the whole
     * <svg>), so a click only counts if it actually hit something inside
     * that group (the front/character shapes + eyes) — a click on a
     * sibling shape (e.g. a back "shadow" bubble not tagged for flinch)
     * or on empty space never bubbles into it.
     */
    const handleBodyClick = (event: MouseEvent) => {
      if (!bodyElement || bodyFlinchActive || isSuspended() || !geometry) {
        return;
      }
      const rect = bodyElement.getBoundingClientRect();
      const clickVector = computePointerGazeVector(rect, { x: event.clientX, y: event.clientY });
      const awayFromClick: GazeVector = { x: -clickVector.x, y: -clickVector.y };

      bodyFlinchActive = true;
      const steps = buildBodyFlinchSteps(configRef.current);
      const runStep = (index: number) => {
        if (index >= steps.length) {
          bodyFlinchActive = false;
          return;
        }
        const step = steps[index];
        if (!isSuspended()) {
          const { dx, dy, rotation } = applyBodyFlinchRecoil(
            step.recoilFactor,
            awayFromClick,
            geometry.bodyFlinchRecoilDistance,
            configRef.current.bodyFlinchRotationDeg
          );
          bodyElement.style.transition = reducedMotion ? "none" : `transform ${step.durationMs}ms ${configRef.current.easing}`;
          bodyElement.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(${step.scale})`;
        }
        bodyFlinchTimeoutId = setTimeout(() => {
          bodyFlinchTimeoutId = null;
          runStep(index + 1);
        }, step.waitMs);
      };
      runStep(0);
    };

    // --- Cross-cutting: reduced motion / visibility / intersection --------

    const freezeEyelidAndBody = () => {
      isSquinting = false;
      eyelidGroupElement.style.transition = "none";
      eyelidGroupElement.style.transform = "scaleY(1)";
      if (bodyElement) {
        bodyElement.style.transition = "none";
        bodyElement.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
      }
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        clearRestTimeout();
        clearWanderTimeout();
        clearBlinkTimeout();
        clearBodyFlinchTimeout();
        bodyFlinchActive = false;
        gazeGroupElement.style.transition = "none";
        gazeGroupElement.style.transform = "translate(0px, 0px)";
        freezeEyelidAndBody();
      } else {
        startOrStopWander();
        startOrStopBlink();
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
        clearBlinkTimeout();
        clearBodyFlinchTimeout();
        bodyFlinchActive = false;
      } else {
        startOrStopWander();
        startOrStopBlink();
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
            clearBlinkTimeout();
            clearBodyFlinchTimeout();
            bodyFlinchActive = false;
          } else {
            startOrStopWander();
            startOrStopBlink();
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
    svgElement.addEventListener("pointerenter", handlePointerEnterMark);
    svgElement.addEventListener("pointerleave", handlePointerLeaveMark);
    if (bodyElement) {
      bodyElement.addEventListener("click", handleBodyClick);
    }

    // Establish an explicit, instant baseline before any scheduler kicks
    // in — startOrStopWander/startOrStopBlink only *schedule* a future
    // tick now (see their comments), so without this the transform would
    // be genuinely unset (not just "at neutral") until whatever timer
    // fires first, which could be seconds away.
    if (isFixedVector(gaze)) {
      applyVector(gaze, configRef.current.trackMs);
    } else {
      goNeutralPosition(0);
    }
    applyEyelid(0, 0);

    if (reducedMotion) {
      freezeEyelidAndBody();
    } else {
      startOrStopWander();
      startOrStopBlink();
    }

    return () => {
      disposed = true;
      clearRestTimeout();
      clearWanderTimeout();
      clearBlinkTimeout();
      clearBodyFlinchTimeout();
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
      svgElement.removeEventListener("pointerenter", handlePointerEnterMark);
      svgElement.removeEventListener("pointerleave", handlePointerLeaveMark);
      if (bodyElement) {
        bodyElement.removeEventListener("click", handleBodyClick);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixedVectorKey stands in for gaze's object identity
  }, [
    gaze === "none" ? "none" : gaze === "auto" ? "auto" : gaze === "pointer" ? "pointer" : fixedVectorKey,
    geometry,
    gazeGroupElementRef,
    eyelidGroupElementRef,
    svgElementRef
  ]);
}
