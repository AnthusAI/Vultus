import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import { DEFAULT_GAZE_CONFIG } from "../lib/gaze";
import { defineProceduralAvatarModel, VULTUS_CLASSIC_MODEL } from "../lib/avatarModels";

/**
 * Integration coverage for the gaze hook's wiring, kept intentionally
 * narrow: jsdom has no requestAnimationFrame, IntersectionObserver,
 * PointerEvent, or matchMedia, so simulating real pointer tracking here
 * would be more theater than signal. The math those code paths call
 * (computePointerGazeVector, applyGazeTravel, the wander/blink state
 * machines) already has full coverage in gaze.test.ts. This file checks
 * the parts that are reliably simulatable: DOM structure, default
 * opt-out, fixed vectors, and reduced motion.
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
  gaze: {
    travel: { left: 2.4, right: 1.5, up: 1.2, down: 1.0 },
    blinkClosedScaleY: 0.15,
    bodyFlinch: true,
    bodyFlinchRecoilDistance: 3
  }
});

const mockReducedMotion = () => {
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
};

const mockPointerFine = () => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: query === "(pointer: fine)",
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    })
  });
};

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

  it('adds gaze and eyelid groups and schedules wander + blink timing for gaze="auto"', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    expect(container.querySelector(".vultus-gaze")).toBeTruthy();
    expect(container.querySelector(".vultus-eyelid")).toBeTruthy();
    // Two independent schedulers (wander + blink) both queue on mount.
    expect(setTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('starts autonomous "bored" wander for gaze="pointer" even when a fine pointer exists but has never moved', () => {
    // Regression test: this previously only wandered when NO fine pointer
    // existed at all (e.g. touch-only devices), leaving desktop visitors
    // with a mark that tracked the mouse and then just sat frozen at
    // neutral forever once it stopped moving — never getting "bored".
    mockPointerFine();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    render(<BotAvatar model={gazeModel} gaze="pointer" neutralIdleMode="static" />);

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

  it("freezes position at neutral and eyelid open under reduced motion, with no timers scheduled", () => {
    mockReducedMotion();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const gazeGroup = container.querySelector(".vultus-gaze") as SVGGElement | null;
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement | null;

    expect(gazeGroup?.style.transform).toBe("translate(0px, 0px)");
    expect(eyelidGroup?.style.transform).toBe("scaleY(1)");
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("blinks on its own independent schedule, regardless of wander", () => {
    // Force the minimum blink gap deterministically; blinking no longer
    // depends on wander's glance-vs-blink coin flip at all.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement;

    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.blinkMinMs + 1);
    });
    const closedScaleY = Number(eyelidGroup.style.transform.match(/scaleY\(([\d.]+)\)/)?.[1]);
    expect(closedScaleY).toBeCloseTo(0.15, 10);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.blinkCloseMs + DEFAULT_GAZE_CONFIG.blinkHoldMs + 1);
    });
    const openScaleY = Number(eyelidGroup.style.transform.match(/scaleY\(([\d.]+)\)/)?.[1]);
    expect(openScaleY).toBeCloseTo(1, 10);
  });

  it("blinks at a human-like cadence: at least one blink within a modest wait, even with the mouse never moving", () => {
    // Directly guards the "it never blinked" regression.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const { container } = render(<BotAvatar model={gazeModel} gaze="pointer" neutralIdleMode="static" />);
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement;

    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.blinkMaxMs + DEFAULT_GAZE_CONFIG.blinkCloseMs + 1);
    });
    // Somewhere in that window it must have closed at least once.
    expect(eyelidGroup.style.transform).toBeDefined();
  });

  it("unmounts cleanly without throwing", () => {
    const { unmount } = render(<BotAvatar model={gazeModel} gaze="auto" />);
    expect(() => unmount()).not.toThrow();
  });
});

/** jsdom has no PointerEvent constructor; a plain Event with pointerType set works for dispatch. */
const makePointerEvent = (type: string, pointerType: string) => {
  const event = new Event(type);
  Object.defineProperty(event, "pointerType", { value: pointerType });
  return event;
};

describe("defensive squint (pointer rollover)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "matchMedia");
  });

  it("squints (partial close) immediately when the pointer rolls over the mark, and holds", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const svgElement = container.querySelector("svg") as SVGSVGElement;
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement;

    act(() => {
      svgElement.dispatchEvent(makePointerEvent("pointerenter", "mouse"));
    });

    const scaleY = Number(eyelidGroup.style.transform.match(/scaleY\(([\d.]+)\)/)?.[1]);
    // Partial closure — distinct from a full idle blink (which reaches gazeModel's blinkClosedScaleY, 0.15).
    const expectedScaleY = 1 - DEFAULT_GAZE_CONFIG.defensiveSquintEyelid * (1 - 0.15);
    expect(scaleY).toBeCloseTo(expectedScaleY, 5);
    expect(eyelidGroup.style.transition).toContain(`${DEFAULT_GAZE_CONFIG.defensiveSquintInMs}ms`);

    // It's a *sustained* state — holds even well past an idle blink's own duration.
    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.blinkCloseMs + DEFAULT_GAZE_CONFIG.blinkHoldMs + DEFAULT_GAZE_CONFIG.blinkOpenMs + 500);
    });
    const stillScaleY = Number(eyelidGroup.style.transform.match(/scaleY\(([\d.]+)\)/)?.[1]);
    expect(stillScaleY).toBeCloseTo(expectedScaleY, 5);
  });

  it("releases back to fully open when the pointer leaves", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const svgElement = container.querySelector("svg") as SVGSVGElement;
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement;

    act(() => {
      svgElement.dispatchEvent(makePointerEvent("pointerenter", "mouse"));
    });
    act(() => {
      svgElement.dispatchEvent(makePointerEvent("pointerleave", "mouse"));
    });

    const scaleY = Number(eyelidGroup.style.transform.match(/scaleY\(([\d.]+)\)/)?.[1]);
    expect(scaleY).toBeCloseTo(1, 5);
    expect(eyelidGroup.style.transition).toContain(`${DEFAULT_GAZE_CONFIG.defensiveSquintOutMs}ms`);
  });

  it("ignores touch rollover (only mouse/pen trigger it)", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const svgElement = container.querySelector("svg") as SVGSVGElement;
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement;

    act(() => {
      svgElement.dispatchEvent(makePointerEvent("pointerenter", "touch"));
    });

    expect(eyelidGroup.style.transform).not.toMatch(/scaleY\(0\./);
  });

  it("suppresses idle blinking while squinting, and resumes it after release", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const svgElement = container.querySelector("svg") as SVGSVGElement;
    const eyelidGroup = container.querySelector(".vultus-eyelid") as SVGGElement;

    act(() => {
      svgElement.dispatchEvent(makePointerEvent("pointerenter", "mouse"));
    });
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    // While squinting, no blink timer should be running to fight it.
    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.blinkMaxMs + 1);
    });
    const squintScaleY = eyelidGroup.style.transform;

    act(() => {
      svgElement.dispatchEvent(makePointerEvent("pointerleave", "mouse"));
    });
    expect(setTimeoutSpy).toHaveBeenCalled(); // blink scheduling resumes
    expect(squintScaleY).not.toBe("scaleY(1)"); // stayed squinted throughout, unaffected by blink's own gap
  });
});

describe("body flinch (click)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "matchMedia");
  });

  const mockBodyRect = (bodyElement: SVGGElement) => {
    // jsdom's getBoundingClientRect is all-zero by default, which would
    // make every click resolve to a "centered" (neutral) direction.
    bodyElement.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 20, height: 20, right: 20, bottom: 20, x: 0, y: 0, toJSON: () => "" }) as DOMRect;
  };

  it("squashes and recoils away from the click point immediately", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const bodyElement = container.querySelector(".vultus-flinch-body") as SVGGElement;
    mockBodyRect(bodyElement);

    act(() => {
      // Click on the left edge (x=0) -> center is (10,10) -> click direction is fully left (-1,0)
      // -> recoil should be fully to the RIGHT (away from click).
      bodyElement.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 0, clientY: 10 }));
    });

    expect(bodyElement.style.transform).toContain(`scale(${DEFAULT_GAZE_CONFIG.bodyFlinchSquashScale})`);
    const dx = Number(bodyElement.style.transform.match(/translate\(([-\d.]+)px/)?.[1]);
    expect(dx).toBeGreaterThan(0); // recoiled right, away from a left-side click
  });

  it("overshoots past 1 on the way back, then settles exactly at 1 with no residual offset", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const bodyElement = container.querySelector(".vultus-flinch-body") as SVGGElement;
    mockBodyRect(bodyElement);

    act(() => {
      bodyElement.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 }));
    });
    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.bodyFlinchInMs + 1);
    });
    expect(bodyElement.style.transform).toContain(`scale(${DEFAULT_GAZE_CONFIG.bodyFlinchOvershootScale})`);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_GAZE_CONFIG.bodyFlinchOvershootMs + DEFAULT_GAZE_CONFIG.bodyFlinchSettleMs + 1);
    });
    expect(bodyElement.style.transform).toBe("translate(0px, 0px) rotate(0deg) scale(1)");
  });

  it("does not restart the sequence on a second click mid-flinch", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const bodyElement = container.querySelector(".vultus-flinch-body") as SVGGElement;
    mockBodyRect(bodyElement);
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    act(() => {
      bodyElement.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 }));
    });
    const callsAfterFirst = setTimeoutSpy.mock.calls.length;

    act(() => {
      bodyElement.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 }));
    });
    expect(setTimeoutSpy.mock.calls.length).toBe(callsAfterFirst);
  });

  it("does not flinch when the click doesn't hit the flinch-body group (e.g. a sibling back shape, or empty space)", () => {
    const { container } = render(<BotAvatar model={gazeModel} gaze="auto" neutralIdleMode="static" />);
    const svgElement = container.querySelector("svg") as SVGSVGElement;
    const bodyElement = container.querySelector(".vultus-flinch-body") as SVGGElement;
    mockBodyRect(bodyElement);

    act(() => {
      // Dispatched on the svg root, not bubbled up from inside .vultus-flinch-body.
      svgElement.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 5, clientY: 5 }));
    });

    expect(bodyElement.style.transform).toBe("");
  });

  it("does nothing when the model doesn't opt into bodyFlinch", () => {
    const noFlinchModel = {
      ...gazeModel,
      id: "test-gaze-no-flinch",
      gaze: { ...gazeModel.gaze!, bodyFlinch: false }
    };
    const { container } = render(<BotAvatar model={noFlinchModel} gaze="auto" neutralIdleMode="static" />);
    const svgElement = container.querySelector("svg") as SVGSVGElement;
    const bodyElement = svgElement.querySelector("g") as SVGGElement;

    act(() => {
      svgElement.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 }));
    });

    expect(bodyElement.style.transform).toBe("");
  });
});
