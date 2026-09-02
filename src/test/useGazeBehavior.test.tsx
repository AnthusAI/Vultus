import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import { defineProceduralAvatarModel, VULTUS_CLASSIC_MODEL } from "../lib/avatarModels";

/**
 * Integration coverage for the gaze hook's wiring, kept intentionally
 * narrow: jsdom has no requestAnimationFrame, IntersectionObserver,
 * PointerEvent, or matchMedia, so simulating real pointer tracking here
 * would be more theater than signal. The math those code paths call
 * (computePointerGazeVector, applyGazeTravel, the wander state machine)
 * already has full coverage in gaze.test.ts. This file checks the parts
 * that are reliably simulatable: DOM structure, default opt-out, fixed
 * vectors, and reduced motion.
 */
const gazeModel = defineProceduralAvatarModel({
  id: "test-gaze",
  name: "Test Gaze",
  viewBox: [0, 0, 28, 28],
  body: [],
  features: {
    leftEye: { cx: 10, cy: 14, fillRole: "shadow" },
    rightEye: { cx: 18, cy: 14, fillRole: "shadow" }
  },
  eyeShapesByState: {
    neutral: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    thinking: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    deepThinking: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    toolCalling: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    toolResponse: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingOpen: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingWide: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingRound: { rx: 2, ry: 2, dy: 0, shape: "ellipse" },
    speakingComplete: { rx: 2, ry: 2, dy: 0, shape: "ellipse" }
  },
  blink: { closedRx: 2, closedRy: 0.3 },
  gaze: { travel: { left: 2.4, right: 1.5, up: 1.2, down: 1.0 } }
});

describe("gaze wiring on BotAvatar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "matchMedia");
  });

  it('does not add a gaze group when gaze="none" (the default)', () => {
    const { container } = render(<BotAvatar model={gazeModel} neutralIdleMode="static" />);
    expect(container.querySelector(".vultus-gaze")).toBeNull();
  });

  it("does not add a gaze group for a model with no gaze geometry, even if requested", () => {
    const { container } = render(
      <BotAvatar model={VULTUS_CLASSIC_MODEL} gaze="auto" neutralIdleMode="static" />
    );
    expect(container.querySelector(".vultus-gaze")).toBeNull();
  });

  it('adds a gaze group and schedules wander timing for gaze="auto"', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    expect(container.querySelector(".vultus-gaze")).toBeTruthy();
    expect(setTimeoutSpy).toHaveBeenCalled();
  });

  it("applies a fixed gaze vector immediately, scaled by the model's travel budget", () => {
    const { container } = render(
      <BotAvatar model={gazeModel} gaze={{ x: 1, y: 0 }} neutralIdleMode="static" />
    );
    const gazeGroup = container.querySelector(".vultus-gaze") as SVGGElement | null;
    expect(gazeGroup).toBeTruthy();
    // right travel budget is 1.5 for this model
    expect(gazeGroup?.style.transform).toBe("translate(1.5px, 0px)");
  });

  it("freezes at neutral and schedules no wander timer under reduced motion", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: (query: string): MediaQueryList => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false
      })
    });
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const gazeGroup = container.querySelector(".vultus-gaze") as SVGGElement | null;

    expect(gazeGroup?.style.transform).toBe("translate(0px, 0px)");
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("unmounts cleanly without throwing", () => {
    const { unmount } = render(<BotAvatar model={gazeModel} gaze="auto" />);
    expect(() => unmount()).not.toThrow();
  });
});
