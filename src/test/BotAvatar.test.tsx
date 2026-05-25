import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BotAvatar } from "../lib/BotAvatar";
import { BOT_AVATAR_STATES } from "../lib/avatarStates";

describe("BotAvatar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders an SVG with the default aria label", () => {
    render(<BotAvatar state="thinking" />);
    expect(screen.getByRole("img", { name: "Bot avatar - thinking state" })).toBeInTheDocument();
  });

  it("applies size and colors", () => {
    const { container } = render(<BotAvatar size={321} shadowColor="#111111" lightColor="#fafafa" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "321");
    expect(svg).toHaveAttribute("height", "321");
    expect(container.querySelector('circle[fill="#111111"]')).toBeTruthy();
    expect(container.querySelector('rect[fill="#fafafa"]')).toBeTruthy();
  });

  it("accepts all exported state keys", () => {
    BOT_AVATAR_STATES.forEach((state) => {
      const { unmount } = render(<BotAvatar state={state} />);
      expect(screen.getByRole("img", { name: `Bot avatar - ${state} state` })).toBeInTheDocument();
      unmount();
    });
  });

  it("handles state transitions", () => {
    const { rerender } = render(<BotAvatar state="neutral" transitionDurationSeconds={0.01} />);
    rerender(<BotAvatar state="toolResponse" transitionDurationSeconds={0.01} />);
    expect(screen.getByRole("img", { name: "Bot avatar - toolResponse state" })).toBeInTheDocument();
  });

  it("schedules neutral bored idle in the 10-20s interval window", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<BotAvatar state="neutral" />);

    expect(setTimeoutSpy).toHaveBeenCalled();
    expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(10_000);
  });

  it("uses the upper neutral bored interval bound", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    render(<BotAvatar state="neutral" />);

    expect(setTimeoutSpy).toHaveBeenCalled();
    expect(setTimeoutSpy.mock.calls[0]?.[1]).toBe(20_000);
  });

  it("uses only known neutral bored variants", () => {
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValueOnce(0);
    randomSpy.mockReturnValueOnce(0);
    randomSpy.mockReturnValueOnce(0.999999);

    render(<BotAvatar state="neutral" />);
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
    }).not.toThrow();
  });

  it('disables neutral bored idle when neutralIdleMode is "static"', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    render(<BotAvatar state="neutral" neutralIdleMode="static" />);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });

  it("disables neutral bored idle when reduced-motion is preferred", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
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

    render(<BotAvatar state="neutral" />);
    expect(setTimeoutSpy).not.toHaveBeenCalled();
  });
});
